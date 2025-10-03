"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import {
  Search,
  Grid3x3,
  List,
  Filter,
  CalendarIcon,
  MapPin,
  Users,
  Trophy,
  Clock,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type {
  Tournament,
  SportType,
  TournamentStatus,
  TournamentFormat,
} from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const sportTypes: SportType[] = [
  "Soccer",
  "Basketball",
  "Tennis",
  "Volleyball",
  "Cricket",
  "Baseball",
  "Rugby",
  "Hockey",
];
const statusTypes: TournamentStatus[] = [
  "Upcoming",
  "In Progress",
  "Completed",
];

export default function TournamentsPage() {
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/tournaments`);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tournaments
  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch =
      tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tournament.location?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false) ||
      (tournament.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ??
        false);
    const matchesSport =
      selectedSport === "all" || tournament.sportType === selectedSport;
    const matchesStatus =
      selectedStatus === "all" || tournament.status === selectedStatus;
    const matchesFormat =
      selectedFormat === "all" ||
      tournament.tournamentFormat === selectedFormat;

    let matchesDate = true;
    if (dateRange.from && tournament.startDate) {
      const tournamentStart = new Date(tournament.startDate);
      matchesDate = tournamentStart >= dateRange.from;
      if (dateRange.to) {
        matchesDate = matchesDate && tournamentStart <= dateRange.to;
      }
    }

    return (
      matchesSearch &&
      matchesSport &&
      matchesStatus &&
      matchesFormat &&
      matchesDate
    );
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSport("all");
    setSelectedStatus("all");
    setSelectedFormat("all");
    setDateRange({});
  };

  const hasActiveFilters =
    searchQuery ||
    selectedSport !== "all" ||
    selectedStatus !== "all" ||
    selectedFormat !== "all" ||
    dateRange.from;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Browse Tournaments</h1>
        <p className="text-lg text-muted-foreground">
          Discover and join exciting sports tournaments from around the world
        </p>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tournaments by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-accent text-accent-foreground")}
          >
            <Filter className="h-5 w-5" />
          </Button>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3x3 className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6 glass animate-in slide-in-from-top-2">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>Refine your tournament search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Sport Filter */}
              <div className="space-y-2">
                <Label>Sport Type</Label>
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="soccer">Soccer</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="volleyball">Volleyball</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                    <SelectItem value="rugby">Rugby</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Tournament Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="inprogress">In Progress</SelectItem>
                    <SelectItem value="finished">Finished</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Format Filter */}
              <div className="space-y-2">
                <Label>Tournament Format</Label>
                <Select
                  value={selectedFormat}
                  onValueChange={setSelectedFormat}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Formats</SelectItem>
                    <SelectItem value="league">League</SelectItem>
                    <SelectItem value="knockout">Knockout</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label>Start Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-transparent"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) =>
                        setDateRange({ from: range?.from, to: range?.to })
                      }
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2 text-muted-foreground">
            Loading tournaments...
          </span>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredTournaments.length} tournament
            {filteredTournaments.length !== 1 ? "s" : ""}
          </div>

          {/* Tournament Grid/List */}
          {filteredTournaments.length === 0 ? (
            <Card className="glass p-12 text-center">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No tournaments found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters}>Clear Filters</Button>
              )}
            </Card>
          ) : (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
              )}
            >
              {filteredTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament._id}
                  tournament={tournament}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TournamentCard({
  tournament,
  viewMode,
}: {
  tournament: Tournament;
  viewMode: "grid" | "list";
}) {
  const statusColors = {
    upcoming: "bg-blue-500",
    inprogress: "bg-green-500",
    finished: "bg-gray-500",
  };

  if (viewMode === "list") {
    return (
      <Card className="glass hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-accent text-accent-foreground"
                >
                  {tournament.sportType}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn("text-white", statusColors[tournament.status])}
                >
                  {tournament.status === "upcoming"
                    ? "Upcoming"
                    : tournament.status === "inprogress"
                    ? "In Progress"
                    : "Finished"}
                </Badge>
                <Badge variant="outline">{tournament.tournamentFormat}</Badge>
              </div>

              <h3 className="text-2xl font-bold">{tournament.name}</h3>

              <p className="text-muted-foreground line-clamp-2">
                {tournament.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {tournament.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{tournament.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{tournament.numberOfParticipants} Participants</span>
                </div>
                {tournament.startDate && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(tournament.startDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}
                {tournament.prizes && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span>{tournament.prizes}</span>
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                Organized by{" "}
                <span className="font-medium text-foreground">
                  {tournament.createdBy.name}
                </span>
              </div>
            </div>

            <div className="flex md:flex-col justify-between md:justify-center gap-2">
              <Button asChild className="w-full md:w-auto">
                <Link href={`/tournaments/${tournament._id}`}>
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            tournament.tournamentBanner
              ? `http://localhost:4000${tournament.tournamentBanner}`
              : `/.jpg?height=200&width=400&query=${tournament.sportType}-tournament`
          }
          alt={tournament.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge
            variant="secondary"
            className={cn("text-white", statusColors[tournament.status])}
          >
            {tournament.status === "upcoming"
              ? "Upcoming"
              : tournament.status === "inprogress"
              ? "In Progress"
              : "Finished"}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge
            variant="secondary"
            className="bg-accent text-accent-foreground"
          >
            {tournament.sportType}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="line-clamp-2">{tournament.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {tournament.description || "No description available"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          {tournament.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{tournament.location}</span>
            </div>
          )}
          {tournament.startDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {format(new Date(tournament.startDate), "MMM dd, yyyy")}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{tournament.numberOfParticipants} Participants</span>
          </div>
          {tournament.prizes && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>{tournament.prizes}</span>
            </div>
          )}
        </div>

        <Button asChild className="w-full">
          <Link href={`/tournaments/${tournament._id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
