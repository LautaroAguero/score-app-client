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
  TrendingUp,
  Plus,
  Eye,
  Edit,
  MoreVertical,
  Loader2,
  Trash2,
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
}

export default function OrganizerDashboardPage() {
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
        console.log(response.data);
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

  const totalTeams =
    tournaments && tournaments.length > 0
      ? tournaments.reduce((sum, t) => sum + (t.numberOfParticipants || 0), 0)
      : 0;

  const totalViews =
    tournaments && tournaments.length > 0
      ? tournaments.reduce((sum, t) => sum + (t.views || 0), 0)
      : 0;

  const activeTournaments =
    tournaments && tournaments.length > 0
      ? tournaments.filter(
          (t) => t.status === "In Progress" || t.status === "Active"
        ).length
      : 0;

  const stats = [
    {
      title: "Total Tournaments",
      value: tournaments ? tournaments.length.toString() : "0",
      change: `${activeTournaments} active`,
      icon: Trophy,
      color: "text-accent",
    },
    {
      title: "Active Tournaments",
      value: activeTournaments.toString(),
      change: "Currently running",
      icon: Calendar,
      color: "text-green-500",
    },
    {
      title: "Total Teams",
      value: totalTeams.toString(),
      change: "All tournaments",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Views",
      value:
        totalViews > 1000
          ? `${(totalViews / 1000).toFixed(1)}K`
          : totalViews.toString(),
      change: "All time",
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ];

  const statusColors = {
    Upcoming: "bg-blue-500",
    "In Progress": "bg-green-500",
    Active: "bg-green-500",
    Completed: "bg-gray-500",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your tournaments.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/organizer/dashboard/create">
            <Plus className="mr-2 h-5 w-5" />
            Create Tournament
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Tournaments */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Tournaments</CardTitle>
              <CardDescription>
                Manage and monitor your active tournaments
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/organizer/dashboard/tournaments">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className="ml-2 text-muted-foreground">
                Loading tournaments...
              </span>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No tournaments yet</p>
              <Button asChild>
                <Link href="/organizer/dashboard/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Tournament
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <div
                  key={tournament._id}
                  className="glass-strong rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {tournament.name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`text-white ${
                            statusColors[
                              tournament.status as keyof typeof statusColors
                            ] || "bg-gray-500"
                          }`}
                        >
                          {tournament.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          {tournament.sportType}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {tournament.numberOfParticipants} Teams
                        </div>
                        {tournament.matchesTotal &&
                          tournament.matchesCompleted !== undefined && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {tournament.matchesCompleted}/
                              {tournament.matchesTotal} Matches
                            </div>
                          )}
                        {tournament.views && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {tournament.views.toLocaleString()} Views
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tournaments/${tournament._id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
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
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Manage Teams</DropdownMenuItem>
                          <DropdownMenuItem>Manage Matches</DropdownMenuItem>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/organizer/dashboard/matches">
            <CardHeader>
              <Calendar className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">Manage Matches</CardTitle>
              <CardDescription>Update scores and schedules</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="glass hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/organizer/dashboard/teams">
            <CardHeader>
              <Users className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">Manage Teams</CardTitle>
              <CardDescription>Add and organize teams</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="glass hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/organizer/dashboard/analytics">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">View Analytics</CardTitle>
              <CardDescription>Track engagement metrics</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>

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
