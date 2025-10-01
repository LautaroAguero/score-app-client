"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, MapPin, Users, Trophy, Share2, Clock, ArrowLeft, TrendingUp, Target } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { Match, Standing } from "@/lib/types"

// Mock data
const mockTournament = {
  id: "1",
  name: "Summer Soccer Championship 2025",
  sport: "Soccer",
  format: "Knockout",
  status: "In Progress",
  startDate: "2025-06-01",
  endDate: "2025-06-30",
  location: "New York, USA",
  description:
    "The Summer Soccer Championship is the premier soccer tournament featuring top teams from across the nation. This year's edition promises exciting matches, world-class talent, and unforgettable moments.",
  organizerId: "org1",
  organizerName: "Elite Sports League",
  bannerImage: "/soccer-stadium.jpg",
  teamsCount: 16,
  currentStage: "Quarter Finals",
  rules:
    "Standard FIFA rules apply. Each match consists of two 45-minute halves. In case of a draw, extra time and penalty shootouts will determine the winner.",
  prizes: "1st Place: $50,000 | 2nd Place: $25,000 | 3rd Place: $10,000",
  views: 12450,
}

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
  {
    id: "m4",
    tournamentId: "1",
    homeTeam: { id: "t7", name: "Warriors SC", logo: "/placeholder.svg?height=40&width=40", tournamentId: "1" },
    awayTeam: { id: "t8", name: "Eagles United", logo: "/placeholder.svg?height=40&width=40", tournamentId: "1" },
    status: "Scheduled",
    date: "2025-06-17",
    time: "21:00",
    venue: "West Arena",
    stage: "Quarter Finals",
  },
]

const mockStandings: Standing[] = [
  {
    position: 1,
    team: { id: "t1", name: "Thunder FC", logo: "/placeholder.svg?height=32&width=32", tournamentId: "1" },
    played: 6,
    won: 5,
    drawn: 1,
    lost: 0,
    goalsFor: 15,
    goalsAgainst: 4,
    goalDifference: 11,
    points: 16,
  },
  {
    position: 2,
    team: { id: "t3", name: "Phoenix Rangers", logo: "/placeholder.svg?height=32&width=32", tournamentId: "1" },
    played: 6,
    won: 4,
    drawn: 2,
    lost: 0,
    goalsFor: 12,
    goalsAgainst: 5,
    goalDifference: 7,
    points: 14,
  },
  {
    position: 3,
    team: { id: "t5", name: "Blaze Athletic", logo: "/placeholder.svg?height=32&width=32", tournamentId: "1" },
    played: 6,
    won: 4,
    drawn: 1,
    lost: 1,
    goalsFor: 13,
    goalsAgainst: 7,
    goalDifference: 6,
    points: 13,
  },
  {
    position: 4,
    team: { id: "t7", name: "Warriors SC", logo: "/placeholder.svg?height=32&width=32", tournamentId: "1" },
    played: 6,
    won: 3,
    drawn: 2,
    lost: 1,
    goalsFor: 10,
    goalsAgainst: 6,
    goalDifference: 4,
    points: 11,
  },
  {
    position: 5,
    team: { id: "t2", name: "Lightning United", logo: "/placeholder.svg?height=32&width=32", tournamentId: "1" },
    played: 6,
    won: 2,
    drawn: 2,
    lost: 2,
    goalsFor: 8,
    goalsAgainst: 8,
    goalDifference: 0,
    points: 8,
  },
]

const topScorers = [
  { player: "Marcus Johnson", team: "Thunder FC", goals: 8 },
  { player: "Alex Rivera", team: "Phoenix Rangers", goals: 7 },
  { player: "David Chen", team: "Blaze Athletic", goals: 6 },
  { player: "James Wilson", team: "Warriors SC", goals: 5 },
  { player: "Carlos Martinez", team: "Lightning United", goals: 5 },
]

