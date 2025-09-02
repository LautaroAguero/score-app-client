"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockTeams, mockGames, mockPlayers } from "@/lib/mock-data"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

export default function GameDetailPage() {
  const params = useParams()
  const gameId = params.id as string

  const game = mockGames.find((g) => g.id === gameId)
  const homeTeam = game ? mockTeams.find((t) => t.id === game.homeTeamId) : null
  const awayTeam = game ? mockTeams.find((t) => t.id === game.awayTeamId) : null

  if (!game || !homeTeam || !awayTeam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Partido no encontrado</h1>
          <p className="text-muted-foreground mb-4">El partido que buscas no existe</p>
          <Button asChild>
            <Link href="/games">Volver a Partidos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const homeTeamPlayers = mockPlayers.filter((p) => p.teamId === game.homeTeamId)
  const awayTeamPlayers = mockPlayers.filter((p) => p.teamId === game.awayTeamId)

  const getStatusBadge = (status: typeof game.status) => {
    const statusConfig = {
      scheduled: { label: "Programado", variant: "secondary" as const },
      "in-progress": { label: "En Vivo", variant: "default" as const },
      completed: { label: "Finalizado", variant: "outline" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const },
    }
    return <Badge variant={statusConfig[status].variant}>{statusConfig[status].label}</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/games">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Partidos
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {homeTeam.name} vs {awayTeam.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {game.scheduledDate.toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {game.scheduledDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {getStatusBadge(game.status)}
                </div>
              </div>
            </div>
            {game.status === "in-progress" && (
              <Button asChild>
                <Link href={`/games/${game.id}/live`}>Ir al Partido en Vivo</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Game Score */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Marcador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {/* Home Team */}
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={homeTeam.logo || "/placeholder.svg?height=64&width=64&query=basketball team logo"}
                  alt={homeTeam.name}
                  className="w-16 h-16 rounded"
                />
                <div>
                  <h2 className="text-2xl font-bold">{homeTeam.name}</h2>
                  <p className="text-muted-foreground">Local</p>
                </div>
              </div>

              {/* Score */}
              <div className="text-center px-8">
                <div className="text-6xl font-bold text-primary">
                  {game.homeScore} - {game.awayScore}
                </div>
                {game.status === "in-progress" && (
                  <div className="text-lg text-muted-foreground mt-2">
                    Cuarto {game.quarter} - {game.timeRemaining}
                  </div>
                )}
                {game.status === "completed" && <div className="text-lg text-muted-foreground mt-2">Final</div>}
              </div>

              {/* Away Team */}
              <div className="flex items-center gap-4 flex-1 justify-end">
                <div className="text-right">
                  <h2 className="text-2xl font-bold">{awayTeam.name}</h2>
                  <p className="text-muted-foreground">Visitante</p>
                </div>
                <img
                  src={awayTeam.logo || "/placeholder.svg?height=64&width=64&query=basketball team logo"}
                  alt={awayTeam.name}
                  className="w-16 h-16 rounded"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Home Team Roster */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img
                  src={homeTeam.logo || "/placeholder.svg?height=24&width=24&query=basketball team logo"}
                  alt={homeTeam.name}
                  className="w-6 h-6 rounded"
                />
                {homeTeam.name} - Plantilla
              </CardTitle>
              <CardDescription>{homeTeamPlayers.length} jugadores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {homeTeamPlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: homeTeam.primaryColor }}
                      >
                        {player.number}
                      </div>
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-muted-foreground">{player.position}</div>
                      </div>
                    </div>
                    <Badge variant="outline">{player.position}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Away Team Roster */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img
                  src={awayTeam.logo || "/placeholder.svg?height=24&width=24&query=basketball team logo"}
                  alt={awayTeam.name}
                  className="w-6 h-6 rounded"
                />
                {awayTeam.name} - Plantilla
              </CardTitle>
              <CardDescription>{awayTeamPlayers.length} jugadores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {awayTeamPlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: awayTeam.primaryColor }}
                      >
                        {player.number}
                      </div>
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-muted-foreground">{player.position}</div>
                      </div>
                    </div>
                    <Badge variant="outline">{player.position}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Stats (if completed) */}
        {game.status === "completed" && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Estadísticas del Partido</CardTitle>
              <CardDescription>Resumen estadístico del encuentro</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Rebotes Totales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Asistencias Totales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Faltas Totales</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
