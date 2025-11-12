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
  ChevronDown,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

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

interface Match {
  _id: string;
  homeTeam: { _id: string; name: string };
  awayTeam: { _id: string; name: string };
  matchDate: string;
  matchTime: string;
  scores?: { home: number; away: number };
  status: string;
}

interface Team {
  _id: string;
  name: string;
  group?: string;
  wins?: number;
  draws?: number;
  losses?: number;
  points?: number;
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

  // States for more info dialog
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [standingsData, setStandingsData] = useState<Team[]>([]);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

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

  const handleShowMoreInfo = async (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setInfoDialogOpen(true);
    setIsLoadingInfo(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch upcoming matches
      const matchesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/matches?tournament=${tournament._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Filter upcoming matches (status !== 'finished')
      const upcoming = (matchesResponse.data.matches || [])
        .filter((match: Match) => match.status !== "finished")
        .slice(0, 5); // Show only 5 upcoming matches

      setUpcomingMatches(upcoming);

      // Fetch teams for standings
      const teamsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/teams?tournament=${tournament._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Sort by points
      const standings = (teamsResponse.data.teams || []).sort(
        (a: Team, b: Team) => (b.points || 0) - (a.points || 0)
      );

      setStandingsData(standings);
    } catch (error) {
      console.error("Error loading tournament info:", error);
      toast({
        title: "Error",
        description: "Failed to load tournament details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInfo(false);
    }
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
      ? tournaments.filter((t) => t.status === "inprogress").length
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
    upcoming: "bg-blue-500",
    inprogress: "bg-green-500",
    finished: "bg-gray-500",
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
                      {tournament.status === "setup" ? (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          asChild
                        >
                          <Link
                            href={`/organizer/dashboard/tournaments/${tournament._id}/setup`}
                          >
                            <Trophy className="mr-2 h-4 w-4" />
                            Setup
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowMoreInfo(tournament)}
                        >
                          <ChevronDown className="mr-2 h-4 w-4" />
                          More Info
                        </Button>
                      )}
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

      {/* Tournament Info Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedTournament?.name}
            </DialogTitle>
            <DialogDescription>
              Tournament details and upcoming matches
            </DialogDescription>
          </DialogHeader>

          {isLoadingInfo ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-accent mr-2" />
              <span className="text-muted-foreground">
                Loading tournament details...
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Setup Alert Banner */}
              {selectedTournament?.status === "setup" ||
              (selectedTournament?.status === "draft" &&
                selectedTournament?.numberOfParticipants === 0) ? (
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4 flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-700">
                      Tournament setup pending
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      This tournament is ready to be configured. Click the
                      "Setup Tournament" button to add teams, generate matches,
                      and schedule games.
                    </p>
                  </div>
                </div>
              ) : null}
              {/* Upcoming Matches */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Upcoming Matches</h3>
                {upcomingMatches.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingMatches.map((match) => (
                      <div
                        key={match._id}
                        className="glass-strong rounded-lg p-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-center flex-1">
                                {match.homeTeam.name}
                              </div>
                              <div className="px-3 font-bold text-lg">VS</div>
                              <div className="font-semibold text-center flex-1">
                                {match.awayTeam.name}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground text-center">
                              {match.matchDate &&
                                format(
                                  new Date(match.matchDate),
                                  "MMM dd, yyyy"
                                )}{" "}
                              at {match.matchTime}
                            </div>
                          </div>
                          <Badge variant="outline">{match.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No upcoming matches
                  </p>
                )}
              </div>

              {/* Standings Table */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Standings</h3>
                {standingsData.length > 0 ? (
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-12">Pos</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-center w-12">W</TableHead>
                          <TableHead className="text-center w-12">D</TableHead>
                          <TableHead className="text-center w-12">L</TableHead>
                          <TableHead className="text-right w-16">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {standingsData.map((team, index) => (
                          <TableRow
                            key={team._id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-semibold">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {team.name}
                            </TableCell>
                            <TableCell className="text-center">
                              {team.wins || 0}
                            </TableCell>
                            <TableCell className="text-center">
                              {team.draws || 0}
                            </TableCell>
                            <TableCell className="text-center">
                              {team.losses || 0}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {team.points || 0}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No standings data available
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex-col-reverse sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setInfoDialogOpen(false)}>
              Close
            </Button>
            {selectedTournament?.status === "setup" ||
            (selectedTournament?.status === "draft" &&
              selectedTournament?.numberOfParticipants === 0) ? (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link
                  href={`/organizer/dashboard/tournaments/${selectedTournament?._id}/setup`}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Setup Tournament
                </Link>
              </Button>
            ) : null}
            <Button asChild>
              <Link href={`/tournaments/${selectedTournament?._id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Full Tournament
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
