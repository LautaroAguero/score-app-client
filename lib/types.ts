export interface Team {
  id: string
  name: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  createdAt: Date
  updatedAt: Date
}

export interface Player {
  id: string
  teamId: string
  name: string
  number: number
  position: "PG" | "SG" | "SF" | "PF" | "C" // Point Guard, Shooting Guard, Small Forward, Power Forward, Center
  height?: string
  weight?: string
  createdAt: Date
  updatedAt: Date
}

export interface Tournament {
  id: string
  name: string
  description?: string
  startDate: Date
  endDate: Date
  status: "upcoming" | "active" | "completed" | "cancelled"
  format: "single-elimination" | "double-elimination" | "round-robin" | "league"
  maxTeams: number
  registeredTeams: string[] // Team IDs
  createdAt: Date
  updatedAt: Date
}

export interface Game {
  id: string
  tournamentId: string
  homeTeamId: string
  awayTeamId: string
  scheduledDate: Date
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  homeScore: number
  awayScore: number
  quarter: number
  timeRemaining: string // Format: "MM:SS"
  round?: string // For tournament brackets: "quarterfinals", "semifinals", "final", etc.
  createdAt: Date
  updatedAt: Date
}

export interface GameAction {
  id: string
  gameId: string
  playerId: string
  teamId: string
  type:
    | "field_goal_2"
    | "field_goal_3"
    | "free_throw"
    | "rebound"
    | "assist"
    | "steal"
    | "block"
    | "turnover"
    | "foul"
    | "timeout"
  quarter: number
  timeRemaining: string
  points?: number
  successful?: boolean // For shots
  createdAt: Date
}

export interface PlayerStats {
  playerId: string
  gameId: string
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  fouls: number
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  threePointersMade: number
  threePointersAttempted: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  minutesPlayed: number
}

export interface TeamStats {
  teamId: string
  gameId: string
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  turnovers: number
  fouls: number
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  threePointersMade: number
  threePointersAttempted: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  timeouts: number
}

export interface TournamentStanding {
  tournamentId: string
  teamId: string
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  pointsDifferential: number
  gamesPlayed: number
}

export interface User {
  id: string
  email: string
  name: string
  role: "organizer" | "team"
  teamId?: string // Only for team users
  createdAt: Date
  updatedAt: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: "organizer" | "team"
  teamName?: string // For team registration
  teamPrimaryColor?: string
  teamSecondaryColor?: string
}
