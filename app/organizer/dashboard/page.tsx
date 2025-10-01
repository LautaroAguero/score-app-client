"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Calendar, Users, TrendingUp, Plus, Eye, Edit, MoreVertical } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const mockTournaments = [
  {
    id: "1",
    name: "Summer Soccer Championship 2025",
    sport: "Soccer",
    status: "In Progress",
    startDate: "2025-06-01",
    teamsCount: 16,
    matchesTotal: 32,
    matchesCompleted: 24,
    views: 12450,
  },
  {
    id: "2",
    name: "City Basketball League",
    sport: "Basketball",
    status: "Upcoming",
    startDate: "2025-07-15",
    teamsCount: 12,
    matchesTotal: 24,
    matchesCompleted: 0,
    views: 3420,
  },
  {
    id: "3",
    name: "Regional Tennis Open",
    sport: "Tennis",
    status: "Completed",
    startDate: "2025-05-01",
    teamsCount: 8,
    matchesTotal: 16,
    matchesCompleted: 16,
    views: 8920,
  },
]

export default function OrganizerDashboardPage() {
  const stats = [
    {
      title: "Total Tournaments",
      value: "12",
      change: "+2 this month",
      icon: Trophy,
      color: "text-accent",
    },
    {
      title: "Active Matches",
      value: "8",
      change: "3 live now",
      icon: Calendar,
      color: "text-green-500",
    },
    {
      title: "Total Teams",
      value: "156",
      change: "+24 this month",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Views",
      value: "24.8K",
      change: "+12% this week",
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ]

  const statusColors = {
    Upcoming: "bg-blue-500",
    "In Progress": "bg-green-500",
    Completed: "bg-gray-500",
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your tournaments.</p>
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
                <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
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
              <CardDescription>Manage and monitor your active tournaments</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/organizer/dashboard/tournaments">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTournaments.map((tournament) => (
              <div key={tournament.id} className="glass-strong rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{tournament.name}</h3>
                      <Badge variant="secondary" className={`text-white ${statusColors[tournament.status]}`}>
                        {tournament.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {tournament.sport}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {tournament.teamsCount} Teams
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {tournament.matchesCompleted}/{tournament.matchesTotal} Matches
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {tournament.views.toLocaleString()} Views
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/tournaments/${tournament.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/organizer/dashboard/tournaments/${tournament.id}/edit`}>
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
                        <DropdownMenuItem className="text-destructive">Delete Tournament</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass hover:shadow-lg transition-shadow cursor-pointer" asChild>
          <Link href="/organizer/dashboard/matches">
            <CardHeader>
              <Calendar className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">Manage Matches</CardTitle>
              <CardDescription>Update scores and schedules</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="glass hover:shadow-lg transition-shadow cursor-pointer" asChild>
          <Link href="/organizer/dashboard/teams">
            <CardHeader>
              <Users className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">Manage Teams</CardTitle>
              <CardDescription>Add and organize teams</CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="glass hover:shadow-lg transition-shadow cursor-pointer" asChild>
          <Link href="/organizer/dashboard/analytics">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">View Analytics</CardTitle>
              <CardDescription>Track engagement metrics</CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  )
}
