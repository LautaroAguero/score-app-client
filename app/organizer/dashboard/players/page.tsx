"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Calendar,
} from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Loader2,
  CalendarIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Player {
  _id: string;
  name: string;
  number: number;
  position: string;
  team: {
    _id: string;
    name: string;
  };
  height?: number;
  weight?: number;
  dateOfBirth?: string;
  nationality?: string;
}

interface Team {
  _id: string;
  name: string;
}

interface Tournament {
  _id: string;
  name: string;
}

export default function PlayerManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newPlayer, setNewPlayer] = useState({
    name: "",
    number: "",
    position: "",
    team: "",
    height: "",
    weight: "",
    dateOfBirth: undefined as Date | undefined,
    nationality: "",
  });

  const [editPlayer, setEditPlayer] = useState({
    name: "",
    number: "",
    position: "",
    height: "",
    weight: "",
    dateOfBirth: undefined as Date | undefined,
    nationality: "",
  });

  useEffect(() => {
    fetchData();
  }, [selectedTournament, selectedTeam]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please login to view players",
          variant: "destructive",
        });
        router.push("/organizer/login");
        return;
      }

      // Fetch tournaments
      const tournamentsRes = await axios.get(
        `${API_URL}/tournaments/my-tournaments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTournaments(tournamentsRes.data.tournaments || []);

      // Fetch teams for selected tournament
      let teamsRes;
      if (selectedTournament !== "all") {
        teamsRes = await axios.get(`${API_URL}/teams?tournament=${selectedTournament}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        teamsRes = await axios.get(`${API_URL}/teams`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setTeams(teamsRes.data.teams || []);

      // Fetch players for selected team
      let playersRes;
      if (selectedTeam !== "all") {
        playersRes = await axios.get(`${API_URL}/players?team=${selectedTeam}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (selectedTournament !== "all") {
        // Fetch players for all teams in selected tournament
        playersRes = await axios.get(
          `${API_URL}/players?tournament=${selectedTournament}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        playersRes = await axios.get(`${API_URL}/players`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setPlayers(playersRes.data.players || []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error loading data",
          description:
            error.response?.data?.message || "Failed to load data",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTeam =
      selectedTeam === "all" || player.team._id === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  const handleAddPlayer = async () => {
    if (
      !newPlayer.name ||
      !newPlayer.number ||
      !newPlayer.position ||
      !newPlayer.team
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const number = parseInt(newPlayer.number);
    if (number < 0 || number > 99) {
      toast({
        title: "Invalid number",
        description: "Player number must be between 0 and 99",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const playerData = {
        name: newPlayer.name,
        number,
        position: newPlayer.position,
        team: newPlayer.team,
        height: newPlayer.height ? parseInt(newPlayer.height) : undefined,
        weight: newPlayer.weight ? parseInt(newPlayer.weight) : undefined,
        dateOfBirth: newPlayer.dateOfBirth
          ? newPlayer.dateOfBirth.toISOString()
          : undefined,
        nationality: newPlayer.nationality || undefined,
      };

      await axios.post(`${API_URL}/players`, playerData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Player created",
        description: `${newPlayer.name} has been added successfully.`,
      });

      setIsAddDialogOpen(false);
      setNewPlayer({
        name: "",
        number: "",
        position: "",
        team: "",
        height: "",
        weight: "",
        dateOfBirth: undefined,
        nationality: "",
      });

      fetchData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error creating player",
          description:
            error.response?.data?.message || "Failed to create player",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (player: Player) => {
    setPlayerToEdit(player);
    setEditPlayer({
      name: player.name,
      number: player.number.toString(),
      position: player.position,
      height: player.height?.toString() || "",
      weight: player.weight?.toString() || "",
      dateOfBirth: player.dateOfBirth
        ? new Date(player.dateOfBirth)
        : undefined,
      nationality: player.nationality || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditPlayer = async () => {
    if (!playerToEdit) return;

    if (!editPlayer.name || !editPlayer.number || !editPlayer.position) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const number = parseInt(editPlayer.number);
    if (number < 0 || number > 99) {
      toast({
        title: "Invalid number",
        description: "Player number must be between 0 and 99",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const playerData = {
        name: editPlayer.name,
        number,
        position: editPlayer.position,
        height: editPlayer.height ? parseInt(editPlayer.height) : undefined,
        weight: editPlayer.weight ? parseInt(editPlayer.weight) : undefined,
        dateOfBirth: editPlayer.dateOfBirth
          ? editPlayer.dateOfBirth.toISOString()
          : undefined,
        nationality: editPlayer.nationality || undefined,
      };

      await axios.put(`${API_URL}/players/${playerToEdit._id}`, playerData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Player updated",
        description: `${editPlayer.name} has been updated successfully.`,
      });

      setIsEditDialogOpen(false);
      setPlayerToEdit(null);
      fetchData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error updating player",
          description:
            error.response?.data?.message || "Failed to update player",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (player: Player) => {
    setPlayerToDelete(player);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!playerToDelete) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");

      await axios.delete(`${API_URL}/players/${playerToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Player deleted",
        description: `${playerToDelete.name} has been deleted.`,
      });

      setPlayers(players.filter((p) => p._id !== playerToDelete._id));
      setIsDeleteDialogOpen(false);
      setPlayerToDelete(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error deleting player",
          description:
            error.response?.data?.message || "Failed to delete player",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setPlayerToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Player Management</h1>
          <p className="text-muted-foreground">
            Manage players for your teams
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Player</DialogTitle>
              <DialogDescription>
                Enter the player details to add them to a team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newPlayer.name}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Number * (0-99)</Label>
                  <Input
                    id="number"
                    type="number"
                    value={newPlayer.number}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, number: e.target.value })
                    }
                    placeholder="10"
                    min="0"
                    max="99"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Select
                    value={newPlayer.position}
                    onValueChange={(value) =>
                      setNewPlayer({ ...newPlayer, position: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                      <SelectItem value="defender">Defender</SelectItem>
                      <SelectItem value="midfielder">Midfielder</SelectItem>
                      <SelectItem value="forward">Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">Team *</Label>
                <Select
                  value={newPlayer.team}
                  onValueChange={(value) =>
                    setNewPlayer({ ...newPlayer, team: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No teams available
                      </div>
                    ) : (
                      teams.map((team) => (
                        <SelectItem key={team._id} value={team._id}>
                          {team.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={newPlayer.height}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, height: e.target.value })
                    }
                    placeholder="180"
                    min="50"
                    max="300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={newPlayer.weight}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, weight: e.target.value })
                    }
                    placeholder="80"
                    min="20"
                    max="200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newPlayer.dateOfBirth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newPlayer.dateOfBirth
                        ? format(newPlayer.dateOfBirth, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newPlayer.dateOfBirth}
                      onSelect={(date) =>
                        setNewPlayer({ ...newPlayer, dateOfBirth: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={newPlayer.nationality}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, nationality: e.target.value })
                  }
                  placeholder="Argentina"
                />
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
              <Button onClick={handleAddPlayer} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Player"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={selectedTournament} onValueChange={setSelectedTournament}>
          <SelectTrigger className="w-full md:w-48">
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

        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team._id} value={team._id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Players List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2 text-muted-foreground">Loading players...</span>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4 text-center">
              {searchQuery
                ? "No players found matching your search"
                : "No players yet. Add your first player!"}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Player
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPlayers.map((player) => (
            <Card key={player._id} className="glass-strong hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-lg">
                        {player.number}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{player.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {player.team.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{player.position}</Badge>
                      {player.height && (
                        <Badge variant="outline">{player.height} cm</Badge>
                      )}
                      {player.weight && (
                        <Badge variant="outline">{player.weight} kg</Badge>
                      )}
                      {player.nationality && (
                        <Badge variant="outline">{player.nationality}</Badge>
                      )}
                    </div>

                    {player.dateOfBirth && (
                      <p className="text-xs text-muted-foreground">
                        DOB: {format(new Date(player.dateOfBirth), "MMM dd, yyyy")}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(player)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(player)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
            <DialogDescription>
              Update player information
            </DialogDescription>
          </DialogHeader>
          {playerToEdit && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editPlayer.name}
                  onChange={(e) =>
                    setEditPlayer({ ...editPlayer, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-number">Number * (0-99)</Label>
                  <Input
                    id="edit-number"
                    type="number"
                    value={editPlayer.number}
                    onChange={(e) =>
                      setEditPlayer({ ...editPlayer, number: e.target.value })
                    }
                    placeholder="10"
                    min="0"
                    max="99"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-position">Position *</Label>
                  <Select
                    value={editPlayer.position}
                    onValueChange={(value) =>
                      setEditPlayer({ ...editPlayer, position: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                      <SelectItem value="defender">Defender</SelectItem>
                      <SelectItem value="midfielder">Midfielder</SelectItem>
                      <SelectItem value="forward">Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-height">Height (cm)</Label>
                  <Input
                    id="edit-height"
                    type="number"
                    value={editPlayer.height}
                    onChange={(e) =>
                      setEditPlayer({ ...editPlayer, height: e.target.value })
                    }
                    placeholder="180"
                    min="50"
                    max="300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-weight">Weight (kg)</Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    value={editPlayer.weight}
                    onChange={(e) =>
                      setEditPlayer({ ...editPlayer, weight: e.target.value })
                    }
                    placeholder="80"
                    min="20"
                    max="200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editPlayer.dateOfBirth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editPlayer.dateOfBirth
                        ? format(editPlayer.dateOfBirth, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editPlayer.dateOfBirth}
                      onSelect={(date) =>
                        setEditPlayer({ ...editPlayer, dateOfBirth: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nationality">Nationality</Label>
                <Input
                  id="edit-nationality"
                  value={editPlayer.nationality}
                  onChange={(e) =>
                    setEditPlayer({
                      ...editPlayer,
                      nationality: e.target.value,
                    })
                  }
                  placeholder="Argentina"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEditPlayer} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Player"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Player</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{playerToDelete?.name}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
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
                "Delete Player"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
