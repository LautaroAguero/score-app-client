"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockTournaments, mockTeams, mockGames, mockTournamentStandings } from "@/lib/mock-data"
import type { Tournament } from "@/lib/types"
import { Trophy, ArrowLeft, Users, Calendar, Plus, Settings, Play, Crown, Medal, Award } from "lucide-react"

export default function TournamentDetailPage() {
  const params = useParams()
  const tournamentId = params.id as string

  const tournament = mockTournaments.find((t) => t.id === tournamentId)
  const tournamentGames = mockGames.filter((g) => g.tournamentId === tournamentId)
  const tournamentStandings = mockTournamentStandings.filter((s) => s.tournamentId === tournamentId)
  const registeredTeams = mockTeams.filter((team) => tournament?.registeredTeams.includes(team.id))
  const availableTeams = mockTeams.filter((team) => !tournament?.registeredTeams.includes(team.id))

  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false)

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Torneo no encontrado</h1>
          <p className="text-muted-foreground mb-4">El torneo que buscas no existe</p>
          <Button asChild>
            <Link href="/tournaments">Volver a Torneos</Link>
          </Button>
        </div>
      </div>
    )
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

  const handleAddTeam = (formData: FormData) => {
    const teamId = formData.get("teamId") as string
    // In a real app, this would update the tournament in the database
    console.log("Adding team", teamId, "to tournament", tournamentId)
    setIsAddTeamDialogOpen(false)
  }

  const generateSingleEliminationBracket = () => {
    const teams = registeredTeams.slice(0, 8) // Limit to 8 teams for demo
    const rounds = [
      { name: "Cuartos de Final", games: [] as any[] },
      { name: "Semifinales", games: [] as any[] },
      { name: "Final", games: [] as any[] },
    ]

    // Generate quarterfinals
    for (let i = 0; i < teams.length; i += 2) {
      if (teams[i + 1]) {
        const game = tournamentGames.find(
          (g) =>
            (g.homeTeamId === teams[i].id && g.awayTeamId === teams[i + 1].id) ||
            (g.homeTeamId === teams[i + 1].id && g.awayTeamId === teams[i].id),
        )
        rounds[0].games.push({
          homeTeam: teams[i],
          awayTeam: teams[i + 1],
          game: game,
          winner: game?.status === "completed" ? (game.homeScore > game.awayScore ? teams[i] : teams[i + 1]) : null,
        })
      }
    }

    // Generate semifinals (simplified logic)
    const quarterWinners = rounds[0].games.filter((g) => g.winner).map((g) => g.winner)
    for (let i = 0; i < quarterWinners.length; i += 2) {
      if (quarterWinners[i + 1]) {
        const game = tournamentGames.find(
          (g) =>
            (g.homeTeamId === quarterWinners[i].id && g.awayTeamId === quarterWinners[i + 1].id) ||
            (g.homeTeamId === quarterWinners[i + 1].id && g.awayTeamId === quarterWinners[i].id),
        )
        rounds[1].games.push({
          homeTeam: quarterWinners[i],
          awayTeam: quarterWinners[i + 1],
          game: game,
          winner:
            game?.status === "completed"
              ? game.homeScore > game.awayScore
                ? quarterWinners[i]
                : quarterWinners[i + 1]
              : null,
        })
      }
    }

    // Generate final
    const semiWinners = rounds[1].games.filter((g) => g.winner).map((g) => g.winner)
    if (semiWinners.length >= 2) {
      const game = tournamentGames.find(
        (g) =>
          (g.homeTeamId === semiWinners[0].id && g.awayTeamId === semiWinners[1].id) ||
          (g.homeTeamId === semiWinners[1].id && g.awayTeamId === semiWinners[0].id),
      )
      rounds[2].games.push({
        homeTeam: semiWinners[0],
        awayTeam: semiWinners[1],
        game: game,
        winner:
          game?.status === "completed" ? (game.homeScore > game.awayScore ? semiWinners[0] : semiWinners[1]) : null,
      })
    }

    return rounds
  }

  const bracketRounds = tournament.format === "single-elimination" ? generateSingleEliminationBracket() : []

  const enhancedStandings = tournamentStandings
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      if (b.pointsDifferential !== a.pointsDifferential) return b.pointsDifferential - a.pointsDifferential
      return b.pointsFor - a.pointsFor
    })
    .map((standing, index) => {
      const team = mockTeams.find((t) => t.id === standing.teamId)
      const winPercentage = standing.gamesPlayed > 0 ? (standing.wins / standing.gamesPlayed) * 100 : 0
      const avgPointsFor = standing.gamesPlayed > 0 ? standing.pointsFor / standing.gamesPlayed : 0
      const avgPointsAgainst = standing.gamesPlayed > 0 ? standing.pointsAgainst / standing.gamesPlayed : 0

      return {
        ...standing,
        team,
        position: index + 1,
        winPercentage,
        avgPointsFor,
        avgPointsAgainst,
      }
    })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tournaments">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{tournament.name}</h1>
                  <p className="text-sm text-muted-foreground">{tournament.description}</p>
                </div>
              </div>
              <Badge className={getStatusColor(tournament.status)}>{getStatusText(tournament.status)}</Badge>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddTeamDialogOpen} onOpenChange={setIsAddTeamDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={availableTeams.length === 0 || tournament.registeredTeams.length >= tournament.maxTeams}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Equipo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Equipo al Torneo</DialogTitle>
                    <DialogDescription>Selecciona un equipo para registrar en el torneo</DialogDescription>
                  </DialogHeader>
                  <form action={handleAddTeam} className="space-y-4">
                    <div>
                      <Select name="teamId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar equipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTeams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              <div className="flex items-center gap-2">
                                <img
                                  src={team.logo || "/placeholder.svg"}
                                  alt={team.name}
                                  className="w-6 h-6 rounded"
                                />
                                {team.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddTeamDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Agregar Equipo</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tournament Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Formato</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-primary">{getFormatText(tournament.format)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-primary">
                {tournament.registeredTeams.length}/{tournament.maxTeams}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fecha de Inicio</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-primary">{tournament.startDate.toLocaleDateString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partidos</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-primary">{tournamentGames.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tournament Content */}
        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="teams">Equipos</TabsTrigger>
            <TabsTrigger value="games">Partidos</TabsTrigger>
            <TabsTrigger value="standings">Posiciones</TabsTrigger>
            <TabsTrigger value="bracket">Bracket</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredTeams.map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <img src={team.logo || "/placeholder.svg"} alt={team.name} className="w-12 h-12 rounded" />
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: team.primaryColor }} />
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: team.secondaryColor }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/teams/${team.id}`}>Ver Equipo</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {registeredTeams.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No hay equipos registrados</h3>
                <p className="text-muted-foreground mb-4">Agrega equipos para comenzar el torneo</p>
                <Button onClick={() => setIsAddTeamDialogOpen(true)} disabled={availableTeams.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primer Equipo
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <div className="space-y-4">
              {tournamentGames.map((game) => {
                const homeTeam = mockTeams.find((t) => t.id === game.homeTeamId)
                const awayTeam = mockTeams.find((t) => t.id === game.awayTeamId)

                return (
                  <Card key={game.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={homeTeam?.logo || "/placeholder.svg"}
                              alt={homeTeam?.name}
                              className="w-10 h-10 rounded"
                            />
                            <div>
                              <div className="font-medium">{homeTeam?.name}</div>
                              <div className="text-2xl font-bold">{game.homeScore}</div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">vs</div>
                            {game.round && (
                              <Badge variant="outline" className="mt-1">
                                {game.round}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-medium">{awayTeam?.name}</div>
                              <div className="text-2xl font-bold">{game.awayScore}</div>
                            </div>
                            <img
                              src={awayTeam?.logo || "/placeholder.svg"}
                              alt={awayTeam?.name}
                              className="w-10 h-10 rounded"
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={
                              game.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : game.status === "in-progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }
                          >
                            {game.status === "completed"
                              ? "Finalizado"
                              : game.status === "in-progress"
                                ? "En Vivo"
                                : "Programado"}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {game.scheduledDate.toLocaleDateString()} -{" "}
                            {game.scheduledDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <Button asChild size="sm" className="mt-2">
                            <Link href={`/games/${game.id}`}>Ver Partido</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {tournamentGames.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No hay partidos programados</h3>
                <p className="text-muted-foreground">Los partidos aparecerán aquí una vez que se genere el fixture</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="standings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Tabla de Posiciones
                </CardTitle>
                <CardDescription>Clasificación actual del torneo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enhancedStandings.map((standing) => (
                    <div key={standing.teamId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              standing.position === 1
                                ? "bg-yellow-100 text-yellow-800"
                                : standing.position === 2
                                  ? "bg-gray-100 text-gray-800"
                                  : standing.position === 3
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-primary text-primary-foreground"
                            }`}
                          >
                            {standing.position === 1 ? (
                              <Crown className="w-4 h-4" />
                            ) : standing.position === 2 ? (
                              <Medal className="w-4 h-4" />
                            ) : standing.position === 3 ? (
                              <Award className="w-4 h-4" />
                            ) : (
                              standing.position
                            )}
                          </div>
                        </div>
                        <img
                          src={standing.team?.logo || "/placeholder.svg"}
                          alt={standing.team?.name}
                          className="w-10 h-10 rounded"
                        />
                        <div>
                          <div className="font-medium">{standing.team?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {standing.wins}V - {standing.losses}D ({standing.winPercentage.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-4 text-center text-sm">
                        <div>
                          <div className="text-muted-foreground">PJ</div>
                          <div className="font-medium">{standing.gamesPlayed}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">PF</div>
                          <div className="font-medium">{standing.pointsFor}</div>
                          <div className="text-xs text-muted-foreground">({standing.avgPointsFor.toFixed(1)})</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">PC</div>
                          <div className="font-medium">{standing.pointsAgainst}</div>
                          <div className="text-xs text-muted-foreground">({standing.avgPointsAgainst.toFixed(1)})</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Dif</div>
                          <div
                            className={`font-medium ${standing.pointsDifferential >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {standing.pointsDifferential > 0 ? "+" : ""}
                            {standing.pointsDifferential}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Eff</div>
                          <div className="font-medium text-primary">
                            {((standing.pointsFor / (standing.pointsFor + standing.pointsAgainst)) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bracket" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Bracket del Torneo
                </CardTitle>
                <CardDescription>Estructura de eliminación del torneo</CardDescription>
              </CardHeader>
              <CardContent>
                {tournament.format === "single-elimination" && bracketRounds.length > 0 ? (
                  <div className="space-y-8">
                    {bracketRounds.map((round, roundIndex) => (
                      <div key={roundIndex} className="space-y-4">
                        <h3 className="text-lg font-semibold text-center">{round.name}</h3>
                        <div
                          className="grid gap-4"
                          style={{ gridTemplateColumns: `repeat(${Math.max(1, round.games.length)}, 1fr)` }}
                        >
                          {round.games.map((matchup, gameIndex) => (
                            <Card key={gameIndex} className="p-4">
                              <div className="space-y-3">
                                <div
                                  className={`flex items-center justify-between p-2 rounded ${
                                    matchup.winner?.id === matchup.homeTeam.id
                                      ? "bg-green-50 border-green-200"
                                      : "bg-gray-50"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={matchup.homeTeam.logo || "/placeholder.svg"}
                                      alt={matchup.homeTeam.name}
                                      className="w-6 h-6 rounded"
                                    />
                                    <span className="font-medium text-sm">{matchup.homeTeam.name}</span>
                                  </div>
                                  <div className="font-bold">
                                    {matchup.game?.status === "completed" ? matchup.game.homeScore : "-"}
                                  </div>
                                </div>
                                <div
                                  className={`flex items-center justify-between p-2 rounded ${
                                    matchup.winner?.id === matchup.awayTeam.id
                                      ? "bg-green-50 border-green-200"
                                      : "bg-gray-50"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={matchup.awayTeam.logo || "/placeholder.svg"}
                                      alt={matchup.awayTeam.name}
                                      className="w-6 h-6 rounded"
                                    />
                                    <span className="font-medium text-sm">{matchup.awayTeam.name}</span>
                                  </div>
                                  <div className="font-bold">
                                    {matchup.game?.status === "completed" ? matchup.game.awayScore : "-"}
                                  </div>
                                </div>
                                {matchup.game && (
                                  <div className="text-center">
                                    <Badge variant={matchup.game.status === "completed" ? "default" : "secondary"}>
                                      {matchup.game.status === "completed"
                                        ? "Finalizado"
                                        : matchup.game.status === "in-progress"
                                          ? "En Vivo"
                                          : "Programado"}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Champion Display */}
                    {bracketRounds[2]?.games[0]?.winner && (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border-2 border-yellow-200">
                          <Crown className="w-8 h-8 text-yellow-600" />
                          <div>
                            <h3 className="text-xl font-bold text-yellow-800">Campeón del Torneo</h3>
                            <div className="flex items-center gap-3 mt-2">
                              <img
                                src={bracketRounds[2].games[0].winner.logo || "/placeholder.svg"}
                                alt={bracketRounds[2].games[0].winner.name}
                                className="w-10 h-10 rounded"
                              />
                              <span className="text-lg font-semibold text-yellow-800">
                                {bracketRounds[2].games[0].winner.name}
                              </span>
                            </div>
                          </div>
                          <Trophy className="w-8 h-8 text-yellow-600" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : tournament.format === "round-robin" ? (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Formato de Liga</h3>
                    <p className="text-muted-foreground">
                      En el formato de liga todos los equipos juegan entre sí. Consulta la tabla de posiciones para ver
                      el ranking.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Bracket en desarrollo</h3>
                    <p className="text-muted-foreground">
                      La visualización del bracket para este formato estará disponible próximamente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
