"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockTeams, mockGames, mockPlayers } from "@/lib/mock-data"
import type { GameAction } from "@/lib/types"
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  RotateCcw,
  Users,
  Target,
  Hand,
  Shield,
  Zap,
  AlertTriangle,
  Timer,
} from "lucide-react"

export default function LiveGamePage() {
  const params = useParams()
  const gameId = params.id as string
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const game = mockGames.find((g) => g.id === gameId)
  const homeTeam = game ? mockTeams.find((t) => t.id === game.homeTeamId) : null
  const awayTeam = game ? mockTeams.find((t) => t.id === game.awayTeamId) : null
  const homeTeamPlayers = game ? mockPlayers.filter((p) => p.teamId === game.homeTeamId) : []
  const awayTeamPlayers = game ? mockPlayers.filter((p) => p.teamId === game.awayTeamId) : []

  // Game state
  const [gameState, setGameState] = useState({
    homeScore: game?.homeScore || 0,
    awayScore: game?.awayScore || 0,
    quarter: game?.quarter || 1,
    timeRemaining: game?.timeRemaining || "10:00",
    isRunning: false,
    homeTimeouts: 3,
    awayTimeouts: 3,
  })

  // Action state
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<string>("")
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away" | null>(null)
  const [showPlayerDialog, setShowPlayerDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    type: string
    points?: number
    position: { x: number; y: number }
  } | null>(null)

  // Game actions history
  const [gameActions, setGameActions] = useState<GameAction[]>([])

  // Statistics
  const [stats, setStats] = useState({
    home: {
      fieldGoals: 0,
      fieldGoalAttempts: 0,
      threePointers: 0,
      threePointerAttempts: 0,
      freeThrows: 0,
      freeThrowAttempts: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
    },
    away: {
      fieldGoals: 0,
      fieldGoalAttempts: 0,
      threePointers: 0,
      threePointerAttempts: 0,
      freeThrows: 0,
      freeThrowAttempts: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
    },
  })

  // Timer logic
  useEffect(() => {
    if (gameState.isRunning) {
      intervalRef.current = setInterval(() => {
        setGameState((prev) => {
          const [minutes, seconds] = prev.timeRemaining.split(":").map(Number)
          const totalSeconds = minutes * 60 + seconds

          if (totalSeconds <= 0) {
            // End of quarter
            if (prev.quarter < 4) {
              return {
                ...prev,
                quarter: prev.quarter + 1,
                timeRemaining: "10:00",
                isRunning: false,
              }
            } else {
              // End of game
              return {
                ...prev,
                isRunning: false,
              }
            }
          }

          const newTotalSeconds = totalSeconds - 1
          const newMinutes = Math.floor(newTotalSeconds / 60)
          const newSeconds = newTotalSeconds % 60

          return {
            ...prev,
            timeRemaining: `${newMinutes}:${newSeconds.toString().padStart(2, "0")}`,
          }
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [gameState.isRunning])

  const toggleTimer = () => {
    setGameState((prev) => ({ ...prev, isRunning: !prev.isRunning }))
  }

  const resetQuarter = () => {
    setGameState((prev) => ({ ...prev, timeRemaining: "10:00", isRunning: false }))
  }

  const handleCourtClick = (event: React.MouseEvent<SVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    // Determine if it's a 2-point or 3-point shot based on position
    const isThreePoint = x < 15 || x > 85 || y < 20 || y > 80

    setPendingAction({
      type: isThreePoint ? "field_goal_3" : "field_goal_2",
      points: isThreePoint ? 3 : 2,
      position: { x, y },
    })
    setShowPlayerDialog(true)
  }

  const handleActionClick = (actionType: string, points?: number) => {
    setPendingAction({
      type: actionType,
      points,
      position: { x: 50, y: 50 },
    })
    setShowPlayerDialog(true)
  }

  const confirmAction = () => {
    if (!pendingAction || !selectedPlayer || !selectedTeam) return

    const player = [...homeTeamPlayers, ...awayTeamPlayers].find((p) => p.id === selectedPlayer)
    if (!player) return

    // Create game action
    const action: GameAction = {
      id: Date.now().toString(),
      gameId: gameId,
      playerId: selectedPlayer,
      teamId: player.teamId,
      type: pendingAction.type as any,
      quarter: gameState.quarter,
      timeRemaining: gameState.timeRemaining,
      points: pendingAction.points,
      successful: true, // For now, assume all shots are successful
      createdAt: new Date(),
    }

    setGameActions((prev) => [action, ...prev])

    // Update score
    if (pendingAction.points) {
      setGameState((prev) => ({
        ...prev,
        [selectedTeam === "home" ? "homeScore" : "awayScore"]:
          prev[selectedTeam === "home" ? "homeScore" : "awayScore"] + pendingAction.points!,
      }))
    }

    // Update stats
    setStats((prev) => {
      const teamStats = prev[selectedTeam!]
      const newStats = { ...teamStats }

      switch (pendingAction.type) {
        case "field_goal_2":
          newStats.fieldGoals++
          newStats.fieldGoalAttempts++
          break
        case "field_goal_3":
          newStats.threePointers++
          newStats.threePointerAttempts++
          newStats.fieldGoalAttempts++
          break
        case "free_throw":
          newStats.freeThrows++
          newStats.freeThrowAttempts++
          break
        case "rebound":
          newStats.rebounds++
          break
        case "assist":
          newStats.assists++
          break
        case "steal":
          newStats.steals++
          break
        case "block":
          newStats.blocks++
          break
        case "turnover":
          newStats.turnovers++
          break
        case "foul":
          newStats.fouls++
          break
      }

      return {
        ...prev,
        [selectedTeam!]: newStats,
      }
    })

    // Reset state
    setPendingAction(null)
    setSelectedPlayer("")
    setSelectedTeam(null)
    setShowPlayerDialog(false)
  }

  const handleTimeout = (team: "home" | "away") => {
    if (gameState[`${team}Timeouts`] > 0) {
      setGameState((prev) => ({
        ...prev,
        [`${team}Timeouts`]: prev[`${team}Timeouts`] - 1,
        isRunning: false,
      }))

      // Add timeout action
      const action: GameAction = {
        id: Date.now().toString(),
        gameId: gameId,
        playerId: "",
        teamId: team === "home" ? game.homeTeamId : game.awayTeamId,
        type: "timeout",
        quarter: gameState.quarter,
        timeRemaining: gameState.timeRemaining,
        createdAt: new Date(),
      }
      setGameActions((prev) => [action, ...prev])
    }
  }

  const undoLastAction = () => {
    if (gameActions.length === 0) return

    const lastAction = gameActions[0]
    setGameActions((prev) => prev.slice(1))

    // Undo score changes
    if (lastAction.points) {
      const isHomeTeam = lastAction.teamId === game.homeTeamId
      setGameState((prev) => ({
        ...prev,
        [isHomeTeam ? "homeScore" : "awayScore"]: prev[isHomeTeam ? "homeScore" : "awayScore"] - lastAction.points!,
      }))
    }

    // Undo timeout
    if (lastAction.type === "timeout") {
      const isHomeTeam = lastAction.teamId === game.homeTeamId
      setGameState((prev) => ({
        ...prev,
        [`${isHomeTeam ? "home" : "away"}Timeouts`]: prev[`${isHomeTeam ? "home" : "away"}Timeouts`] + 1,
      }))
    }
  }

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/games/${gameId}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Salir del Partido
                </Link>
              </Button>
              <Badge variant="default" className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                Partido en Vivo
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={undoLastAction} disabled={gameActions.length === 0}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Deshacer
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Panel - Home Team */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <img
                    src={homeTeam.logo || "/placeholder.svg?height=24&width=24&query=basketball team logo"}
                    alt={homeTeam.name}
                    className="w-6 h-6 rounded"
                  />
                  {homeTeam.name}
                  <Badge variant="secondary">Local</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{gameState.homeScore}</div>
                    <div className="text-sm text-muted-foreground">Puntos</div>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTimeout("home")}
                      disabled={gameState.homeTimeouts === 0}
                    >
                      <Timer className="w-4 h-4 mr-2" />
                      Tiempo Muerto ({gameState.homeTimeouts})
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Estadísticas</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        TC: {stats.home.fieldGoals}/{stats.home.fieldGoalAttempts}
                      </div>
                      <div>
                        3P: {stats.home.threePointers}/{stats.home.threePointerAttempts}
                      </div>
                      <div>
                        TL: {stats.home.freeThrows}/{stats.home.freeThrowAttempts}
                      </div>
                      <div>REB: {stats.home.rebounds}</div>
                      <div>AST: {stats.home.assists}</div>
                      <div>ROB: {stats.home.steals}</div>
                      <div>BLQ: {stats.home.blocks}</div>
                      <div>PER: {stats.home.turnovers}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Court and Controls */}
          <div className="xl:col-span-2 space-y-4">
            {/* Game Clock */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div>
                    <div className="text-5xl font-bold text-primary">{gameState.timeRemaining}</div>
                    <div className="text-lg text-muted-foreground">Cuarto {gameState.quarter}</div>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button onClick={toggleTimer} variant={gameState.isRunning ? "destructive" : "default"}>
                      {gameState.isRunning ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Iniciar
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetQuarter}>
                      <Square className="w-4 h-4 mr-2" />
                      Reiniciar Cuarto
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basketball Court */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Cancha Interactiva</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <svg
                    viewBox="0 0 100 60"
                    className="w-full h-auto border rounded-lg cursor-crosshair bg-amber-50"
                    onClick={handleCourtClick}
                  >
                    {/* Court outline */}
                    <rect x="2" y="2" width="96" height="56" fill="none" stroke="#8B4513" strokeWidth="0.5" />

                    {/* Center circle */}
                    <circle cx="50" cy="30" r="6" fill="none" stroke="#8B4513" strokeWidth="0.3" />

                    {/* Left basket area */}
                    <rect x="2" y="17" width="19" height="26" fill="none" stroke="#8B4513" strokeWidth="0.3" />
                    <path d="M 2 23 A 6 6 0 0 1 2 37" fill="none" stroke="#8B4513" strokeWidth="0.3" />
                    <rect x="2" y="26" width="6" height="8" fill="none" stroke="#8B4513" strokeWidth="0.3" />

                    {/* Right basket area */}
                    <rect x="79" y="17" width="19" height="26" fill="none" stroke="#8B4513" strokeWidth="0.3" />
                    <path d="M 98 23 A 6 6 0 0 0 98 37" fill="none" stroke="#8B4513" strokeWidth="0.3" />
                    <rect x="92" y="26" width="6" height="8" fill="none" stroke="#8B4513" strokeWidth="0.3" />

                    {/* 3-point lines */}
                    <path
                      d="M 2 8 A 23 23 0 0 1 2 52"
                      fill="none"
                      stroke="#8B4513"
                      strokeWidth="0.3"
                      strokeDasharray="1,1"
                    />
                    <path
                      d="M 98 8 A 23 23 0 0 0 98 52"
                      fill="none"
                      stroke="#8B4513"
                      strokeWidth="0.3"
                      strokeDasharray="1,1"
                    />

                    {/* Baskets */}
                    <circle cx="5" cy="30" r="0.8" fill="#FF4500" />
                    <circle cx="95" cy="30" r="0.8" fill="#FF4500" />

                    {/* Zone indicators */}
                    <text x="12" y="32" fontSize="2" fill="#666" textAnchor="middle">
                      2PT
                    </text>
                    <text x="88" y="32" fontSize="2" fill="#666" textAnchor="middle">
                      2PT
                    </text>
                    <text x="50" y="15" fontSize="2" fill="#666" textAnchor="middle">
                      3PT
                    </text>
                    <text x="50" y="47" fontSize="2" fill="#666" textAnchor="middle">
                      3PT
                    </text>
                  </svg>
                  <div className="mt-2 text-center text-sm text-muted-foreground">
                    Haz clic en la cancha para registrar tiros de 2 o 3 puntos
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Acciones del Juego</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleActionClick("free_throw", 1)}
                    className="flex-col h-16"
                  >
                    <Target className="w-5 h-5 mb-1" />
                    <span className="text-xs">Tiro Libre</span>
                  </Button>
                  <Button variant="outline" onClick={() => handleActionClick("rebound")} className="flex-col h-16">
                    <Hand className="w-5 h-5 mb-1" />
                    <span className="text-xs">Rebote</span>
                  </Button>
                  <Button variant="outline" onClick={() => handleActionClick("assist")} className="flex-col h-16">
                    <Users className="w-5 h-5 mb-1" />
                    <span className="text-xs">Asistencia</span>
                  </Button>
                  <Button variant="outline" onClick={() => handleActionClick("steal")} className="flex-col h-16">
                    <Zap className="w-5 h-5 mb-1" />
                    <span className="text-xs">Robo</span>
                  </Button>
                  <Button variant="outline" onClick={() => handleActionClick("block")} className="flex-col h-16">
                    <Shield className="w-5 h-5 mb-1" />
                    <span className="text-xs">Bloqueo</span>
                  </Button>
                  <Button variant="outline" onClick={() => handleActionClick("turnover")} className="flex-col h-16">
                    <AlertTriangle className="w-5 h-5 mb-1" />
                    <span className="text-xs">Pérdida</span>
                  </Button>
                  <Button variant="outline" onClick={() => handleActionClick("foul")} className="flex-col h-16">
                    <AlertTriangle className="w-5 h-5 mb-1" />
                    <span className="text-xs">Falta</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Away Team */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <img
                    src={awayTeam.logo || "/placeholder.svg?height=24&width=24&query=basketball team logo"}
                    alt={awayTeam.name}
                    className="w-6 h-6 rounded"
                  />
                  {awayTeam.name}
                  <Badge variant="outline">Visitante</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{gameState.awayScore}</div>
                    <div className="text-sm text-muted-foreground">Puntos</div>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTimeout("away")}
                      disabled={gameState.awayTimeouts === 0}
                    >
                      <Timer className="w-4 h-4 mr-2" />
                      Tiempo Muerto ({gameState.awayTimeouts})
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Estadísticas</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        TC: {stats.away.fieldGoals}/{stats.away.fieldGoalAttempts}
                      </div>
                      <div>
                        3P: {stats.away.threePointers}/{stats.away.threePointerAttempts}
                      </div>
                      <div>
                        TL: {stats.away.freeThrows}/{stats.away.freeThrowAttempts}
                      </div>
                      <div>REB: {stats.away.rebounds}</div>
                      <div>AST: {stats.away.assists}</div>
                      <div>ROB: {stats.away.steals}</div>
                      <div>BLQ: {stats.away.blocks}</div>
                      <div>PER: {stats.away.turnovers}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Acciones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gameActions.slice(0, 10).map((action) => {
                    const player = [...homeTeamPlayers, ...awayTeamPlayers].find((p) => p.id === action.playerId)
                    const team = mockTeams.find((t) => t.id === action.teamId)
                    return (
                      <div key={action.id} className="text-xs p-2 bg-muted rounded">
                        <div className="font-medium">
                          {action.type === "timeout" ? "Tiempo Muerto" : action.type.replace("_", " ")}
                        </div>
                        <div className="text-muted-foreground">
                          {player?.name || team?.name} - Q{action.quarter} {action.timeRemaining}
                          {action.points && ` (+${action.points} puntos)`}
                        </div>
                      </div>
                    )
                  })}
                  {gameActions.length === 0 && (
                    <div className="text-center text-muted-foreground text-xs py-4">No hay acciones registradas</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Player Selection Dialog */}
      <Dialog open={showPlayerDialog} onOpenChange={setShowPlayerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar Jugador</DialogTitle>
            <DialogDescription>
              Elige el equipo y jugador que realizó la acción: {pendingAction?.type.replace("_", " ").toUpperCase()}
              {pendingAction?.points && ` (+${pendingAction.points} puntos)`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Equipo</label>
              <Select value={selectedTeam || ""} onValueChange={(value: "home" | "away") => setSelectedTeam(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar equipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">{homeTeam.name} (Local)</SelectItem>
                  <SelectItem value="away">{awayTeam.name} (Visitante)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedTeam && (
              <div>
                <label className="text-sm font-medium">Jugador</label>
                <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar jugador" />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedTeam === "home" ? homeTeamPlayers : awayTeamPlayers).map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        #{player.number} {player.name} ({player.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPlayerDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmAction} disabled={!selectedPlayer || !selectedTeam}>
                Confirmar Acción
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
