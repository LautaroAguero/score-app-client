"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockTeams, mockPlayers, mockGames } from "@/lib/mock-data"
import type { Player } from "@/lib/types"
import { ArrowLeft, Plus, Edit, Trash2, Users, Calendar, Trophy } from "lucide-react"

export default function TeamDetailPage() {
  const params = useParams()
  const teamId = params.id as string

  const team = mockTeams.find((t) => t.id === teamId)
  const [players, setPlayers] = useState<Player[]>(mockPlayers.filter((p) => p.teamId === teamId))
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    number: "",
    position: "PG" as Player["position"],
    height: "",
    weight: "",
  })

  if (!team) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Equipo no encontrado</h1>
          <p className="text-muted-foreground mb-4">El equipo que buscas no existe</p>
          <Button asChild>
            <Link href="/teams">Volver a Equipos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const teamGames = mockGames.filter((game) => game.homeTeamId === teamId || game.awayTeamId === teamId)

  const handleAddPlayer = () => {
    const player: Player = {
      id: Date.now().toString(),
      teamId: teamId,
      name: newPlayer.name,
      number: Number.parseInt(newPlayer.number),
      position: newPlayer.position,
      height: newPlayer.height || undefined,
      weight: newPlayer.weight || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setPlayers([...players, player])
    setNewPlayer({ name: "", number: "", position: "PG", height: "", weight: "" })
    setIsAddPlayerDialogOpen(false)
  }

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player)
    setNewPlayer({
      name: player.name,
      number: player.number.toString(),
      position: player.position,
      height: player.height || "",
      weight: player.weight || "",
    })
  }

  const handleUpdatePlayer = () => {
    if (!editingPlayer) return

    const updatedPlayers = players.map((player) =>
      player.id === editingPlayer.id
        ? {
            ...player,
            name: newPlayer.name,
            number: Number.parseInt(newPlayer.number),
            position: newPlayer.position,
            height: newPlayer.height || undefined,
            weight: newPlayer.weight || undefined,
            updatedAt: new Date(),
          }
        : player,
    )
    setPlayers(updatedPlayers)
    setEditingPlayer(null)
    setNewPlayer({ name: "", number: "", position: "PG", height: "", weight: "" })
  }

  const handleDeletePlayer = (playerId: string) => {
    setPlayers(players.filter((player) => player.id !== playerId))
  }

  const getPositionLabel = (position: Player["position"]) => {
    const positions = {
      PG: "Base",
      SG: "Escolta",
      SF: "Alero",
      PF: "Ala-Pívot",
      C: "Pívot",
    }
    return positions[position]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/teams">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Equipos
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <img
                  src={team.logo || "/placeholder.svg?height=48&width=48&query=basketball team logo"}
                  alt={team.name}
                  className="w-12 h-12 rounded"
                />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{team.name}</h1>
                  <p className="text-sm text-muted-foreground">{players.length} jugadores registrados</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <div
                    className="w-6 h-6 rounded border-2 border-border"
                    style={{ backgroundColor: team.primaryColor }}
                    title="Color Primario"
                  />
                  <div
                    className="w-6 h-6 rounded border-2 border-border"
                    style={{ backgroundColor: team.secondaryColor }}
                    title="Color Secundario"
                  />
                </div>
              </div>
            </div>
            <Dialog open={isAddPlayerDialogOpen} onOpenChange={setIsAddPlayerDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Jugador
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Jugador</DialogTitle>
                  <DialogDescription>Completa la información del jugador</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="player-name">Nombre Completo</Label>
                      <Input
                        id="player-name"
                        value={newPlayer.name}
                        onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                        placeholder="Ej: LeBron James"
                      />
                    </div>
                    <div>
                      <Label htmlFor="player-number">Número</Label>
                      <Input
                        id="player-number"
                        type="number"
                        min="0"
                        max="99"
                        value={newPlayer.number}
                        onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                        placeholder="23"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="player-position">Posición</Label>
                    <Select
                      value={newPlayer.position}
                      onValueChange={(value: Player["position"]) => setNewPlayer({ ...newPlayer, position: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PG">Base (PG)</SelectItem>
                        <SelectItem value="SG">Escolta (SG)</SelectItem>
                        <SelectItem value="SF">Alero (SF)</SelectItem>
                        <SelectItem value="PF">Ala-Pívot (PF)</SelectItem>
                        <SelectItem value="C">Pívot (C)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="player-height">Altura (opcional)</Label>
                      <Input
                        id="player-height"
                        value={newPlayer.height}
                        onChange={(e) => setNewPlayer({ ...newPlayer, height: e.target.value })}
                        placeholder="6'9&quot;"
                      />
                    </div>
                    <div>
                      <Label htmlFor="player-weight">Peso (opcional)</Label>
                      <Input
                        id="player-weight"
                        value={newPlayer.weight}
                        onChange={(e) => setNewPlayer({ ...newPlayer, weight: e.target.value })}
                        placeholder="250 lbs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddPlayerDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddPlayer} disabled={!newPlayer.name.trim() || !newPlayer.number.trim()}>
                      Agregar Jugador
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jugadores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{players.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partidos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{teamGames.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Victorias</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Players List */}
        <Card>
          <CardHeader>
            <CardTitle>Plantilla de Jugadores</CardTitle>
            <CardDescription>Lista completa de jugadores del equipo</CardDescription>
          </CardHeader>
          <CardContent>
            {players.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <div key={player.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                          {player.number}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{player.name}</h3>
                          <p className="text-sm text-muted-foreground">{getPositionLabel(player.position)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditPlayer(player)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePlayer(player.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {(player.height || player.weight) && (
                      <div className="text-sm text-muted-foreground">
                        {player.height && <span>{player.height}</span>}
                        {player.height && player.weight && <span> • </span>}
                        {player.weight && <span>{player.weight}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No hay jugadores registrados</h3>
                <p className="text-muted-foreground mb-4">Comienza agregando jugadores a este equipo</p>
                <Button onClick={() => setIsAddPlayerDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primer Jugador
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Player Dialog */}
      <Dialog open={!!editingPlayer} onOpenChange={() => setEditingPlayer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Jugador</DialogTitle>
            <DialogDescription>Modifica la información del jugador</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-player-name">Nombre Completo</Label>
                <Input
                  id="edit-player-name"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  placeholder="Ej: LeBron James"
                />
              </div>
              <div>
                <Label htmlFor="edit-player-number">Número</Label>
                <Input
                  id="edit-player-number"
                  type="number"
                  min="0"
                  max="99"
                  value={newPlayer.number}
                  onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                  placeholder="23"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-player-position">Posición</Label>
              <Select
                value={newPlayer.position}
                onValueChange={(value: Player["position"]) => setNewPlayer({ ...newPlayer, position: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PG">Base (PG)</SelectItem>
                  <SelectItem value="SG">Escolta (SG)</SelectItem>
                  <SelectItem value="SF">Alero (SF)</SelectItem>
                  <SelectItem value="PF">Ala-Pívot (PF)</SelectItem>
                  <SelectItem value="C">Pívot (C)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-player-height">Altura (opcional)</Label>
                <Input
                  id="edit-player-height"
                  value={newPlayer.height}
                  onChange={(e) => setNewPlayer({ ...newPlayer, height: e.target.value })}
                  placeholder="6'9&quot;"
                />
              </div>
              <div>
                <Label htmlFor="edit-player-weight">Peso (opcional)</Label>
                <Input
                  id="edit-player-weight"
                  value={newPlayer.weight}
                  onChange={(e) => setNewPlayer({ ...newPlayer, weight: e.target.value })}
                  placeholder="250 lbs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingPlayer(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdatePlayer} disabled={!newPlayer.name.trim() || !newPlayer.number.trim()}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
