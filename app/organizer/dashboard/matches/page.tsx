"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, CalendarIcon, Clock, MapPin, Play, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Match } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

const mockMatches: Match[] = [
  {
    id: "m1",
    tournamentId: "1",
    homeTeam: { id: "t1", name: "Thunder FC", logo: "/placeholder.svg?height=40&width=40", tournamentId: "1" },
    awayTeam: { id: "t2", name: "Lightning United", logo: "/placeholder.svg?height=40&width=40", tournamentId: "1" },
    homeScore: 2,
    awayScore: 1,
    status: "Completed",
    date: "2025-06-15",
    time: "18:00",
    venue: "Central Stadium",
    stage: "Quarter Finals",
  },
  {
    id: "m2",
    tournamentId: "1",
    homeTeam: { id: "t3", name: "Phoenix Rangers", logo: "/placeholder.svg?height=40&width=40", tournamentId: "1" },
    awayTeam: { id: "t4", name: "Storm City", logo: "/placeholder.svg?height=40&width=40", tournamentId: "1" },
    status: "In Progress",
    homeScore: 1,
    awayScore: 1,
    date: "2025-06-16",
    time: "20:00",
    venue: "North Arena",
    stage: "Quarter Finals",
  },
  {
    id: "m3",
    tournamentId: "1",
    homeTeam: { id: "t5", name: "Blaze Athletic", logo: "/placeholder.svg?height=40&width=40", tournamentId: "1" },
    awayTeam: { id: "t6", name: "Titans FC", logo: "/placeholder.svg?height=40&width=40", tournamentId: "1" },
    status: "Scheduled",
    date: "2025-06-17",
    time: "19:00",
    venue: "East Stadium",
    stage: "Quarter Finals",
  },
]

