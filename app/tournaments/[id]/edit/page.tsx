"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Upload,
  Loader2,
  ArrowLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditTournamentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tournament, setTournament] = useState<any>(null);

  // Form fields
  const [name, setName] = useState("");
  const [sportType, setSportType] = useState("");
  const [tournamentFormat, setTournamentFormat] = useState("");
  const [numberOfParticipants, setNumberOfParticipants] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [prizes, setPrizes] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [pointsForWin, setPointsForWin] = useState("3");
  const [pointsForDraw, setPointsForDraw] = useState("1");
  const [pointsForLoss, setPointsForLoss] = useState("0");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [existingBanner, setExistingBanner] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchTournament();
  }, [params.id]);

  const fetchTournament = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please login to edit tournaments",
          variant: "destructive",
        });
        router.push("/organizer/login");
        return;
      }

      const response = await axios.get(`${API_URL}/tournaments/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data.tournament;
      setTournament(data);

      // Populate form fields
      setName(data.name || "");
      setSportType(data.sportType || "");
      setTournamentFormat(data.tournamentFormat || "");
      setNumberOfParticipants(data.numberOfParticipants?.toString() || "");
      setLocation(data.location || "");
      setDescription(data.description || "");
      setRules(data.rules || "");
      setPrizes(data.prizes || "");
      setPointsForWin(data.pointsForWin?.toString() || "3");
      setPointsForDraw(data.pointsForDraw?.toString() || "1");
      setPointsForLoss(data.pointsForLoss?.toString() || "0");

      if (data.startDate) {
        setStartDate(new Date(data.startDate));
      }
      if (data.endDate) {
        setEndDate(new Date(data.endDate));
      }
      if (data.tournamentBanner) {
        setExistingBanner(data.tournamentBanner);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error loading tournament",
          description:
            error.response?.data?.message || "Failed to load tournament",
          variant: "destructive",
        });
        router.push("/organizer/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name ||
      !sportType ||
      !tournamentFormat ||
      !numberOfParticipants ||
      !location
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("sportType", sportType);
      formData.append("tournamentFormat", tournamentFormat);
      formData.append("numberOfParticipants", numberOfParticipants);
      formData.append("location", location);
      formData.append("description", description);
      formData.append("rules", rules);
      formData.append("prizes", prizes);
      formData.append("pointsForWin", pointsForWin);
      formData.append("pointsForDraw", pointsForDraw);
      formData.append("pointsForLoss", pointsForLoss);

      if (startDate) {
        formData.append("startDate", startDate.toISOString());
      }
      if (endDate) {
        formData.append("endDate", endDate.toISOString());
      }
      if (bannerFile) {
        formData.append("tournamentBanner", bannerFile);
      }

      await axios.put(`${API_URL}/tournaments/${params.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Tournament updated",
        description: "Your tournament has been successfully updated.",
      });

      router.push(`/tournaments/${params.id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error updating tournament",
          description:
            error.response?.data?.message || "Failed to update tournament",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Tournament Not Found</h2>
          <Button onClick={() => router.push("/organizer/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/tournaments/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tournament
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Edit Tournament</h1>
        <p className="text-muted-foreground">
          Update your tournament details and settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential details about your tournament
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Summer Championship 2025"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sportType">Sport Type *</Label>
                <Select value={sportType} onValueChange={setSportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soccer">Soccer</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="volleyball">Volleyball</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                    <SelectItem value="cricket">Cricket</SelectItem>
                    <SelectItem value="rugby">Rugby</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Tournament Format *</Label>
                <Select
                  value={tournamentFormat}
                  onValueChange={setTournamentFormat}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="league">League</SelectItem>
                    <SelectItem value="knockout">Knockout</SelectItem>
                    <SelectItem value="round-robin">Round Robin</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="participants">Number of Participants *</Label>
                <Input
                  id="participants"
                  type="number"
                  value={numberOfParticipants}
                  onChange={(e) => setNumberOfParticipants(e.target.value)}
                  placeholder="8"
                  min="2"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="New York, USA"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Set tournament dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tournament Details */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Tournament Details</CardTitle>
            <CardDescription>
              Additional information and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your tournament..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rules">Rules & Regulations</Label>
              <Textarea
                id="rules"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Tournament rules and regulations..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizes">Prizes</Label>
              <Textarea
                id="prizes"
                value={prizes}
                onChange={(e) => setPrizes(e.target.value)}
                placeholder="Prize details..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Scoring System */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Scoring System</CardTitle>
            <CardDescription>Define points for match outcomes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pointsWin">Points for Win</Label>
                <Input
                  id="pointsWin"
                  type="number"
                  value={pointsForWin}
                  onChange={(e) => setPointsForWin(e.target.value)}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pointsDraw">Points for Draw</Label>
                <Input
                  id="pointsDraw"
                  type="number"
                  value={pointsForDraw}
                  onChange={(e) => setPointsForDraw(e.target.value)}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pointsLoss">Points for Loss</Label>
                <Input
                  id="pointsLoss"
                  type="number"
                  value={pointsForLoss}
                  onChange={(e) => setPointsForLoss(e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tournament Banner */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Tournament Banner</CardTitle>
            <CardDescription>
              Upload a banner image for your tournament (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingBanner && !bannerPreview && (
              <div className="space-y-2">
                <Label>Current Banner</Label>
                <div className="relative">
                  <img
                    src={`http://localhost:4000${existingBanner}`}
                    alt="Current banner"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              </div>
            )}

            {bannerPreview ? (
              <div className="space-y-2">
                <Label>New Banner Preview</Label>
                <div className="relative">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeBanner}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragging
                    ? "border-accent bg-accent/10"
                    : "border-muted-foreground/25 hover:border-accent"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() =>
                  document.getElementById("banner-upload")?.click()
                }
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your banner here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </p>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/tournaments/${params.id}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Tournament"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