export default function TournamentDetailPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mockTournament.name,
        text: mockTournament.description,
        url: window.location.href,
      })
    }
  }

  const statusColors = {
    Upcoming: "bg-blue-500",
    "In Progress": "bg-green-500",
    Completed: "bg-gray-500",
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={mockTournament.bannerImage || "/placeholder.svg"}
          alt={mockTournament.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <Button variant="ghost" size="sm" className="mb-4 text-white hover:text-white" asChild>
              <Link href="/tournaments">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tournaments
              </Link>
            </Button>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                {mockTournament.sport}
              </Badge>
              <Badge variant="secondary" className={cn("text-white", statusColors[mockTournament.status])}>
                {mockTournament.status}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                {mockTournament.format}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{mockTournament.name}</h1>

            <div className="flex flex-wrap gap-6 text-white/90 text-sm mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {mockTournament.location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(mockTournament.startDate), "MMM dd")} -{" "}
                {format(new Date(mockTournament.endDate), "MMM dd, yyyy")}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {mockTournament.teamsCount} Teams
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {mockTournament.currentStage}
              </div>
            </div>

            <Button variant="secondary" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Tournament
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-strong w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="bracket">Bracket</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>About Tournament</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">{mockTournament.description}</p>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Rules & Format</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{mockTournament.rules}</p>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Prizes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{mockTournament.prizes}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-lg">Tournament Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Organizer</div>
                      <div className="font-medium">{mockTournament.organizerName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Format</div>
                      <div className="font-medium">{mockTournament.format}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Current Stage</div>
                      <div className="font-medium">{mockTournament.currentStage}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Views</div>
                      <div className="font-medium">{mockTournament.views.toLocaleString()}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass bg-accent/10 border-accent/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-accent" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Matches</span>
                      <span className="font-semibold">32</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="font-semibold">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Remaining</span>
                      <span className="font-semibold">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Goals</span>
                      <span className="font-semibold">87</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Tournament Matches</CardTitle>
                <CardDescription>View all scheduled, ongoing, and completed matches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Standings Tab */}
          <TabsContent value="standings">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Tournament Standings</CardTitle>
                <CardDescription>Current leaderboard and team statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Pos</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-center">P</TableHead>
                        <TableHead className="text-center">W</TableHead>
                        <TableHead className="text-center">D</TableHead>
                        <TableHead className="text-center">L</TableHead>
                        <TableHead className="text-center">GF</TableHead>
                        <TableHead className="text-center">GA</TableHead>
                        <TableHead className="text-center">GD</TableHead>
                        <TableHead className="text-center font-semibold">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockStandings.map((standing) => (
                        <TableRow key={standing.team.id} className={cn(standing.position === 1 && "bg-accent/5")}>
                          <TableCell className="font-medium">
                            {standing.position === 1 && <Trophy className="h-4 w-4 text-accent inline mr-1" />}
                            {standing.position}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <img
                                src={standing.team.logo || "/placeholder.svg"}
                                alt={standing.team.name}
                                className="h-6 w-6 rounded-full"
                              />
                              <span className="font-medium">{standing.team.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{standing.played}</TableCell>
                          <TableCell className="text-center">{standing.won}</TableCell>
                          <TableCell className="text-center">{standing.drawn}</TableCell>
                          <TableCell className="text-center">{standing.lost}</TableCell>
                          <TableCell className="text-center">{standing.goalsFor}</TableCell>
                          <TableCell className="text-center">{standing.goalsAgainst}</TableCell>
                          <TableCell className="text-center">{standing.goalDifference}</TableCell>
                          <TableCell className="text-center font-bold">{standing.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-accent" />
                    Top Scorers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topScorers.map((scorer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm",
                              index === 0 && "bg-accent text-accent-foreground",
                              index !== 0 && "bg-muted",
                            )}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{scorer.player}</div>
                            <div className="text-sm text-muted-foreground">{scorer.team}</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-accent">{scorer.goals}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    Tournament Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Average Goals per Match</span>
                        <span className="font-semibold">2.7</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: "67.5%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Clean Sheets</span>
                        <span className="font-semibold">12</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: "50%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Yellow Cards</span>
                        <span className="font-semibold">45</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: "75%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Red Cards</span>
                        <span className="font-semibold">3</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: "15%" }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bracket Tab */}
          <TabsContent value="bracket">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Tournament Bracket</CardTitle>
                <CardDescription>Knockout stage visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <BracketView />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function MatchCard({ match }: { match: Match }) {
  const statusColors = {
    Scheduled: "bg-blue-500",
    "In Progress": "bg-green-500 animate-pulse",
    Completed: "bg-gray-500",
    Postponed: "bg-yellow-500",
    Cancelled: "bg-red-500",
  }

  return (
    <div className="glass-strong rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {match.stage}
            </Badge>
            <Badge className={cn("text-xs text-white", statusColors[match.status])}>{match.status}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={match.homeTeam.logo || "/placeholder.svg"}
                  alt={match.homeTeam.name}
                  className="h-8 w-8 rounded-full"
                />
                <span className="font-medium">{match.homeTeam.name}</span>
              </div>
              {match.homeScore !== undefined && (
                <span className="text-2xl font-bold w-12 text-center">{match.homeScore}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={match.awayTeam.logo || "/placeholder.svg"}
                  alt={match.awayTeam.name}
                  className="h-8 w-8 rounded-full"
                />
                <span className="font-medium">{match.awayTeam.name}</span>
              </div>
              {match.awayScore !== undefined && (
                <span className="text-2xl font-bold w-12 text-center">{match.awayScore}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
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
    </div>
  )
}

function BracketView() {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[800px] space-y-8">
        {/* Quarter Finals */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quarter Finals</h3>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="glass-strong">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Team {i * 2 - 1}</span>
                    <span className="font-bold">2</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Team {i * 2}</span>
                    <span className="font-bold">1</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Semi Finals */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Semi Finals</h3>
          <div className="grid grid-cols-4 gap-4">
            <div />
            {[1, 2].map((i) => (
              <Card key={i} className="glass-strong">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Winner QF{i * 2 - 1}</span>
                    <span className="text-muted-foreground">-</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Winner QF{i * 2}</span>
                    <span className="text-muted-foreground">-</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Final</h3>
          <div className="grid grid-cols-4 gap-4">
            <div />
            <div />
            <Card className="glass-strong border-accent">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Winner SF1</span>
                  <span className="text-muted-foreground">-</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Winner SF2</span>
                  <span className="text-muted-foreground">-</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Champion */}
        <div className="flex justify-center">
          <Card className="glass bg-accent/10 border-accent">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="font-bold">Champion</div>
              <div className="text-sm text-muted-foreground">TBD</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
