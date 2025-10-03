export type SportType =
  | "Soccer"
  | "Basketball"
  | "Tennis"
  | "Volleyball"
  | "Cricket"
  | "Baseball"
  | "Rugby"
  | "Hockey";

export type TournamentStatus = "Upcoming" | "In Progress" | "Completed";

export type TournamentFormat = "League" | "Knockout" | "Hybrid";

export type MatchStatus =
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Postponed"
  | "Cancelled";

export interface Tournament {
  _id: string;
  name: string;
  sport: SportType;
  format: TournamentFormat;
  status: TournamentStatus;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  organizerId: string;
  organizerName: string;
  bannerImage?: string;
  logo?: string;
  teamsCount: number;
  currentStage: string;
  rules?: string;
  prizes?: string;
  views: number;
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
