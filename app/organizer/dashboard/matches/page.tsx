"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  CalendarIcon,
  Clock,
  MapPin,
  Play,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Match, Tournament, Team } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MatchManagementPage() {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [newMatch, setNewMatch] = useState({
    tournament: "",
    homeTeam: "",
    awayTeam: "",
    date: undefined as Date | undefined,
    time: "",
    venue: "",
    stage: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchTournaments(), fetchTeams(), fetchMatches()]);
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
    }
  };

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/matches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMatches(response.data.matches || []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error loading matches",
          description:
            error.response?.data?.message || "Failed to load matches",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      match.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTournament =
      selectedTournament === "all" ||
      match.tournament._id === selectedTournament;
    return matchesSearch && matchesTournament;
  });

  const scheduledMatches = filteredMatches.filter(
    (m) => m.status.toLowerCase() === "scheduled"
  );
  const liveMatches = filteredMatches.filter(
    (m) => m.status.toLowerCase() === "playing"
  );
  const completedMatches = filteredMatches.filter(
    (m) => m.status.toLowerCase() === "completed"
  );

  const handleAddMatch = async () => {
    if (
      !newMatch.tournament ||
      !newMatch.homeTeam ||
      !newMatch.awayTeam ||
      !newMatch.date ||
      !newMatch.time ||
      !newMatch.venue ||
      !newMatch.stage
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

      const matchData = {
        tournament: newMatch.tournament,
        homeTeam: newMatch.homeTeam,
        awayTeam: newMatch.awayTeam,
        date: newMatch.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
        time: newMatch.time,
        venue: newMatch.venue,
        stage: newMatch.stage,
      };

      const response = await axios.post(`${API_URL}/matches`, matchData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Match scheduled",
        description: "The match has been successfully scheduled.",
      });

      // Close dialog and reset form
      setIsAddDialogOpen(false);
      setNewMatch({
        tournament: "",
        homeTeam: "",
        awayTeam: "",
        date: undefined,
        time: "",
        venue: "",
        stage: "",
      });

      // Refresh the matches list
      fetchMatches();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error scheduling match",
          description:
            error.response?.data?.message || "Failed to schedule match",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateScore = async (homeScore: number, awayScore: number) => {
    if (!selectedMatch) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/matches/${selectedMatch._id}`,
        {
          homeTeamScore: homeScore,
          awayTeamScore: awayScore,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Score updated",
        description: "Match score has been updated successfully.",
      });

      // Close dialog and refresh list
      setIsScoreDialogOpen(false);
      setSelectedMatch(null);
      fetchMatches();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error updating score",
          description:
            error.response?.data?.message || "Failed to update score",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartMatch = async (match: Match) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/matches/${match._id}`,
        { status: "playing" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Match started",
        description: `${match.homeTeam.name} vs ${match.awayTeam.name} is now live!`,
      });

      // Refresh the matches list
      fetchMatches();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error starting match",
          description: error.response?.data?.message || "Failed to start match",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndMatch = async (match: Match) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/matches/${match._id}`,
        { status: "completed" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Match completed",
        description: "The match has been marked as completed.",
      });

      // Refresh the matches list
      fetchMatches();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error ending match",
          description: error.response?.data?.message || "Failed to end match",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Match Management</h1>
          <p className="text-muted-foreground">
            Schedule matches and update scores in real-time
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Schedule Match
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Match</DialogTitle>
              <DialogDescription>
                Enter the match details to add it to the tournament schedule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tournament">Tournament *</Label>
                <Select
                  value={newMatch.tournament}
                  onValueChange={(value) =>
                    setNewMatch({ ...newMatch, tournament: value })
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeTeam">Home Team *</Label>
                  <Select
                    value={newMatch.homeTeam}
                    onValueChange={(value) =>
                      setNewMatch({ ...newMatch, homeTeam: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.filter(
                        (team) => team.tournament._id === newMatch.tournament
                      ).length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Select tournament first
                        </div>
                      ) : (
                        teams
                          .filter(
                            (team) =>
                              team.tournament._id === newMatch.tournament
                          )
                          .map((team) => (
                            <SelectItem key={team._id} value={team._id}>
                              {team.name}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="awayTeam">Away Team *</Label>
                  <Select
                    value={newMatch.awayTeam}
                    onValueChange={(value) =>
                      setNewMatch({ ...newMatch, awayTeam: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.filter(
                        (team) => team.tournament._id === newMatch.tournament
                      ).length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Select tournament first
                        </div>
                      ) : (
                        teams
                          .filter(
                            (team) =>
                              team.tournament._id === newMatch.tournament &&
                              team._id !== newMatch.homeTeam
                          )
                          .map((team) => (
                            <SelectItem key={team._id} value={team._id}>
                              {team.name}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Match Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-transparent"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newMatch.date
                          ? format(newMatch.date, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newMatch.date}
                        onSelect={(date) => setNewMatch({ ...newMatch, date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Match Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newMatch.time}
                    onChange={(e) =>
                      setNewMatch({ ...newMatch, time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Input
                  id="venue"
                  placeholder="e.g., Central Stadium"
                  value={newMatch.venue}
                  onChange={(e) =>
                    setNewMatch({ ...newMatch, venue: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Stage *</Label>
                <Input
                  id="stage"
                  placeholder="e.g., Quarter Finals"
                  value={newMatch.stage}
                  onChange={(e) =>
                    setNewMatch({ ...newMatch, stage: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMatch}
                disabled={
                  !newMatch.tournament ||
                  !newMatch.homeTeam ||
                  !newMatch.awayTeam ||
                  !newMatch.date ||
                  !newMatch.time ||
                  !newMatch.venue ||
                  !newMatch.stage ||
                  isSubmitting
                }
              >
                Schedule Match
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search matches by team name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Matches Tabs */}
      <Tabs defaultValue="live" className="space-y-6">
        <TabsList className="glass-strong">
          <TabsTrigger value="live" className="gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live ({liveMatches.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({scheduledMatches.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedMatches.length})
          </TabsTrigger>
        </TabsList>

        {/* Live Matches */}
        <TabsContent value="live" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className="ml-2 text-muted-foreground">
                Loading matches...
              </span>
            </div>
          ) : liveMatches.length === 0 ? (
            <Card className="glass p-12 text-center">
              <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No live matches</h3>
              <p className="text-muted-foreground">
                Start a scheduled match to see it here
              </p>
            </Card>
          ) : (
            liveMatches.map((match) => (
              <MatchCard
                key={match._id}
                match={match}
                onUpdateScore={() => {
                  setSelectedMatch(match);
                  setIsScoreDialogOpen(true);
                }}
                onEndMatch={() => handleEndMatch(match)}
                isSubmitting={isSubmitting}
              />
            ))
          )}
        </TabsContent>

        {/* Scheduled Matches */}
        <TabsContent value="scheduled" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className="ml-2 text-muted-foreground">
                Loading matches...
              </span>
            </div>
          ) : scheduledMatches.length === 0 ? (
            <Card className="glass p-12 text-center">
              <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No scheduled matches
              </h3>
              <p className="text-muted-foreground">
                Schedule matches to see them here
              </p>
            </Card>
          ) : (
            scheduledMatches.map((match) => (
              <MatchCard
                key={match._id}
                match={match}
                onStartMatch={() => handleStartMatch(match)}
                isSubmitting={isSubmitting}
              />
            ))
          )}
        </TabsContent>

        {/* Completed Matches */}
        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className="ml-2 text-muted-foreground">
                Loading matches...
              </span>
            </div>
          ) : completedMatches.length === 0 ? (
            <Card className="glass p-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No completed matches
              </h3>
              <p className="text-muted-foreground">
                Completed matches will appear here
              </p>
            </Card>
          ) : (
            completedMatches.map((match) => (
              <MatchCard key={match._id} match={match} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Score Update Dialog */}
      <Dialog open={isScoreDialogOpen} onOpenChange={setIsScoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Match Score</DialogTitle>
            <DialogDescription>
              Enter the current score for this match
            </DialogDescription>
          </DialogHeader>
          {selectedMatch && (
            <ScoreUpdateForm
              match={selectedMatch}
              onUpdate={handleUpdateScore}
              onCancel={() => setIsScoreDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MatchCard({
  match,
  onStartMatch,
  onUpdateScore,
  onEndMatch,
  isSubmitting = false,
}: {
  match: Match;
  onStartMatch?: () => void;
  onUpdateScore?: () => void;
  onEndMatch?: () => void;
  isSubmitting?: boolean;
}) {
  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-500",
    playing: "bg-green-500 animate-pulse",
    completed: "bg-gray-500",
    postponed: "bg-yellow-500",
    cancelled: "bg-red-500",
  };

  const getStatusColor = (status: string) => {
    return statusColors[status.toLowerCase()] || "bg-gray-500";
  };

  const capitalizeStatus = (status: string) => {
    return status
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <Card className="glass-strong hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Match Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {match.stage}
              </Badge>
              <Badge
                className={cn(
                  "text-xs text-white",
                  getStatusColor(match.status)
                )}
              >
                {capitalizeStatus(match.status)}
              </Badge>
            </div>

            {/* Teams */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <img
                      src={
                        match.homeTeam.logo
                          ? `http://localhost:4000${match.homeTeam.logo}`
                          : "/placeholder.svg"
                      }
                      alt={match.homeTeam.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="font-semibold text-lg">
                    {match.homeTeam.name}
                  </span>
                </div>
                {match.homeTeamScore !== undefined && (
                  <span className="text-3xl font-bold w-16 text-center">
                    {match.homeTeamScore}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <img
                      src={
                        match.awayTeam.logo
                          ? `http://localhost:4000${match.awayTeam.logo}`
                          : "/placeholder.svg"
                      }
                      alt={match.awayTeam.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="font-semibold text-lg">
                    {match.awayTeam.name}
                  </span>
                </div>
                {match.awayTeamScore !== undefined && (
                  <span className="text-3xl font-bold w-16 text-center">
                    {match.awayTeamScore}
                  </span>
                )}
              </div>
            </div>

            {/* Match Details */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {match.date && (
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  {format(new Date(match.date), "MMM dd, yyyy")}
                </div>
              )}
              {match.time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {match.time}
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {match.venue}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 min-w-[140px]">
            {match.status.toLowerCase() === "scheduled" && onStartMatch && (
              <Button
                onClick={onStartMatch}
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Match
                  </>
                )}
              </Button>
            )}
            {match.status.toLowerCase() === "playing" && (
              <>
                {onUpdateScore && (
                  <Button
                    onClick={onUpdateScore}
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Update Score
                  </Button>
                )}
                {onEndMatch && (
                  <Button
                    onClick={onEndMatch}
                    variant="outline"
                    className="w-full bg-transparent"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ending...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        End Match
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
            {match.status.toLowerCase() === "completed" && (
              <Button
                variant="outline"
                className="w-full bg-transparent"
                disabled
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Completed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreUpdateForm({
  match,
  onUpdate,
  onCancel,
  isSubmitting = false,
}: {
  match: Match;
  onUpdate: (homeScore: number, awayScore: number) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const [homeScore, setHomeScore] = useState(
    match.homeTeamScore?.toString() || "0"
  );
  const [awayScore, setAwayScore] = useState(
    match.awayTeamScore?.toString() || "0"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(Number.parseInt(homeScore), Number.parseInt(awayScore));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={match.homeTeam.logo || "/placeholder.svg"}
              alt={match.homeTeam.name}
              className="h-8 w-8"
            />
            <span className="font-medium">{match.homeTeam.name}</span>
          </div>
          <Input
            type="number"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-20 text-center text-2xl font-bold"
            min="0"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={match.awayTeam.logo || "/placeholder.svg"}
              alt={match.awayTeam.name}
              className="h-8 w-8"
            />
            <span className="font-medium">{match.awayTeam.name}</span>
          </div>
          <Input
            type="number"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-20 text-center text-2xl font-bold"
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
            "Update Score"
          )}
        </Button>
      </div>
    </form>
  );
}