export default function MatchManagementPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTournament, setSelectedTournament] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [newMatch, setNewMatch] = useState({
    tournament: "",
    homeTeam: "",
    awayTeam: "",
    date: undefined as Date | undefined,
    time: "",
    venue: "",
    stage: "",
  })

  const filteredMatches = mockMatches.filter((match) => {
    const matchesSearch =
      match.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTournament = selectedTournament === "all" || match.tournamentId === selectedTournament
    return matchesSearch && matchesTournament
  })

  const scheduledMatches = filteredMatches.filter((m) => m.status === "Scheduled")
  const liveMatches = filteredMatches.filter((m) => m.status === "In Progress")
  const completedMatches = filteredMatches.filter((m) => m.status === "Completed")

  const handleAddMatch = () => {
    console.log("Adding match:", newMatch)
    toast({
      title: "Match Created",
      description: "The match has been successfully scheduled.",
    })
    setIsAddDialogOpen(false)
    setNewMatch({
      tournament: "",
      homeTeam: "",
      awayTeam: "",
      date: undefined,
      time: "",
      venue: "",
      stage: "",
    })
  }

  const handleUpdateScore = (homeScore: number, awayScore: number) => {
    console.log("Updating score:", { matchId: selectedMatch?.id, homeScore, awayScore })
    toast({
      title: "Score Updated",
      description: "Match score has been updated successfully.",
    })
    setIsScoreDialogOpen(false)
  }

  const handleStartMatch = (match: Match) => {
    console.log("Starting match:", match.id)
    toast({
      title: "Match Started",
      description: `${match.homeTeam.name} vs ${match.awayTeam.name} is now live!`,
    })
  }

  const handleEndMatch = (match: Match) => {
    console.log("Ending match:", match.id)
    toast({
      title: "Match Completed",
      description: "The match has been marked as completed.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Match Management</h1>
          <p className="text-muted-foreground">Schedule matches and update scores in real-time</p>
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
              <DialogDescription>Enter the match details to add it to the tournament schedule</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tournament">Tournament *</Label>
                <Select
                  value={newMatch.tournament}
                  onValueChange={(value) => setNewMatch({ ...newMatch, tournament: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tournament" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Summer Soccer Championship</SelectItem>
                    <SelectItem value="2">City Basketball League</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeTeam">Home Team *</Label>
                  <Select
                    value={newMatch.homeTeam}
                    onValueChange={(value) => setNewMatch({ ...newMatch, homeTeam: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="t1">Thunder FC</SelectItem>
                      <SelectItem value="t2">Lightning United</SelectItem>
                      <SelectItem value="t3">Phoenix Rangers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="awayTeam">Away Team *</Label>
                  <Select
                    value={newMatch.awayTeam}
                    onValueChange={(value) => setNewMatch({ ...newMatch, awayTeam: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="t1">Thunder FC</SelectItem>
                      <SelectItem value="t2">Lightning United</SelectItem>
                      <SelectItem value="t3">Phoenix Rangers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Match Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newMatch.date ? format(newMatch.date, "PPP") : "Pick a date"}
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
                    onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Input
                  id="venue"
                  placeholder="e.g., Central Stadium"
                  value={newMatch.venue}
                  onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Stage *</Label>
                <Input
                  id="stage"
                  placeholder="e.g., Quarter Finals"
                  value={newMatch.stage}
                  onChange={(e) => setNewMatch({ ...newMatch, stage: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
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
                  !newMatch.stage
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
            <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filter by tournament" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tournaments</SelectItem>
                <SelectItem value="1">Summer Soccer Championship</SelectItem>
                <SelectItem value="2">City Basketball League</SelectItem>
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
          <TabsTrigger value="scheduled">Scheduled ({scheduledMatches.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedMatches.length})</TabsTrigger>
        </TabsList>

        {/* Live Matches */}
        <TabsContent value="live" className="space-y-4">
          {liveMatches.length === 0 ? (
            <Card className="glass p-12 text-center">
              <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No live matches</h3>
              <p className="text-muted-foreground">Start a scheduled match to see it here</p>
            </Card>
          ) : (
            liveMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onUpdateScore={() => {
                  setSelectedMatch(match)
                  setIsScoreDialogOpen(true)
                }}
                onEndMatch={() => handleEndMatch(match)}
              />
            ))
          )}
        </TabsContent>

        {/* Scheduled Matches */}
        <TabsContent value="scheduled" className="space-y-4">
          {scheduledMatches.length === 0 ? (
            <Card className="glass p-12 text-center">
              <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No scheduled matches</h3>
              <p className="text-muted-foreground">Schedule matches to see them here</p>
            </Card>
          ) : (
            scheduledMatches.map((match) => (
              <MatchCard key={match.id} match={match} onStartMatch={() => handleStartMatch(match)} />
            ))
          )}
        </TabsContent>

        {/* Completed Matches */}
        <TabsContent value="completed" className="space-y-4">
          {completedMatches.length === 0 ? (
            <Card className="glass p-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No completed matches</h3>
              <p className="text-muted-foreground">Completed matches will appear here</p>
            </Card>
          ) : (
            completedMatches.map((match) => <MatchCard key={match.id} match={match} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Score Update Dialog */}
      <Dialog open={isScoreDialogOpen} onOpenChange={setIsScoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Match Score</DialogTitle>
            <DialogDescription>Enter the current score for this match</DialogDescription>
          </DialogHeader>
          {selectedMatch && (
            <ScoreUpdateForm
              match={selectedMatch}
              onUpdate={handleUpdateScore}
              onCancel={() => setIsScoreDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MatchCard({
  match,
  onStartMatch,
  onUpdateScore,
  onEndMatch,
}: {
  match: Match
  onStartMatch?: () => void
  onUpdateScore?: () => void
  onEndMatch?: () => void
}) {
  const statusColors = {
    Scheduled: "bg-blue-500",
    "In Progress": "bg-green-500 animate-pulse",
    Completed: "bg-gray-500",
    Postponed: "bg-yellow-500",
    Cancelled: "bg-red-500",
  }

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
              <Badge className={cn("text-xs text-white", statusColors[match.status])}>{match.status}</Badge>
            </div>

            {/* Teams */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={match.homeTeam.logo || "/placeholder.svg"}
                    alt={match.homeTeam.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <span className="font-semibold text-lg">{match.homeTeam.name}</span>
                </div>
                {match.homeScore !== undefined && (
                  <span className="text-3xl font-bold w-16 text-center">{match.homeScore}</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={match.awayTeam.logo || "/placeholder.svg"}
                    alt={match.awayTeam.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <span className="font-semibold text-lg">{match.awayTeam.name}</span>
                </div>
                {match.awayScore !== undefined && (
                  <span className="text-3xl font-bold w-16 text-center">{match.awayScore}</span>
                )}
              </div>
            </div>

            {/* Match Details */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {format(new Date(match.date), "MMM dd, yyyy")}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {match.time}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {match.venue}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 min-w-[140px]">
            {match.status === "Scheduled" && onStartMatch && (
              <Button onClick={onStartMatch} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Start Match
              </Button>
            )}
            {match.status === "In Progress" && (
              <>
                {onUpdateScore && (
                  <Button onClick={onUpdateScore} className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Update Score
                  </Button>
                )}
                {onEndMatch && (
                  <Button onClick={onEndMatch} variant="outline" className="w-full bg-transparent">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    End Match
                  </Button>
                )}
              </>
            )}
            {match.status === "Completed" && (
              <Button variant="outline" className="w-full bg-transparent" disabled>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Completed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ScoreUpdateForm({
  match,
  onUpdate,
  onCancel,
}: {
  match: Match
  onUpdate: (homeScore: number, awayScore: number) => void
  onCancel: () => void
}) {
  const [homeScore, setHomeScore] = useState(match.homeScore?.toString() || "0")
  const [awayScore, setAwayScore] = useState(match.awayScore?.toString() || "0")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(Number.parseInt(homeScore), Number.parseInt(awayScore))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={match.homeTeam.logo || "/placeholder.svg"} alt={match.homeTeam.name} className="h-8 w-8" />
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
            <img src={match.awayTeam.logo || "/placeholder.svg"} alt={match.awayTeam.name} className="h-8 w-8" />
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Score</Button>
      </div>
    </form>
  )
}
