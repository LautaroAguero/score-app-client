"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { mockTeams, mockGames, mockTournaments } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { Calendar, Users, Trophy, Play, BarChart3, User, LogOut, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const upcomingGames = mockGames.filter((game) => game.status === "scheduled").slice(0, 3)
  const activeGames = mockGames.filter((game) => game.status === "in-progress")
  const activeTournaments = mockTournaments.filter((tournament) => tournament.status === "active")
  const upcomingTournaments = mockTournaments.filter((tournament) => tournament.status === "upcoming")

  const handleLogout = () => {
    logout()
    router.push("/login")
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
                <h1 className="text-2xl font-bold text-foreground">Administrador de Torneos</h1>
                <p className="text-sm text-muted-foreground">Sistema de gestión de básquet</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user.role === "organizer" && (
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/tournaments">
                      <Trophy className="w-4 h-4 mr-2" />
                      Torneos
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/teams">
                      <Users className="w-4 h-4 mr-2" />
                      Equipos
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/games">
                      <Play className="w-4 h-4 mr-2" />
                      Partidos
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/stats">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Estadísticas
                    </Link>
                  </Button>
                </div>
              )}

              {user.role === "team" && (
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/tournaments">
                      <Trophy className="w-4 h-4 mr-2" />
                      Torneos
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/players">
                      <Users className="w-4 h-4 mr-2" />
                      Jugadores
                    </Link>
                  </Button>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    <span>{user.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Badge variant="secondary" className="text-xs">
                      {user.role === "organizer" ? "Organizador" : "Equipo"}
                    </Badge>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Bienvenido, {user.name}</h2>
          <p className="text-muted-foreground">
            {user.role === "organizer"
              ? "Gestiona tus torneos, equipos y partidos desde el panel de control."
              : "Consulta los torneos disponibles y gestiona tu equipo."}
          </p>
        </div>

        {user.role === "organizer" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Torneos Activos</CardTitle>
                <Trophy className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{activeTournaments.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipos Registrados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{mockTeams.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Partidos Programados</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{upcomingGames.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Partidos en Vivo</CardTitle>
                <Play className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{activeGames.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {user.role === "organizer" ? "Torneos Activos" : "Torneos Disponibles"}
              </CardTitle>
              <CardDescription>
                {user.role === "organizer"
                  ? "Torneos en curso y próximos a comenzar"
                  : "Torneos en los que puedes participar"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...activeTournaments, ...upcomingTournaments.slice(0, 2)].map((tournament) => (
                <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{tournament.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {tournament.registeredTeams.length}/{tournament.maxTeams} equipos
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        tournament.status === "active" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }
                    >
                      {tournament.status === "active" ? "Activo" : "Próximo"}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {tournament.startDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}

              {activeTournaments.length === 0 && upcomingTournaments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No hay torneos disponibles</div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Games */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {user.role === "organizer" ? "Próximos Partidos" : "Mis Próximos Partidos"}
              </CardTitle>
              <CardDescription>
                {user.role === "organizer"
                  ? "Partidos programados para los próximos días"
                  : "Partidos de tu equipo programados"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingGames
                .filter(
                  (game) =>
                    user.role === "organizer" ||
                    (user.teamId && (game.homeTeamId === user.teamId || game.awayTeamId === user.teamId)),
                )
                .map((game) => {
                  const homeTeam = mockTeams.find((t) => t.id === game.homeTeamId)
                  const awayTeam = mockTeams.find((t) => t.id === game.awayTeamId)
                  const tournament = mockTournaments.find((t) => t.id === game.tournamentId)

                  return (
                    <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={homeTeam?.logo || "/placeholder.svg"}
                            alt={homeTeam?.name}
                            className="w-8 h-8 rounded"
                          />
                          <span className="font-medium">{homeTeam?.name}</span>
                        </div>
                        <span className="text-muted-foreground">vs</span>
                        <div className="flex items-center gap-2">
                          <img
                            src={awayTeam?.logo || "/placeholder.svg"}
                            alt={awayTeam?.name}
                            className="w-8 h-8 rounded"
                          />
                          <span className="font-medium">{awayTeam?.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {tournament && <div className="text-xs text-muted-foreground mb-1">{tournament.name}</div>}
                        <div className="text-sm font-medium">{game.scheduledDate.toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {game.scheduledDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  )
                })}

              {upcomingGames.filter(
                (game) =>
                  user.role === "organizer" ||
                  (user.teamId && (game.homeTeamId === user.teamId || game.awayTeamId === user.teamId)),
              ).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {user.role === "organizer" ? "No hay partidos programados" : "No tienes partidos programados"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
