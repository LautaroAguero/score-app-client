"use client"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { mockTeams, mockPlayers, mockGames } from "@/lib/mock-data"
import type { Player } from "@/lib/types"
import { ArrowLeft, Trophy, Target, Clock, TrendingUp } from "lucide-react"

export default function PlayerDetailPage() {
  const params = useParams()
  const playerId = params.id as string

  const player = mockPlayers.find((p) => p.id === playerId)
  const team = player ? mockTeams.find((t) => t.id === player.teamId) : null

  if (!player || !team) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Jugador no encontrado</h1>
          <p className="text-muted-foreground mb-4">El jugador que buscas no existe</p>
          <Button asChild>
            <Link href="/players">Volver a Jugadores</Link>
          </Button>
        </div>
      </div>
    )
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

  // Mock stats for demonstration
  const playerStats = {
    gamesPlayed: 12,
    pointsPerGame: 18.5,
    reboundsPerGame: 7.2,
    assistsPerGame: 4.8,
    stealsPerGame: 1.3,
    blocksPerGame: 0.8,
    fieldGoalPercentage: 47.2,
    threePointPercentage: 35.8,
    freeThrowPercentage: 82.1,
    minutesPerGame: 32.4,
    totalPoints: 222,
    totalRebounds: 86,
    totalAssists: 58,
  }

  const teamGames = mockGames.filter((game) => game.homeTeamId === player.teamId || game.awayTeamId === player.teamId)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/players">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Jugadores
                </Link>
              </Button>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                  style={{ backgroundColor: team.primaryColor }}
                >
                  {player.number}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{player.name}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{team.name}</span>
                    <span>•</span>
                    <span>{getPositionLabel(player.position)}</span>
                    {(player.height || player.weight) && (
                      <>
                        <span>•</span>
                        <span>
                          {player.height && player.height}
                          {player.height && player.weight && ", "}
                          {player.weight && player.weight}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/teams/${team.id}`}>Ver Equipo</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partidos Jugados</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{playerStats.gamesPlayed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Puntos por Partido</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{playerStats.pointsPerGame}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rebotes por Partido</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{playerStats.reboundsPerGame}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minutos por Partido</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{playerStats.minutesPerGame}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detailed Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas Detalladas</CardTitle>
              <CardDescription>Promedios por partido en la temporada actual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Puntos por Partido</span>
                    <span className="font-medium">{playerStats.pointsPerGame}</span>
                  </div>
                  <Progress value={(playerStats.pointsPerGame / 30) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Rebotes por Partido</span>
                    <span className="font-medium">{playerStats.reboundsPerGame}</span>
                  </div>
                  <Progress value={(playerStats.reboundsPerGame / 15) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Asistencias por Partido</span>
                    <span className="font-medium">{playerStats.assistsPerGame}</span>
                  </div>
                  <Progress value={(playerStats.assistsPerGame / 10) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Robos por Partido</span>
                    <span className="font-medium">{playerStats.stealsPerGame}</span>
                  </div>
                  <Progress value={(playerStats.stealsPerGame / 3) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bloqueos por Partido</span>
                    <span className="font-medium">{playerStats.blocksPerGame}</span>
                  </div>
                  <Progress value={(playerStats.blocksPerGame / 3) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shooting Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Porcentajes de Tiro</CardTitle>
              <CardDescription>Efectividad en diferentes tipos de tiro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tiros de Campo</span>
                    <span className="font-medium">{playerStats.fieldGoalPercentage}%</span>
                  </div>
                  <Progress value={playerStats.fieldGoalPercentage} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Triples</span>
                    <span className="font-medium">{playerStats.threePointPercentage}%</span>
                  </div>
                  <Progress value={playerStats.threePointPercentage} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tiros Libres</span>
                    <span className="font-medium">{playerStats.freeThrowPercentage}%</span>
                  </div>
                  <Progress value={playerStats.freeThrowPercentage} className="h-2" />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Totales de la Temporada</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{playerStats.totalPoints}</div>
                    <div className="text-xs text-muted-foreground">Puntos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{playerStats.totalRebounds}</div>
                    <div className="text-xs text-muted-foreground">Rebotes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{playerStats.totalAssists}</div>
                    <div className="text-xs text-muted-foreground">Asistencias</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Información del Equipo</CardTitle>
            <CardDescription>Detalles del equipo actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={team.logo || "/placeholder.svg?height=48&width=48&query=basketball team logo"}
                  alt={team.name}
                  className="w-12 h-12 rounded"
                />
                <div>
                  <h3 className="font-medium text-foreground">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {mockPlayers.filter((p) => p.teamId === team.id).length} jugadores en plantilla
                  </p>
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
              <div className="flex gap-2">
                <Badge variant="secondary">{getPositionLabel(player.position)}</Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/teams/${team.id}`}>Ver Equipo Completo</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
