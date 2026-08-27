export type Format = "tete" | "doublet" | "triplet" | "meli" | "poules";

export type Role = "schutter" | "pointeur" | "flex";

export interface Team {
  id: string;
  number: number;
  name: string;
  present: boolean;
  paid: boolean;
  byes: number; // for Meli-Melo this doubles as "times rested this tournament"
  role?: Role; // only meaningful when format === "meli"
  poule?: string; // only meaningful when format === "poules" — assigned once, at kick-off
}

export interface Match {
  court: number;
  teamA: string;
  teamB: string | null; // null = BYE
  scoreA?: number;
  scoreB?: number;
  finishedAt?: number; // timestamp (ms) when the score was entered
  // Meli-Melo only: the fresh triplet formed for each side this round,
  // as player ids. teamA/teamB are unused ("") for these matches.
  playersA?: string[];
  playersB?: string[];
}

export interface Round {
  number: number;
  matches: Match[];
  rest?: string[]; // Meli-Melo only: player ids sitting out this round
  startedAt?: number; // timestamp (ms) when the round was generated
}

export const FORMAT_LABELS: Record<Format, string> = {
  meli: "Meli-Melo",
  tete: "Tête-à-Tête",
  doublet: "Doublet",
  triplet: "Triplet",
  poules: "Poules",
};

export const FORMAT_TEAM_SIZE: Record<Format, number> = {
  meli: 1, // registration is per individual player
  tete: 1,
  doublet: 2,
  triplet: 3,
  poules: 2, // poule play is registered as doublets, same as most real club poule days
};

export const ROLE_LABELS: Record<Role, string> = {
  schutter: "Schutter",
  pointeur: "Pointeur",
  flex: "Geen voorkeur",
};
