"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, Plus, Upload, Loader2, X } from "lucide-react";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface QuickCreateTeamProps {
  tournamentId: string;
  onTeamCreated: (newTeamId: string, newTeam: any) => void;
}

export function QuickCreateTeam({
  tournamentId,
  onTeamCreated,
}: QuickCreateTeamProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    group: "none",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelection(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please drop an image file",
        variant: "destructive",
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a team name",
        variant: "destructive",
      });
      return;
    }

    if (formData.name.length < 2 || formData.name.length > 100) {
      toast({
        title: "Validation error",
        description: "Team name must be between 2 and 100 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const createFormData = new FormData();
      createFormData.append("name", formData.name);
      createFormData.append("tournament", tournamentId);
      if (formData.group && formData.group !== "none") {
        createFormData.append("group", formData.group);
      }
      if (logoFile) {
        createFormData.append("teamLogo", logoFile);
      }

      const response = await axios.post(`${API_URL}/teams`, createFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const newTeam = response.data.team || response.data;

      toast({
        title: "Success",
        description: "Team created successfully!",
      });

      // Reset form
      setFormData({ name: "", group: "none" });
      setLogoFile(null);
      setLogoPreview(null);
      setIsExpanded(false);

      // Notify parent
      onTeamCreated(newTeam._id, newTeam);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error creating team",
          description: error.response?.data?.message || "Failed to create team",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full hover:opacity-80 transition-opacity"
        >
          <CardTitle>Create New Team</CardTitle>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Team Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter team name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isSubmitting}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {formData.name.length}/100
              </p>
            </div>

            {/* Group Select (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="group">Group (Optional)</Label>
              <Select
                value={formData.group}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, group: value }))
                }
              >
                <SelectTrigger id="group" disabled={isSubmitting}>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="A">Group A</SelectItem>
                  <SelectItem value="B">Group B</SelectItem>
                  <SelectItem value="C">Group C</SelectItem>
                  <SelectItem value="D">Group D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Team Logo (Optional)</Label>

              {logoPreview ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveLogo}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                    transition-colors
                    ${
                      isDragging
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-border hover:border-blue-500"
                    }
                  `}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">
                    Drag and drop your logo here
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    or click to select
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    disabled={isSubmitting}
                    className="hidden"
                    id="logo-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("logo-input")?.click()
                    }
                    disabled={isSubmitting}
                  >
                    Browse Files
                  </Button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className="flex-1"
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isSubmitting ? "Creating..." : "Create & Add"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpanded(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
