"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockTournaments, mockTeams } from "@/lib/mock-data"
import type { Tournament } from "@/lib/types"
import { Trophy, Plus, Calendar, Users, Settings, Eye } from "lucide-react"

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null)

  const handleCreateTournament = (formData: FormData) => {
    const newTournament: Tournament = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      status: "upcoming",
      format: formData.get("format") as Tournament["format"],
      maxTeams: Number.parseInt(formData.get("maxTeams") as string),
      registeredTeams: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setTournaments([...tournaments, newTournament])
    setIsCreateDialogOpen(false)
  }

  const handleEditTournament = (formData: FormData) => {
    if (!editingTournament) return

    const updatedTournament: Tournament = {
      ...editingTournament,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      format: formData.get("format") as Tournament["format"],
      maxTeams: Number.parseInt(formData.get("maxTeams") as string),
      updatedAt: new Date(),
    }

    setTournaments(tournaments.map((t) => (t.id === editingTournament.id ? updatedTournament : t)))
    setEditingTournament(null)
  }

  const getStatusColor = (status: Tournament["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: Tournament["status"]) => {
    switch (status) {
      case "upcoming":
        return "Próximo"
      case "active":
        return "Activo"
      case "completed":
        return "Completado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getFormatText = (format: Tournament["format"]) => {
    switch (format) {
      case "single-elimination":
        return "Eliminación Simple"
      case "double-elimination":
        return "Eliminación Doble"
      case "round-robin":
        return "Todos contra Todos"
      case "league":
        return "Liga"
      default:
        return format
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestión de Torneos</h1>
                <p className="text-sm text-muted-foreground">Administra y organiza torneos de básquet</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/">Volver al Inicio</Link>
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Torneo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Torneo</DialogTitle>
                    <DialogDescription>Completa la información del torneo</DialogDescription>
                  </DialogHeader>
                  <form action={handleCreateTournament} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nombre del Torneo</Label>
                      <Input id="name" name="name" placeholder="Copa de Verano 2024" required />
                    </div>
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea id="description" name="description" placeholder="Descripción del torneo..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Fecha de Inicio</Label>
                        <Input id="startDate" name="startDate" type="date" required />
                      </div>
                      <div>
                        <Label htmlFor="endDate">Fecha de Fin</Label>
                        <Input id="endDate" name="endDate" type="date" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="format">Formato</Label>
                        <Select name="format" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar formato" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single-elimination">Eliminación Simple</SelectItem>
                            <SelectItem value="double-elimination">Eliminación Doble</SelectItem>
                            <SelectItem value="round-robin">Todos contra Todos</SelectItem>
                            <SelectItem value="league">Liga</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="maxTeams">Máximo de Equipos</Label>
                        <Input id="maxTeams" name="maxTeams" type="number" min="2" max="32" defaultValue="8" required />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Crear Torneo</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tournament Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Torneos</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{tournaments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Torneos Activos</CardTitle>
              <Calendar className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {tournaments.filter((t) => t.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos Torneos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {tournaments.filter((t) => t.status === "upcoming").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipos Registrados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {tournaments.reduce((total, t) => total + t.registeredTeams.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tournaments List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{tournament.name}</CardTitle>
                    <CardDescription className="mt-1">{tournament.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(tournament.status)}>{getStatusText(tournament.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Formato:</span>
                    <div className="font-medium">{getFormatText(tournament.format)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Equipos:</span>
                    <div className="font-medium">
                      {tournament.registeredTeams.length}/{tournament.maxTeams}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inicio:</span>
                    <div className="font-medium">{tournament.startDate.toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fin:</span>
                    <div className="font-medium">{tournament.endDate.toLocaleDateString()}</div>
                  </div>
                </div>

                {tournament.registeredTeams.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Equipos Registrados:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tournament.registeredTeams.slice(0, 3).map((teamId) => {
                        const team = mockTeams.find((t) => t.id === teamId)
                        return (
                          <Badge key={teamId} variant="secondary" className="text-xs">
                            {team?.name}
                          </Badge>
                        )
                      })}
                      {tournament.registeredTeams.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{tournament.registeredTeams.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/tournaments/${tournament.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Link>
                  </Button>
                  <Dialog
                    open={editingTournament?.id === tournament.id}
                    onOpenChange={(open) => setEditingTournament(open ? tournament : null)}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Editar Torneo</DialogTitle>
                        <DialogDescription>Modifica la información del torneo</DialogDescription>
                      </DialogHeader>
                      <form action={handleEditTournament} className="space-y-4">
                        <div>
                          <Label htmlFor="edit-name">Nombre del Torneo</Label>
                          <Input
                            id="edit-name"
                            name="name"
                            defaultValue={tournament.name}
                            placeholder="Copa de Verano 2024"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-description">Descripción</Label>
                          <Textarea
                            id="edit-description"
                            name="description"
                            defaultValue={tournament.description}
                            placeholder="Descripción del torneo..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-startDate">Fecha de Inicio</Label>
                            <Input
                              id="edit-startDate"
                              name="startDate"
                              type="date"
                              defaultValue={tournament.startDate.toISOString().split("T")[0]}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-endDate">Fecha de Fin</Label>
                            <Input
                              id="edit-endDate"
                              name="endDate"
                              type="date"
                              defaultValue={tournament.endDate.toISOString().split("T")[0]}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-format">Formato</Label>
                            <Select name="format" defaultValue={tournament.format} required>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single-elimination">Eliminación Simple</SelectItem>
                                <SelectItem value="double-elimination">Eliminación Doble</SelectItem>
                                <SelectItem value="round-robin">Todos contra Todos</SelectItem>
                                <SelectItem value="league">Liga</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit-maxTeams">Máximo de Equipos</Label>
                            <Input
                              id="edit-maxTeams"
                              name="maxTeams"
                              type="number"
                              min="2"
                              max="32"
                              defaultValue={tournament.maxTeams}
                              required
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setEditingTournament(null)}>
                            Cancelar
                          </Button>
                          <Button type="submit">Guardar Cambios</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No hay torneos creados</h3>
            <p className="text-muted-foreground mb-4">Crea tu primer torneo para comenzar a organizar competencias</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Torneo
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
