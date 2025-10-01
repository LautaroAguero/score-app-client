"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Upload, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const mockTeams = [
  {
    id: "t1",
    name: "Thunder FC",
    logo: "/placeholder.svg?height=48&width=48",
    tournament: "Summer Soccer Championship",
    tournamentId: "1",
    players: 18,
    group: "Group A",
  },
  {
    id: "t2",
    name: "Lightning United",
    logo: "/placeholder.svg?height=48&width=48",
    tournament: "Summer Soccer Championship",
    tournamentId: "1",
    players: 20,
    group: "Group A",
  },
  {
    id: "t3",
    name: "Phoenix Rangers",
    logo: "/placeholder.svg?height=48&width=48",
    tournament: "Summer Soccer Championship",
    tournamentId: "1",
    players: 19,
    group: "Group B",
  },
]

export default function TeamManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTournament, setSelectedTournament] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: "",
    tournament: "",
    group: "",
  })

  const filteredTeams = mockTeams.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTournament = selectedTournament === "all" || team.tournamentId === selectedTournament
    return matchesSearch && matchesTournament
  })

  const handleAddTeam = () => {
    console.log("Adding team:", newTeam)
    setIsAddDialogOpen(false)
    setNewTeam({ name: "", tournament: "", group: "" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Management</h1>
          <p className="text-muted-foreground">Add and organize teams for your tournaments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team</DialogTitle>
              <DialogDescription>Enter the team details to add them to a tournament</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  placeholder="e.g., Thunder FC"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tournament">Tournament *</Label>
                <Select
                  value={newTeam.tournament}
                  onValueChange={(value) => setNewTeam({ ...newTeam, tournament: value })}
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

              <div className="space-y-2">
                <Label htmlFor="group">Group (Optional)</Label>
                <Input
                  id="group"
                  placeholder="e.g., Group A"
                  value={newTeam.group}
                  onChange={(e) => setNewTeam({ ...newTeam, group: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Team Logo (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent transition-colors cursor-pointer">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Upload team logo</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTeam} disabled={!newTeam.name || !newTeam.tournament}>
                Add Team
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
                placeholder="Search teams..."
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

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <Card key={team.id} className="glass hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={team.logo || "/placeholder.svg"} alt={team.name} className="h-12 w-12 rounded-full" />
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <CardDescription className="text-sm">{team.tournament}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Group:</span>
                <Badge variant="outline">{team.group}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Players:</span>
                <span className="font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {team.players}
                </span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <Card className="glass p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No teams found</h3>
          <p className="text-muted-foreground mb-4">Add teams to your tournaments to get started</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Team
          </Button>
        </Card>
      )}
    </div>
  )
}
