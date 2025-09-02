"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockTeams, mockPlayers } from "@/lib/mock-data"
import type { Player } from "@/lib/types"
import { Search, Users, ArrowLeft, Filter, User } from "lucide-react"

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [selectedPosition, setSelectedPosition] = useState<string>("all")

  const filteredPlayers = useMemo(() => {
    return mockPlayers.filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) || player.number.toString().includes(searchTerm)
      const matchesTeam = selectedTeam === "all" || player.teamId === selectedTeam
      const matchesPosition = selectedPosition === "all" || player.position === selectedPosition

      return matchesSearch && matchesTeam && matchesPosition
    })
  }, [searchTerm, selectedTeam, selectedPosition])

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

  const positionStats = useMemo(() => {
    const stats = mockPlayers.reduce(
      (acc, player) => {
        acc[player.position] = (acc[player.position] || 0) + 1
        return acc
      },
      {} as Record<Player["position"], number>,
    )
    return stats
  }, [])

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
                <h1 className="text-2xl font-bold text-foreground">Gestión de Jugadores</h1>
                <p className="text-sm text-muted-foreground">Administra todos los jugadores del torneo</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/teams">
                <Users className="w-4 h-4 mr-2" />
                Gestionar Equipos
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jugadores</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{mockPlayers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bases</CardTitle>
              <Badge variant="outline">PG</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{positionStats.PG || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escoltas</CardTitle>
              <Badge variant="outline">SG</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{positionStats.SG || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aleros</CardTitle>
              <Badge variant="outline">SF</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{positionStats.SF || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pívots</CardTitle>
              <Badge variant="outline">C/PF</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{(positionStats.C || 0) + (positionStats.PF || 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar Jugador</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Nombre o número..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="team-filter">Filtrar por Equipo</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Equipos</SelectItem>
                    {mockTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="position-filter">Filtrar por Posición</Label>
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Posiciones</SelectItem>
                    <SelectItem value="PG">Base (PG)</SelectItem>
                    <SelectItem value="SG">Escolta (SG)</SelectItem>
                    <SelectItem value="SF">Alero (SF)</SelectItem>
                    <SelectItem value="PF">Ala-Pívot (PF)</SelectItem>
                    <SelectItem value="C">Pívot (C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedTeam("all")
                    setSelectedPosition("all")
                  }}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => {
            const teamColors = getTeamColors(player.teamId)
            return (
              <Card key={player.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: teamColors.primary }}
                      >
                        {player.number}
                      </div>
                      <div>
                        <CardTitle className="text-base">{player.name}</CardTitle>
                        <CardDescription>{getTeamName(player.teamId)}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${teamColors.secondary}20`,
                          color: teamColors.secondary,
                          borderColor: teamColors.secondary,
                        }}
                      >
                        {getPositionLabel(player.position)}
                      </Badge>
                      <Badge variant="outline">{player.position}</Badge>
                    </div>

                    {(player.height || player.weight) && (
                      <div className="text-sm text-muted-foreground">
                        {player.height && <span>{player.height}</span>}
                        {player.height && player.weight && <span> • </span>}
                        {player.weight && <span>{player.weight}</span>}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex gap-1">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: teamColors.primary }}
                          title="Color Primario del Equipo"
                        />
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: teamColors.secondary }}
                          title="Color Secundario del Equipo"
                        />
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/players/${player.id}`}>Ver Perfil</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || selectedTeam !== "all" || selectedPosition !== "all"
                ? "No se encontraron jugadores"
                : "No hay jugadores registrados"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedTeam !== "all" || selectedPosition !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Los jugadores se agregan desde la gestión de equipos"}
            </p>
            {(searchTerm || selectedTeam !== "all" || selectedPosition !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedTeam("all")
                  setSelectedPosition("all")
                }}
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        )}

        {/* Results Summary */}
        {(searchTerm || selectedTeam !== "all" || selectedPosition !== "all") && filteredPlayers.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Mostrando {filteredPlayers.length} de {mockPlayers.length} jugadores
          </div>
        )}
      </main>
    </div>
  )
}
