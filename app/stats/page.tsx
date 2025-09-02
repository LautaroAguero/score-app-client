"use client"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { mockTeams, mockPlayers, mockGames } from "@/lib/mock-data"
import { ArrowLeft, Trophy, Target, Users, TrendingUp, Download, BarChart3 } from "lucide-react"

export default function StatsPage() {
  // Mock enhanced data for demonstration
  const enhancedPlayers = mockPlayers.map((player) => ({
    ...player,
    stats: {
      gamesPlayed: Math.floor(Math.random() * 15) + 5,
      pointsPerGame: Math.round((Math.random() * 25 + 5) * 10) / 10,
      reboundsPerGame: Math.round((Math.random() * 10 + 2) * 10) / 10,
      assistsPerGame: Math.round((Math.random() * 8 + 1) * 10) / 10,
      stealsPerGame: Math.round((Math.random() * 3 + 0.5) * 10) / 10,
      blocksPerGame: Math.round((Math.random() * 2 + 0.2) * 10) / 10,
      fieldGoalPercentage: Math.round((Math.random() * 30 + 35) * 10) / 10,
      threePointPercentage: Math.round((Math.random() * 25 + 25) * 10) / 10,
      freeThrowPercentage: Math.round((Math.random() * 25 + 65) * 10) / 10,
      totalPoints: 0,
      totalRebounds: 0,
      totalAssists: 0,
    },
  }))

  // Calculate totals
  enhancedPlayers.forEach((player) => {
    player.stats.totalPoints = Math.round(player.stats.pointsPerGame * player.stats.gamesPlayed)
    player.stats.totalRebounds = Math.round(player.stats.reboundsPerGame * player.stats.gamesPlayed)
    player.stats.totalAssists = Math.round(player.stats.assistsPerGame * player.stats.gamesPlayed)
  })

  const enhancedTeams = mockTeams.map((team) => {
    const teamPlayers = enhancedPlayers.filter((p) => p.teamId === team.id)
    const teamGames = mockGames.filter((g) => g.homeTeamId === team.id || g.awayTeamId === team.id)
    const wins = Math.floor(Math.random() * 8) + 2
    const losses = Math.floor(Math.random() * 5) + 1

    return {
      ...team,
      stats: {
        wins,
        losses,
        winPercentage: Math.round((wins / (wins + losses)) * 1000) / 10,
        pointsFor: teamPlayers.reduce((sum, p) => sum + p.stats.totalPoints, 0),
        pointsAgainst: Math.floor(Math.random() * 200) + 400,
        pointDifferential: 0,
        gamesPlayed: wins + losses,
      },
    }
  })

  // Calculate point differential
  enhancedTeams.forEach((team) => {
    team.stats.pointDifferential = team.stats.pointsFor - team.stats.pointsAgainst
  })

  // Sort teams by win percentage
  const teamStandings = [...enhancedTeams].sort((a, b) => b.stats.winPercentage - a.stats.winPercentage)

  // Player leaderboards
  const topScorers = [...enhancedPlayers].sort((a, b) => b.stats.pointsPerGame - a.stats.pointsPerGame).slice(0, 10)
  const topRebounders = [...enhancedPlayers]
    .sort((a, b) => b.stats.reboundsPerGame - a.stats.reboundsPerGame)
    .slice(0, 10)
  const topAssists = [...enhancedPlayers].sort((a, b) => b.stats.assistsPerGame - a.stats.assistsPerGame).slice(0, 10)
  const topShooters = [...enhancedPlayers]
    .filter((p) => p.stats.gamesPlayed >= 5)
    .sort((a, b) => b.stats.fieldGoalPercentage - a.stats.fieldGoalPercentage)
    .slice(0, 10)

  const getTeamName = (teamId: string) => {
    return mockTeams.find((team) => team.id === teamId)?.name || "Equipo Desconocido"
  }

  const getTeamColors = (teamId: string) => {
    const team = mockTeams.find((team) => team.id === teamId)
    return {
      primary: team?.primaryColor || "#164e63",
      secondary: team?.secondaryColor || "#f59e0b",
    }
  }

  const PlayerLeaderboardCard = ({
    title,
    players,
    statKey,
    statLabel,
    icon: Icon,
  }: {
    title: string
    players: typeof enhancedPlayers
    statKey: keyof (typeof enhancedPlayers)[0]["stats"]
    statLabel: string
    icon: any
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>Top 10 jugadores en {statLabel.toLowerCase()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players.map((player, index) => {
            const teamColors = getTeamColors(player.teamId)
            return (
              <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: teamColors.primary }}
                  >
                    {player.number}
                  </div>
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-muted-foreground">{getTeamName(player.teamId)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{player.stats[statKey]}</div>
                  <div className="text-xs text-muted-foreground">{statLabel}</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )

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
                <h1 className="text-2xl font-bold text-foreground">Estadísticas y Reportes</h1>
                <p className="text-sm text-muted-foreground">Análisis completo del torneo</p>
              </div>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Reporte
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tournament Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Equipos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{mockTeams.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Jugadores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{mockPlayers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partidos Jugados</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {mockGames.filter((g) => g.status === "completed").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio de Puntos</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {Math.round(
                  (enhancedPlayers.reduce((sum, p) => sum + p.stats.pointsPerGame, 0) / enhancedPlayers.length) * 10,
                ) / 10}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="standings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="standings">Clasificación</TabsTrigger>
            <TabsTrigger value="players">Líderes Individuales</TabsTrigger>
            <TabsTrigger value="teams">Estadísticas de Equipos</TabsTrigger>
            <TabsTrigger value="games">Historial de Partidos</TabsTrigger>
          </TabsList>

          {/* Team Standings */}
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
                  {teamStandings.map((team, index) => (
                    <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <img
                          src={team.logo || "/placeholder.svg?height=32&width=32&query=basketball team logo"}
                          alt={team.name}
                          className="w-8 h-8 rounded"
                        />
                        <div>
                          <div className="font-medium">{team.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {team.stats.wins}V - {team.stats.losses}D
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-sm font-medium">{team.stats.winPercentage}%</div>
                          <div className="text-xs text-muted-foreground">% Victoria</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{team.stats.pointsFor}</div>
                          <div className="text-xs text-muted-foreground">Puntos A Favor</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{team.stats.pointsAgainst}</div>
                          <div className="text-xs text-muted-foreground">Puntos En Contra</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-sm font-medium ${team.stats.pointDifferential >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {team.stats.pointDifferential >= 0 ? "+" : ""}
                            {team.stats.pointDifferential}
                          </div>
                          <div className="text-xs text-muted-foreground">Diferencia</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Player Leaders */}
          <TabsContent value="players" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PlayerLeaderboardCard
                title="Máximos Anotadores"
                players={topScorers}
                statKey="pointsPerGame"
                statLabel="PPJ"
                icon={Target}
              />
              <PlayerLeaderboardCard
                title="Máximos Reboteadores"
                players={topRebounders}
                statKey="reboundsPerGame"
                statLabel="RPJ"
                icon={TrendingUp}
              />
              <PlayerLeaderboardCard
                title="Máximos Asistentes"
                players={topAssists}
                statKey="assistsPerGame"
                statLabel="APJ"
                icon={Users}
              />
              <PlayerLeaderboardCard
                title="Mejor Porcentaje de Tiro"
                players={topShooters}
                statKey="fieldGoalPercentage"
                statLabel="% TC"
                icon={Target}
              />
            </div>
          </TabsContent>

          {/* Team Statistics */}
          <TabsContent value="teams" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enhancedTeams.map((team) => {
                const teamPlayers = enhancedPlayers.filter((p) => p.teamId === team.id)
                const avgPoints = teamPlayers.reduce((sum, p) => sum + p.stats.pointsPerGame, 0) / teamPlayers.length
                const avgRebounds =
                  teamPlayers.reduce((sum, p) => sum + p.stats.reboundsPerGame, 0) / teamPlayers.length
                const avgAssists = teamPlayers.reduce((sum, p) => sum + p.stats.assistsPerGame, 0) / teamPlayers.length

                return (
                  <Card key={team.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <img
                          src={team.logo || "/placeholder.svg?height=32&width=32&query=basketball team logo"}
                          alt={team.name}
                          className="w-8 h-8 rounded"
                        />
                        {team.name}
                        <Badge variant="secondary">
                          {team.stats.wins}V-{team.stats.losses}D
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{Math.round(avgPoints * 10) / 10}</div>
                          <div className="text-sm text-muted-foreground">Puntos por Partido</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{team.stats.winPercentage}%</div>
                          <div className="text-sm text-muted-foreground">% de Victoria</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Rebotes por Partido</span>
                            <span className="font-medium">{Math.round(avgRebounds * 10) / 10}</span>
                          </div>
                          <Progress value={(avgRebounds / 15) * 100} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Asistencias por Partido</span>
                            <span className="font-medium">{Math.round(avgAssists * 10) / 10}</span>
                          </div>
                          <Progress value={(avgAssists / 10) * 100} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Diferencia de Puntos</span>
                            <span
                              className={`font-medium ${team.stats.pointDifferential >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {team.stats.pointDifferential >= 0 ? "+" : ""}
                              {team.stats.pointDifferential}
                            </span>
                          </div>
                          <Progress
                            value={Math.min((Math.abs(team.stats.pointDifferential) / 100) * 100, 100)}
                            className="h-2"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="text-sm text-muted-foreground">{teamPlayers.length} jugadores registrados</div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Games History */}
          <TabsContent value="games" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Partidos</CardTitle>
                <CardDescription>Resultados de todos los partidos del torneo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockGames.map((game) => {
                    const homeTeam = mockTeams.find((t) => t.id === game.homeTeamId)
                    const awayTeam = mockTeams.find((t) => t.id === game.awayTeamId)

                    return (
                      <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">{game.scheduledDate.toLocaleDateString()}</div>
                          <div className="flex items-center gap-2">
                            <img
                              src={homeTeam?.logo || "/placeholder.svg?height=24&width=24&query=basketball team logo"}
                              alt={homeTeam?.name}
                              className="w-6 h-6 rounded"
                            />
                            <span className="font-medium">{homeTeam?.name}</span>
                          </div>
                          <span className="text-muted-foreground">vs</span>
                          <div className="flex items-center gap-2">
                            <img
                              src={awayTeam?.logo || "/placeholder.svg?height=24&width=24&query=basketball team logo"}
                              alt={awayTeam?.name}
                              className="w-6 h-6 rounded"
                            />
                            <span className="font-medium">{awayTeam?.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {game.status === "completed" ? (
                            <div className="text-lg font-bold">
                              {game.homeScore} - {game.awayScore}
                            </div>
                          ) : (
                            <Badge variant={game.status === "in-progress" ? "default" : "secondary"}>
                              {game.status === "scheduled" && "Programado"}
                              {game.status === "in-progress" && "En Vivo"}
                              {game.status === "cancelled" && "Cancelado"}
                            </Badge>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/games/${game.id}`}>Ver Detalles</Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
