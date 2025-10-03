"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Users,
  Loader2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Team {
  _id: string;
  name: string;
  logo?: string;
  teamLogo?: string;
  tournament: {
    _id: string;
    name: string;
  };
  group?: string;
  players?: number;
}

interface Tournament {
  _id: string;
  name: string;
}

export default function TeamManagementPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tournament context from URL
  const tournamentId = searchParams.get("tournament");
  const [tournamentContext, setTournamentContext] = useState<Tournament | null>(
    null
  );

  const [newTeam, setNewTeam] = useState({
    name: "",
    tournamentId: "",
    group: "",
  });
  const [editTeam, setEditTeam] = useState({
    name: "",
    tournamentId: "",
    group: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  useEffect(() => {
    if (tournamentId && tournamentContext) {
      setNewTeam((prev) => ({ ...prev, tournamentId: tournamentId }));
    }
  }, [tournamentId, tournamentContext]);

  const fetchData = async () => {
    if (tournamentId) {
      // Fetch specific tournament and its teams
      await Promise.all([
        fetchTournamentContext(),
        fetchTeamsForTournament(tournamentId),
      ]);
    } else {
      // Fetch all tournaments and teams
      await Promise.all([fetchTournaments(), fetchTeams()]);
    }
  };

  const fetchTournamentContext = async () => {
    if (!tournamentId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${API_URL}/tournaments/${tournamentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setTournamentContext(response.data.tournament);
      }
    } catch (error) {
      console.error("Error fetching tournament context:", error);
    }
  };

  const fetchTeamsForTournament = async (tournamentId: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/teams?tournament=${tournamentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTeams(response.data.teams || []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error loading teams",
          description: error.response?.data?.message || "Failed to load teams",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please login to view tournaments",
          variant: "destructive",
        });
        router.push("/organizer/login");
        return;
      }

      const response = await axios.get(
        `${API_URL}/tournaments/my-tournaments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTournaments(response.data.tournaments || []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error loading tournaments",
          description:
            error.response?.data?.message || "Failed to load tournaments",
          variant: "destructive",
        });
      }
    }
  };

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/teams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTeams(response.data.teams || []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error loading teams",
          description: error.response?.data?.message || "Failed to load teams",
          variant: "destructive",
        });
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

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
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

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTournament =
      tournamentId || // If viewing specific tournament, don't filter by tournament
      selectedTournament === "all" ||
      team.tournament._id === selectedTournament;
    return matchesSearch && matchesTournament;
  });

  const handleAddTeam = async () => {
    if (!newTeam.name || (!newTeam.tournamentId && !tournamentId)) {
      toast({
        title: "Missing required fields",
        description: "Please fill in team name and select a tournament",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", newTeam.name);
      formData.append("tournament", newTeam.tournamentId || tournamentId!);
      if (newTeam.group) {
        formData.append("group", newTeam.group);
      }
      if (logoFile) {
        formData.append("teamLogo", logoFile);
      }

      const response = await axios.post(`${API_URL}/teams`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Team added",
        description: `${newTeam.name} has been successfully added.`,
      });

      // Add new team to the list
      setTeams([...teams, response.data.team]);

      // Reset form
      setIsAddDialogOpen(false);
      setNewTeam({
        name: "",
        tournamentId: tournamentId || "",
        group: "",
      });
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error adding team",
          description: error.response?.data?.message || "Failed to add team",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!teamToDelete) return;
    console.log(teamToDelete);
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");

      await axios.delete(`${API_URL}/teams/${teamToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Team deleted",
        description: `${teamToDelete.name} has been successfully deleted.`,
      });

      // Remove team from the list
      setTeams(teams.filter((t) => t._id !== teamToDelete._id));
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error deleting team",
          description: error.response?.data?.message || "Failed to delete team",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setTeamToDelete(null);
  };

  const handleEditClick = (team: Team) => {
    setTeamToEdit(team);
    setEditTeam({
      name: team.name,
      tournamentId: team.tournament._id,
      group: team.group || "",
    });
    setEditLogoFile(null);
    setEditLogoPreview(
      team.teamLogo ? `http://localhost:4000${team.teamLogo}` : null
    );
    setIsEditDialogOpen(true);
  };

  const handleEditTeam = async () => {
    if (!editTeam.name || !editTeam.tournamentId || !teamToEdit) {
      toast({
        title: "Missing required fields",
        description: "Please fill in team name and select a tournament",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", editTeam.name);
      formData.append("tournamentId", editTeam.tournamentId);
      if (editTeam.group) {
        formData.append("group", editTeam.group);
      }
      if (editLogoFile) {
        formData.append("teamLogo", editLogoFile);
      }

      const response = await axios.put(
        `${API_URL}/teams/${teamToEdit._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Team updated",
        description: `${editTeam.name} has been successfully updated.`,
      });

      // Update team in the list
      setTeams(
        teams.map((t) => (t._id === teamToEdit._id ? response.data.team : t))
      );

      // Reset form and close dialog
      setIsEditDialogOpen(false);
      setTeamToEdit(null);
      setEditTeam({ name: "", tournamentId: "", group: "" });
      setEditLogoFile(null);
      setEditLogoPreview(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error updating team",
          description: error.response?.data?.message || "Failed to update team",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setEditLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditLogoPreview(reader.result as string);
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

  const handleEditDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleEditDragLeave = () => {
    setIsDragging(false);
  };

  const handleEditDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleEditFileSelect(file);
    }
  };

  const handleEditFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleEditFileSelect(file);
    }
  };

  const removeEditLogo = () => {
    setEditLogoFile(null);
    setEditLogoPreview(
      teamToEdit?.teamLogo
        ? `http://localhost:4000${teamToEdit.teamLogo}`
        : null
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {tournamentContext
              ? `Teams - ${tournamentContext.name}`
              : "Team Management"}
          </h1>
          <p className="text-muted-foreground">
            {tournamentContext
              ? "Manage teams for this tournament"
              : "Add and organize teams for your tournaments"}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {tournamentContext
                  ? `Add Team to ${tournamentContext.name}`
                  : "Add New Team"}
              </DialogTitle>
              <DialogDescription>
                {tournamentContext
                  ? "Enter the team details to add them to this tournament"
                  : "Enter the team details to add them to a tournament"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  placeholder="e.g., Thunder FC"
                  value={newTeam.name}
                  onChange={(e) =>
                    setNewTeam({ ...newTeam, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tournament">Tournament *</Label>
                {tournamentContext ? (
                  <Input
                    id="tournament"
                    value={tournamentContext.name}
                    disabled
                    className="bg-muted"
                  />
                ) : (
                  <Select
                    value={newTeam.tournamentId}
                    onValueChange={(value) =>
                      setNewTeam({ ...newTeam, tournamentId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tournament" />
                    </SelectTrigger>
                    <SelectContent>
                      {tournaments.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No tournaments available
                        </div>
                      ) : (
                        tournaments.map((tournament) => (
                          <SelectItem
                            key={tournament._id}
                            value={tournament._id}
                          >
                            {tournament.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="group">Group (Optional)</Label>
                <Input
                  id="group"
                  placeholder="e.g., Group A"
                  value={newTeam.group}
                  onChange={(e) =>
                    setNewTeam({ ...newTeam, group: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Team Logo (Optional)</Label>
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-24 h-24 object-cover rounded-lg mx-auto"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0"
                      onClick={removeLogo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                      isDragging
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("logo-upload")?.click()
                    }
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Drag and drop or click to upload
                    </p>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTeam}
                disabled={
                  !newTeam.name ||
                  (!newTeam.tournamentId && !tournamentId) ||
                  isSubmitting
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Team"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update the team details and logo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTeamName">Team Name *</Label>
              <Input
                id="editTeamName"
                placeholder="e.g., Thunder FC"
                value={editTeam.name}
                onChange={(e) =>
                  setEditTeam({ ...editTeam, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editTournament">Tournament *</Label>
              <Select
                value={editTeam.tournamentId}
                onValueChange={(value) =>
                  setEditTeam({ ...editTeam, tournamentId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tournament" />
                </SelectTrigger>
                <SelectContent>
                  {tournaments.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No tournaments available
                    </div>
                  ) : (
                    tournaments.map((tournament) => (
                      <SelectItem key={tournament._id} value={tournament._id}>
                        {tournament.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editGroup">Group (Optional)</Label>
              <Input
                id="editGroup"
                placeholder="e.g., Group A"
                value={editTeam.group}
                onChange={(e) =>
                  setEditTeam({ ...editTeam, group: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Team Logo (Optional)</Label>
              {editLogoPreview ? (
                <div className="relative">
                  <img
                    src={editLogoPreview}
                    alt="Logo preview"
                    className="w-24 h-24 object-cover rounded-lg mx-auto"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0"
                    onClick={removeEditLogo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    isDragging
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent"
                  )}
                  onDragOver={handleEditDragOver}
                  onDragLeave={handleEditDragLeave}
                  onDrop={handleEditDrop}
                  onClick={() =>
                    document.getElementById("edit-logo-upload")?.click()
                  }
                >
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Drag and drop or click to upload
                  </p>
                  <input
                    id="edit-logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileInputChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditTeam}
              disabled={
                !editTeam.name || !editTeam.tournamentId || isSubmitting
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Team"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {!tournamentId && (
              <Select
                value={selectedTournament}
                onValueChange={setSelectedTournament}
              >
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Filter by tournament" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tournaments</SelectItem>
                  {tournaments.map((tournament) => (
                    <SelectItem key={tournament._id} value={tournament._id}>
                      {tournament.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2 text-muted-foreground">Loading teams...</span>
        </div>
      ) : filteredTeams.length === 0 ? (
        <Card className="glass p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No teams found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedTournament !== "all"
              ? "Try adjusting your filters"
              : "Add teams to your tournaments to get started"}
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Team
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card
              key={team._id}
              className="glass hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={
                          team.teamLogo
                            ? `http://localhost:4000${team.teamLogo}`
                            : "/placeholder.svg"
                        }
                        alt={team.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {team.tournament.name}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {team.group && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Group:</span>
                    <Badge variant="outline">{team.group}</Badge>
                  </div>
                )}
                {team.players !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Players:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {team.players}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleEditClick(team)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive bg-transparent"
                    onClick={() => handleDeleteClick(team)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{teamToDelete?.name}"? This
              action cannot be undone and will remove the team from the
              tournament.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Team
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
