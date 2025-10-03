"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Calendar,
  Users,
  Eye,
  Edit,
  MoreVertical,
  Loader2,
  Trash2,
  ArrowLeft,
  MapPin,
  Award,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Tournament {
  _id: string;
  name: string;
  sportType: string;
  status: string;
  startDate: string;
  numberOfParticipants: number;
  matchesTotal?: number;
  matchesCompleted?: number;
  views?: number;
  tournamentFormat?: string;
  description?: string;
  location?: string;
  prizes?: string;
  tournamentBanner?: string;
}

export default function OrganizerTournamentsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] =
    useState<Tournament | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please login to view your tournaments",
          variant: "destructive",
        });
        router.push("/organizer/login");
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/tournaments/my-tournaments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setTournaments(response.data.tournaments);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast({
            title: "Session expired",
            description: "Please login again",
            variant: "destructive",
          });
          router.push("/organizer/login");
        } else {
          toast({
            title: "Error loading tournaments",
            description:
              error.response?.data?.message || "Failed to load tournaments",
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (tournament: Tournament) => {
    setTournamentToDelete(tournament);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tournamentToDelete) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/tournaments/${tournamentToDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Tournament deleted",
        description: `${tournamentToDelete.name} has been successfully deleted.`,
      });

      // Remove the deleted tournament from the list
      setTournaments(
        tournaments.filter((t) => t._id !== tournamentToDelete._id)
      );
      setDeleteDialogOpen(false);
      setTournamentToDelete(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error deleting tournament",
          description:
            error.response?.data?.message || "Failed to delete tournament",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTournamentToDelete(null);
  };

  const statusColors = {
    upcoming: "bg-blue-500",
    inprogress: "bg-green-500",
    finished: "bg-gray-500",
  };

  const getStatusColor = (status: string) => {
    return (
      statusColors[status.toLowerCase() as keyof typeof statusColors] ||
      "bg-gray-500"
    );
  };

  const capitalizeStatus = (status: string) => {
    return status
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/organizer/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">My Tournaments</h1>
            <p className="text-muted-foreground">
              Manage and monitor all your tournaments
            </p>
          </div>
        </div>
        <Button size="lg" asChild>
          <Link href="/organizer/dashboard/create">
            <Trophy className="mr-2 h-5 w-5" />
            Create Tournament
          </Link>
        </Button>
      </div>

      {/* Tournaments List */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>All Tournaments ({tournaments.length})</CardTitle>
          <CardDescription>
            Complete list of your created tournaments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className="ml-2 text-muted-foreground">
                Loading tournaments...
              </span>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tournaments yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first tournament to get started
              </p>
              <Button asChild>
                <Link href="/organizer/dashboard/create">
                  <Trophy className="mr-2 h-4 w-4" />
                  Create Your First Tournament
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <Card
                  key={tournament._id}
                  className="glass-strong hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Tournament Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold">
                            {tournament.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`text-white ${getStatusColor(
                              tournament.status
                            )}`}
                          >
                            {capitalizeStatus(tournament.status)}
                          </Badge>
                          <Badge variant="outline">
                            {tournament.tournamentFormat || "League"}
                          </Badge>
                        </div>

                        {tournament.description && (
                          <p className="text-muted-foreground line-clamp-2">
                            {tournament.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">
                              {tournament.sportType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{tournament.numberOfParticipants} Teams</span>
                          </div>
                          {tournament.startDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {new Date(
                                  tournament.startDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {tournament.views && (
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {tournament.views.toLocaleString()} Views
                              </span>
                            </div>
                          )}
                        </div>

                        {tournament.location && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {tournament.location}
                          </div>
                        )}

                        {tournament.prizes && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            Prize: {tournament.prizes}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 min-w-[200px]">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tournaments/${tournament._id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Public
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tournaments/${tournament._id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/organizer/dashboard/teams?tournament=${tournament._id}`}
                              >
                                Manage Teams
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/organizer/dashboard/matches?tournament=${tournament._id}`}
                              >
                                Manage Matches
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Analytics</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteClick(tournament)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Tournament
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tournament</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{tournamentToDelete?.name}"? This
              action cannot be undone and will permanently delete all tournament
              data including matches, teams, and statistics.
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
                  Delete Tournament
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
