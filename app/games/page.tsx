"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockTeams, mockGames, mockTournaments } from "@/lib/mock-data"
import type { Game } from "@/lib/types"
import { RouteProtection } from "@/lib/route-protection"
import { Plus, Calendar, Play, CheckCircle, Clock, ArrowLeft, Edit, Trash2, Trophy } from "lucide-react"

export default function GamesPage() {
  return (
    <RouteProtection allowedRoles={["organizer"]}>
      <GamesPageContent />
    </RouteProtection>
  )
}

function GamesPageContent() {
  const [games, setGames] = useState<Game[]>(mockGames)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [newGame, setNewGame] = useState({
    tournamentId: "",
    homeTeamId: "",
    awayTeamId: "",
    scheduledDate: "",
    scheduledTime: "",
  })

  const gamesByStatus = useMemo(() => {
    return {
      scheduled: games.filter((game) => game.status === "scheduled"),
      inProgress: games.filter((game) => game.status === "in-progress"),
      completed: games.filter((game) => game.status === "completed"),
      cancelled: games.filter((game) => game.status === "cancelled"),
    }
  }, [games])

  const handleAddGame = () => {
    const scheduledDateTime = new Date(`${newGame.scheduledDate}T${newGame.scheduledTime}`)
    const game: Game = {
      id: Date.now().toString(),
      tournamentId: newGame.tournamentId,
      homeTeamId: newGame.homeTeamId,
      awayTeamId: newGame.awayTeamId,
      scheduledDate: scheduledDateTime,
      status: "scheduled",
      homeScore: 0,
      awayScore: 0,
      quarter: 1,
      timeRemaining: "10:00",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setGames([...games, game])
    setNewGame({ tournamentId: "", homeTeamId: "", awayTeamId: "", scheduledDate: "", scheduledTime: "" })
    setIsAddDialogOpen(false)
  }

  const handleEditGame = (game: Game) => {
    setEditingGame(game)
    setNewGame({
      tournamentId: game.tournamentId,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      scheduledDate: game.scheduledDate.toISOString().split("T")[0],
      scheduledTime: game.scheduledDate.toTimeString().slice(0, 5),
    })
  }

  const handleUpdateGame = () => {
    if (!editingGame) return

    const scheduledDateTime = new Date(`${newGame.scheduledDate}T${newGame.scheduledTime}`)
    const updatedGames = games.map((game) =>
      game.id === editingGame.id
        ? {
            ...game,
            tournamentId: newGame.tournamentId,
            homeTeamId: newGame.homeTeamId,
            awayTeamId: newGame.awayTeamId,
            scheduledDate: scheduledDateTime,
            updatedAt: new Date(),
          }
        : game,
    )
    setGames(updatedGames)
    setEditingGame(null)
    setNewGame({ tournamentId: "", homeTeamId: "", awayTeamId: "", scheduledDate: "", scheduledTime: "" })
  }

  const handleDeleteGame = (gameId: string) => {
    setGames(games.filter((game) => game.id !== gameId))
  }

  const handleStartGame = (gameId: string) => {
    const updatedGames = games.map((game) =>
      game.id === gameId ? { ...game, status: "in-progress" as const, updatedAt: new Date() } : game,
    )
    setGames(updatedGames)
  }

  const getTeamName = (teamId: string) => {
    return mockTeams.find((team) => team.id === teamId)?.name || "Equipo Desconocido"
  }

  const getTeamLogo = (teamId: string) => {
    return mockTeams.find((team) => team.id === teamId)?.logo
  }

  const getTeamColors = (teamId: string) => {
    const team = mockTeams.find((team) => team.id === teamId)
    return {
      primary: team?.primaryColor || "#164e63",
      secondary: team?.secondaryColor || "#f59e0b",
    }
  }

  const getStatusBadge = (status: Game["status"]) => {
    const statusConfig = {
      scheduled: { label: "Programado", variant: "secondary" as const, icon: Calendar },
      "in-progress": { label: "En Vivo", variant: "default" as const, icon: Play },
      completed: { label: "Finalizado", variant: "outline" as const, icon: CheckCircle },
      cancelled: { label: "Cancelado", variant: "destructive" as const, icon: Clock },
    }
    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getTournamentName = (tournamentId: string) => {
    return mockTournaments.find((tournament) => tournament.id === tournamentId)?.name || "Sin Torneo"
  }

  const getAvailableTeams = () => {
    if (!newGame.tournamentId) return mockTeams
    const tournament = mockTournaments.find((t) => t.id === newGame.tournamentId)
    if (!tournament) return mockTeams
    return mockTeams.filter((team) => tournament.registeredTeams.includes(team.id))
  }

  const availableTeams = getAvailableTeams().filter((team) => {
    if (!newGame.homeTeamId) return true
    return team.id !== newGame.homeTeamId
  })

  const GameCard = ({ game }: { game: Game }) => {
    const homeTeam = mockTeams.find((t) => t.id === game.homeTeamId)
    const awayTeam = mockTeams.find((t) => t.id === game.awayTeamId)
    const homeColors = getTeamColors(game.homeTeamId)
    const awayColors = getTeamColors(game.awayTeamId)
    const tournament = mockTournaments.find((t) => t.id === game.tournamentId)

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusBadge(game.status)}
              {tournament && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  {tournament.name}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {game.scheduledDate.toLocaleDateString()} -{" "}
                {game.scheduledDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="flex gap-1">
              {game.status === "scheduled" && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => handleEditGame(game)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGame(game.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={homeTeam?.logo || "/placeholder.svg?height=32&width=32&query=basketball team logo"}
                  alt={homeTeam?.name}
                  className="w-8 h-8 rounded"
                />
                <div>
                  <div className="font-medium">{homeTeam?.name}</div>
                  <div className="text-sm text-muted-foreground">Local</div>
                </div>
                <div className="flex gap-1 ml-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: homeColors.primary }} />
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: homeColors.secondary }} />
                </div>
              </div>

              <div className="flex items-center gap-4 px-4">
                {game.status === "in-progress" || game.status === "completed" ? (
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {game.homeScore} - {game.awayScore}
                    </div>
                    {game.status === "in-progress" && (
                      <div className="text-sm text-muted-foreground">
                        Q{game.quarter} - {game.timeRemaining}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-lg font-medium text-muted-foreground">vs</div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="flex gap-1 mr-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: awayColors.primary }} />
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: awayColors.secondary }} />
                </div>
                <div className="text-right">
                  <div className="font-medium">{awayTeam?.name}</div>
                  <div className="text-sm text-muted-foreground">Visitante</div>
                </div>
                <img
                  src={awayTeam?.logo || "/placeholder.svg?height=32&width=32&query=basketball team logo"}
                  alt={awayTeam?.name}
                  className="w-8 h-8 rounded"
                />
              </div>
            </div>

            <div className="flex justify-center pt-2">
              {game.status === "scheduled" && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleStartGame(game.id)}>
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Partido
                  </Button>
                </div>
              )}
              {game.status === "in-progress" && (
                <Button asChild>
                  <Link href={`/games/${game.id}/live`}>
                    <Play className="w-4 h-4 mr-2" />
                    Continuar Partido
                  </Link>
                </Button>
              )}
              {game.status === "completed" && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/games/${game.id}`}>Ver Resumen</Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
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
                <h1 className="text-2xl font-bold text-foreground">Gestión de Partidos</h1>
                <p className="text-sm text-muted-foreground">Programa y administra los partidos del torneo</p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Programar Partido
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Programar Nuevo Partido</DialogTitle>
                  <DialogDescription>Selecciona el torneo, equipos y programa la fecha del partido</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tournament">Torneo</Label>
                    <Select
                      value={newGame.tournamentId}
                      onValueChange={(value) =>
                        setNewGame({ ...newGame, tournamentId: value, homeTeamId: "", awayTeamId: "" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar torneo" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockTournaments
                          .filter((t) => t.status === "active" || t.status === "upcoming")
                          .map((tournament) => (
                            <SelectItem key={tournament.id} value={tournament.id}>
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4" />
                                {tournament.name}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="home-team">Equipo Local</Label>
                      <Select
                        value={newGame.homeTeamId}
                        onValueChange={(value) => setNewGame({ ...newGame, homeTeamId: value })}
                        disabled={!newGame.tournamentId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar equipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableTeams().map((team) => (
                            <SelectItem key={team.id} value={team.id} disabled={team.id === newGame.awayTeamId}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="away-team">Equipo Visitante</Label>
                      <Select
                        value={newGame.awayTeamId}
                        onValueChange={(value) => setNewGame({ ...newGame, awayTeamId: value })}
                        disabled={!newGame.tournamentId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar equipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTeams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="game-date">Fecha</Label>
                      <Input
                        id="game-date"
                        type="date"
                        value={newGame.scheduledDate}
                        onChange={(e) => setNewGame({ ...newGame, scheduledDate: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="game-time">Hora</Label>
                      <Input
                        id="game-time"
                        type="time"
                        value={newGame.scheduledTime}
                        onChange={(e) => setNewGame({ ...newGame, scheduledTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAddGame}
                      disabled={
                        !newGame.tournamentId ||
                        !newGame.homeTeamId ||
                        !newGame.awayTeamId ||
                        !newGame.scheduledDate ||
                        !newGame.scheduledTime
                      }
                    >
                      Programar Partido
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Partidos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{games.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programados</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{gamesByStatus.scheduled.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Vivo</CardTitle>
              <Play className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{gamesByStatus.inProgress.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{gamesByStatus.completed.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todos ({games.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Programados ({gamesByStatus.scheduled.length})</TabsTrigger>
            <TabsTrigger value="live">En Vivo ({gamesByStatus.inProgress.length})</TabsTrigger>
            <TabsTrigger value="completed">Finalizados ({gamesByStatus.completed.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelados ({gamesByStatus.cancelled.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gamesByStatus.scheduled.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="live" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gamesByStatus.inProgress.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gamesByStatus.completed.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gamesByStatus.cancelled.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {games.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No hay partidos programados</h3>
            <p className="text-muted-foreground mb-4">Comienza programando el primer partido del torneo</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Programar Primer Partido
            </Button>
          </div>
        )}
      </main>

      <Dialog open={!!editingGame} onOpenChange={() => setEditingGame(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Partido</DialogTitle>
            <DialogDescription>Modifica los detalles del partido programado</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-tournament">Torneo</Label>
              <Select
                value={newGame.tournamentId}
                onValueChange={(value) =>
                  setNewGame({ ...newGame, tournamentId: value, homeTeamId: "", awayTeamId: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar torneo" />
                </SelectTrigger>
                <SelectContent>
                  {mockTournaments
                    .filter((t) => t.status === "active" || t.status === "upcoming")
                    .map((tournament) => (
                      <SelectItem key={tournament.id} value={tournament.id}>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          {tournament.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-home-team">Equipo Local</Label>
                <Select
                  value={newGame.homeTeamId}
                  onValueChange={(value) => setNewGame({ ...newGame, homeTeamId: value })}
                  disabled={!newGame.tournamentId}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTeams().map((team) => (
                      <SelectItem key={team.id} value={team.id} disabled={team.id === newGame.awayTeamId}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-away-team">Equipo Visitante</Label>
                <Select
                  value={newGame.awayTeamId}
                  onValueChange={(value) => setNewGame({ ...newGame, awayTeamId: value })}
                  disabled={!newGame.tournamentId}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-game-date">Fecha</Label>
                <Input
                  id="edit-game-date"
                  type="date"
                  value={newGame.scheduledDate}
                  onChange={(e) => setNewGame({ ...newGame, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="edit-game-time">Hora</Label>
                <Input
                  id="edit-game-time"
                  type="time"
                  value={newGame.scheduledTime}
                  onChange={(e) => setNewGame({ ...newGame, scheduledTime: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingGame(null)}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateGame}
                disabled={
                  !newGame.tournamentId ||
                  !newGame.homeTeamId ||
                  !newGame.awayTeamId ||
                  !newGame.scheduledDate ||
                  !newGame.scheduledTime
                }
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
