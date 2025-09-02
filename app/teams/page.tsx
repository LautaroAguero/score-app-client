"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { mockTeams, mockPlayers } from "@/lib/mock-data"
import type { Team } from "@/lib/types"
import { RouteProtection } from "@/lib/route-protection"
import { Plus, Users, Edit, Trash2, ArrowLeft } from "lucide-react"

export default function TeamsPage() {
  return (
    <RouteProtection allowedRoles={["organizer"]}>
      <TeamsPageContent />
    </RouteProtection>
  )
}

function TeamsPageContent() {
  const [teams, setTeams] = useState<Team[]>(mockTeams)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [newTeam, setNewTeam] = useState({
    name: "",
    primaryColor: "#164e63",
    secondaryColor: "#f59e0b",
  })

  const handleAddTeam = () => {
    const team: Team = {
      id: Date.now().toString(),
      name: newTeam.name,
      primaryColor: newTeam.primaryColor,
      secondaryColor: newTeam.secondaryColor,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTeams([...teams, team])
    setNewTeam({ name: "", primaryColor: "#164e63", secondaryColor: "#f59e0b" })
    setIsAddDialogOpen(false)
  }

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team)
    setNewTeam({
      name: team.name,
      primaryColor: team.primaryColor,
      secondaryColor: team.secondaryColor,
    })
  }

  const handleUpdateTeam = () => {
    if (!editingTeam) return

    const updatedTeams = teams.map((team) =>
      team.id === editingTeam.id
        ? {
            ...team,
            name: newTeam.name,
            primaryColor: newTeam.primaryColor,
            secondaryColor: newTeam.secondaryColor,
            updatedAt: new Date(),
          }
        : team,
    )
    setTeams(updatedTeams)
    setEditingTeam(null)
    setNewTeam({ name: "", primaryColor: "#164e63", secondaryColor: "#f59e0b" })
  }

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter((team) => team.id !== teamId))
  }

  const getTeamPlayerCount = (teamId: string) => {
    return mockPlayers.filter((player) => player.teamId === teamId).length
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestión de Equipos</h1>
                <p className="text-sm text-muted-foreground">Administra los equipos del torneo</p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Equipo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Equipo</DialogTitle>
                  <DialogDescription>Completa la información del equipo</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="team-name">Nombre del Equipo</Label>
                    <Input
                      id="team-name"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      placeholder="Ej: Lakers"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary-color">Color Primario</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="primary-color"
                          type="color"
                          value={newTeam.primaryColor}
                          onChange={(e) => setNewTeam({ ...newTeam, primaryColor: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={newTeam.primaryColor}
                          onChange={(e) => setNewTeam({ ...newTeam, primaryColor: e.target.value })}
                          placeholder="#164e63"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondary-color">Color Secundario</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={newTeam.secondaryColor}
                          onChange={(e) => setNewTeam({ ...newTeam, secondaryColor: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={newTeam.secondaryColor}
                          onChange={(e) => setNewTeam({ ...newTeam, secondaryColor: e.target.value })}
                          placeholder="#f59e0b"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddTeam} disabled={!newTeam.name.trim()}>
                      Agregar Equipo
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Equipos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{teams.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jugadores Registrados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{mockPlayers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio Jugadores/Equipo</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {teams.length > 0 ? Math.round(mockPlayers.length / teams.length) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={team.logo || "/placeholder.svg?height=40&width=40&query=basketball team logo"}
                      alt={team.name}
                      className="w-10 h-10 rounded"
                    />
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription>{getTeamPlayerCount(team.id)} jugadores</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditTeam(team)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Colores del Equipo</Label>
                    <div className="flex gap-2 mt-1">
                      <div
                        className="w-8 h-8 rounded border-2 border-border"
                        style={{ backgroundColor: team.primaryColor }}
                        title="Color Primario"
                      />
                      <div
                        className="w-8 h-8 rounded border-2 border-border"
                        style={{ backgroundColor: team.secondaryColor }}
                        title="Color Secundario"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">Activo</Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/teams/${team.id}`}>Ver Detalles</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No hay equipos registrados</h3>
            <p className="text-muted-foreground mb-4">Comienza agregando tu primer equipo al torneo</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Equipo
            </Button>
          </div>
        )}
      </main>

      {/* Edit Team Dialog */}
      <Dialog open={!!editingTeam} onOpenChange={() => setEditingTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Equipo</DialogTitle>
            <DialogDescription>Modifica la información del equipo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-team-name">Nombre del Equipo</Label>
              <Input
                id="edit-team-name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="Ej: Lakers"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-primary-color">Color Primario</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="edit-primary-color"
                    type="color"
                    value={newTeam.primaryColor}
                    onChange={(e) => setNewTeam({ ...newTeam, primaryColor: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={newTeam.primaryColor}
                    onChange={(e) => setNewTeam({ ...newTeam, primaryColor: e.target.value })}
                    placeholder="#164e63"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-secondary-color">Color Secundario</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="edit-secondary-color"
                    type="color"
                    value={newTeam.secondaryColor}
                    onChange={(e) => setNewTeam({ ...newTeam, secondaryColor: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={newTeam.secondaryColor}
                    onChange={(e) => setNewTeam({ ...newTeam, secondaryColor: e.target.value })}
                    placeholder="#f59e0b"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingTeam(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateTeam} disabled={!newTeam.name.trim()}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
