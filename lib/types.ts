export type SportType =
  | "soccer"
  | "basketball"
  | "volleyball"
  | "tennis"
  | "rugby";

export type TournamentStatus = "upcoming" | "inprogress" | "finished";

export type TournamentFormat = "league" | "knockout" | "hybrid";

export type MatchStatus =
  | "scheduled"
  | "in progress"
  | "completed"
  | "postponed"
  | "cancelled";

export interface Tournament {
  _id: string;
  name: string;
  description?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  sportType: SportType;
  tournamentFormat: TournamentFormat;
  startDate?: string;
  endDate?: string;
  location?: string;
  numberOfParticipants: number;
  prizes?: string;
  tournamentBanner?: string;
  rules?: string;
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  status: TournamentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  logo?: string;
  tournament: {
    _id: string;
    name: string;
  };
  groupId?: string;
}

export interface Match {
  _id: string;
  tournament: {
    _id: string;
    name: string;
    sportType?: string;
  };
  homeTeam: {
    _id: string;
    name: string;
    logo?: string;
  };
  awayTeam: {
    _id: string;
    name: string;
    logo?: string;
  };
  homeTeamScore?: number;
  awayTeamScore?: number;
  status: MatchStatus;
  date?: string;
  time?: string;
  venue: string;
  stage: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Standing {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Organizer {
  _id: string;
  name: string;
  email: string;
  organization?: string;
  phone?: string;
  experience?: string;
}
