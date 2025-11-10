"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  User,
  Mail,
  Building2,
  Phone,
  Briefcase,
  ArrowLeft,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  organization?: string;
  phoneNumber?: string;
  experience?: string;
}

interface FormData {
  name: string;
  organization: string;
  phoneNumber: string;
  experience: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    organization: "",
    phoneNumber: "",
    experience: "",
  });

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please login to continue",
          variant: "destructive",
        });
        router.push("/organizer/login");
        return;
      }

      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.user) {
        setUser(response.data.user);
        setFormData({
          name: response.data.user.name || "",
          organization: response.data.user.organization || "",
          phoneNumber: response.data.user.phoneNumber || "",
          experience: response.data.user.experience || "",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast({
            title: "Session expired",
            description: "Please login again",
            variant: "destructive",
          });
          localStorage.removeItem("token");
          router.push("/organizer/login");
          return;
        }

        toast({
          title: "Error loading profile",
          description:
            error.response?.data?.message || "Failed to load profile",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    // Name is required
    if (!formData.name || formData.name.trim().length < 2) {
      toast({
        title: "Validation error",
        description: "Name must be at least 2 characters",
        variant: "destructive",
      });
      return false;
    }

    if (formData.name.length > 100) {
      toast({
        title: "Validation error",
        description: "Name must be less than 100 characters",
        variant: "destructive",
      });
      return false;
    }

    // Organization max 100 chars
    if (formData.organization && formData.organization.length > 100) {
      toast({
        title: "Validation error",
        description: "Organization must be less than 100 characters",
        variant: "destructive",
      });
      return false;
    }

    // Experience max 100 chars
    if (formData.experience && formData.experience.length > 100) {
      toast({
        title: "Validation error",
        description: "Experience must be less than 100 characters",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please login to continue",
          variant: "destructive",
        });
        router.push("/organizer/login");
        return;
      }

      // Build update payload - only include non-empty fields
      const updateData: Record<string, string> = {
        name: formData.name,
      };

      if (formData.organization) {
        updateData.organization = formData.organization;
      }
      if (formData.phoneNumber) {
        updateData.phoneNumber = formData.phoneNumber;
      }
      if (formData.experience) {
        updateData.experience = formData.experience;
      }

      const response = await axios.put(`${API_URL}/user/profile`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.user) {
        setUser(response.data.user);
        setFormData({
          name: response.data.user.name || "",
          organization: response.data.user.organization || "",
          phoneNumber: response.data.user.phoneNumber || "",
          experience: response.data.user.experience || "",
        });
        setIsEditing(false);

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });

        // Dispatch custom event to update navigation
        window.dispatchEvent(new Event("authChange"));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast({
            title: "Session expired",
            description: "Please login again",
            variant: "destructive",
          });
          localStorage.removeItem("token");
          router.push("/organizer/login");
          return;
        }

        toast({
          title: "Error updating profile",
          description:
            error.response?.data?.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        organization: user.organization || "",
        phoneNumber: user.phoneNumber || "",
        experience: user.experience || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Card className="glass border-destructive/50">
            <CardContent className="pt-6">
              <p className="text-center text-destructive">
                Failed to load profile. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">User Profile</h1>
              <p className="text-muted-foreground">
                Manage your account settings
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="glass mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Address
            </CardTitle>
            <CardDescription>
              Your email cannot be changed through this form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={user.email}
              disabled
              className="bg-muted/50 text-muted-foreground"
            />
          </CardContent>
        </Card>

        {/* Editable Profile Card */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            {!isEditing && (
              <CardDescription>
                Click edit to update your profile
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.name.length}/100 characters
                  </p>
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <Label
                    htmlFor="organization"
                    className="flex items-center gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    Organization
                  </Label>
                  <Input
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="e.g., Sports Association, Club Name"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.organization.length}/100 characters
                  </p>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phoneNumber"
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label
                    htmlFor="experience"
                    className="flex items-center gap-2"
                  >
                    <Briefcase className="h-4 w-4" />
                    Experience
                  </Label>
                  <Input
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="e.g., 5 years in sports management"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.experience.length}/100 characters
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Name */}
                <div className="pb-4 border-b border-border/50">
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                    <User className="h-4 w-4" />
                    Full Name
                  </p>
                  <p className="text-lg font-semibold">{user.name}</p>
                </div>

                {/* Organization */}
                <div className="pb-4 border-b border-border/50">
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4" />
                    Organization
                  </p>
                  <p className="text-lg font-semibold">
                    {user.organization || "Not set"}
                  </p>
                </div>

                {/* Phone Number */}
                <div className="pb-4 border-b border-border/50">
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </p>
                  <p className="text-lg font-semibold">
                    {user.phoneNumber || "Not set"}
                  </p>
                </div>

                {/* Experience */}
                <div className="pb-4">
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4" />
                    Experience
                  </p>
                  <p className="text-lg font-semibold">
                    {user.experience || "Not set"}
                  </p>
                </div>

                {/* Edit Button */}
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-6"
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
