export type SportType = "Soccer" | "Basketball" | "Tennis" | "Volleyball" | "Cricket" | "Baseball" | "Rugby" | "Hockey"

export type TournamentStatus = "Upcoming" | "In Progress" | "Completed"

export type TournamentFormat = "League" | "Knockout" | "Hybrid"

export type MatchStatus = "Scheduled" | "In Progress" | "Completed" | "Postponed" | "Cancelled"

export interface Tournament {
  id: string
  name: string
  sport: SportType
  format: TournamentFormat
  status: TournamentStatus
  startDate: string
  endDate: string
  location: string
  description: string
  organizerId: string
  organizerName: string
  bannerImage?: string
  logo?: string
  teamsCount: number
  currentStage: string
  rules?: string
  prizes?: string
  views: number
}

export interface Team {
  id: string
  name: string
  logo?: string
  tournamentId: string
  groupId?: string
}

export interface Match {
  id: string
  tournamentId: string
  homeTeam: Team
  awayTeam: Team
  homeScore?: number
  awayScore?: number
  status: MatchStatus
  date: string
  time: string
  venue: string
  stage: string
}

export interface Standing {
  position: number
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface Organizer {
  id: string
  name: string
  email: string
  organization?: string
  phone?: string
  experience?: string
}
