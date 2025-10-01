"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Grid3x3, List, Filter, CalendarIcon, MapPin, Users, Trophy, Clock, ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { Tournament, SportType, TournamentStatus } from "@/lib/types"

// Mock tournaments data
const mockTournaments: Tournament[] = [
  {
    id: "1",
    name: "Summer Soccer Championship 2025",
    sport: "Soccer",
    format: "Knockout",
    status: "In Progress",
    startDate: "2025-06-01",
    endDate: "2025-06-30",
    location: "New York, USA",
    description: "Premier soccer tournament featuring top teams from across the nation",
    organizerId: "org1",
    organizerName: "Elite Sports League",
    teamsCount: 16,
    currentStage: "Quarter Finals",
    views: 12450,
  },
  {
    id: "2",
    name: "National Basketball Tournament",
    sport: "Basketball",
    format: "League",
    status: "Upcoming",
    startDate: "2025-07-15",
    endDate: "2025-08-15",
    location: "Los Angeles, USA",
    description: "Annual basketball championship with the best teams competing",
    organizerId: "org2",
    organizerName: "Pro Basketball Association",
    teamsCount: 12,
    currentStage: "Registration Open",
    views: 8920,
  },
  {
    id: "3",
    name: "International Tennis Open",
    sport: "Tennis",
    format: "Knockout",
    status: "Upcoming",
    startDate: "2025-08-01",
    endDate: "2025-08-20",
    location: "London, UK",
    description: "World-class tennis tournament with international players",
    organizerId: "org3",
    organizerName: "Global Tennis Federation",
    teamsCount: 32,
    currentStage: "Early Registration",
    views: 15670,
  },
  {
    id: "4",
    name: "City Volleyball League",
    sport: "Volleyball",
    format: "League",
    status: "In Progress",
    startDate: "2025-05-15",
    endDate: "2025-07-30",
    location: "Miami, USA",
    description: "Local volleyball league with teams from the metropolitan area",
    organizerId: "org4",
    organizerName: "Miami Sports Club",
    teamsCount: 10,
    currentStage: "Week 8",
    views: 5430,
  },
  {
    id: "5",
    name: "Cricket World Series",
    sport: "Cricket",
    format: "Hybrid",
    status: "Upcoming",
    startDate: "2025-09-01",
    endDate: "2025-10-15",
    location: "Mumbai, India",
    description: "International cricket series with group stages and knockout rounds",
    organizerId: "org5",
    organizerName: "International Cricket Board",
    teamsCount: 20,
    currentStage: "Team Selection",
    views: 23890,
  },
  {
    id: "6",
    name: "Regional Baseball Championship",
    sport: "Baseball",
    format: "Knockout",
    status: "Completed",
    startDate: "2025-04-01",
    endDate: "2025-05-10",
    location: "Boston, USA",
    description: "Regional baseball tournament showcasing local talent",
    organizerId: "org6",
    organizerName: "Northeast Baseball League",
    teamsCount: 8,
    currentStage: "Finals Completed",
    views: 9870,
  },
]

const sportTypes: SportType[] = [
  "Soccer",
  "Basketball",
  "Tennis",
  "Volleyball",
  "Cricket",
  "Baseball",
  "Rugby",
  "Hockey",
]
const statusTypes: TournamentStatus[] = ["Upcoming", "In Progress", "Completed"]

export default function TournamentsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [showFilters, setShowFilters] = useState(false)

  // Filter tournaments
  const filteredTournaments = mockTournaments.filter((tournament) => {
    const matchesSearch =
      tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSport = selectedSport === "all" || tournament.sport === selectedSport
    const matchesStatus = selectedStatus === "all" || tournament.status === selectedStatus

    let matchesDate = true
    if (dateRange.from) {
      const tournamentStart = new Date(tournament.startDate)
      matchesDate = tournamentStart >= dateRange.from
      if (dateRange.to) {
        matchesDate = matchesDate && tournamentStart <= dateRange.to
      }
    }

    return matchesSearch && matchesSport && matchesStatus && matchesDate
  })

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedSport("all")
    setSelectedStatus("all")
    setDateRange({})
  }

  const hasActiveFilters = searchQuery || selectedSport !== "all" || selectedStatus !== "all" || dateRange.from

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sport Filter */}
              <div className="space-y-2">
                <Label>Sport Type</Label>
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    {sportTypes.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Tournament Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusTypes.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label>Start Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
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
                      onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
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
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredTournaments.length} tournament{filteredTournaments.length !== 1 ? "s" : ""}
      </div>

      {/* Tournament Grid/List */}
      {filteredTournaments.length === 0 ? (
        <Card className="glass p-12 text-center">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No tournaments found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
          {hasActiveFilters && <Button onClick={clearFilters}>Clear Filters</Button>}
        </Card>
      ) : (
        <div
          className={cn(
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4",
          )}
        >
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  )
}

function TournamentCard({ tournament, viewMode }: { tournament: Tournament; viewMode: "grid" | "list" }) {
  const statusColors = {
    Upcoming: "bg-blue-500",
    "In Progress": "bg-green-500",
    Completed: "bg-gray-500",
  }

  if (viewMode === "list") {
    return (
      <Card className="glass hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  {tournament.sport}
                </Badge>
                <Badge variant="secondary" className={cn("text-white", statusColors[tournament.status])}>
                  {tournament.status}
                </Badge>
                <Badge variant="outline">{tournament.format}</Badge>
              </div>

              <h3 className="text-2xl font-bold">{tournament.name}</h3>

              <p className="text-muted-foreground line-clamp-2">{tournament.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{tournament.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{tournament.teamsCount} Teams</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(tournament.startDate), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{tournament.currentStage}</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Organized by <span className="font-medium text-foreground">{tournament.organizerName}</span>
              </div>
            </div>

            <div className="flex md:flex-col justify-between md:justify-center gap-2">
              <Button asChild className="w-full md:w-auto">
                <Link href={`/tournaments/${tournament.id}`}>
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={`/.jpg?height=200&width=400&query=${tournament.sport.toLowerCase()}-tournament`}
          alt={tournament.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="secondary" className={cn("text-white", statusColors[tournament.status])}>
            {tournament.status}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            {tournament.sport}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="line-clamp-2">{tournament.name}</CardTitle>
        <CardDescription className="line-clamp-2">{tournament.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{tournament.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(new Date(tournament.startDate), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{tournament.teamsCount} Teams</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{tournament.currentStage}</span>
          </div>
        </div>

        <Button asChild className="w-full">
          <Link href={`/tournaments/${tournament.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
