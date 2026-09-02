export type Format = "tete" | "doublet" | "triplet" | "meli" | "poules" | "kwartet";

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
  // Kwartet only: the 4 player names in this team, and a rotating pointer
  // (0-3) into that list saying which one plays the solo "enkelspel" next —
  // advances by 1 every time this team plays, so it's always someone
  // different's turn (per MATCH16's "Kwartet 1-3" rotation variants).
  members?: string[];
  kwartetAlleenIndex?: number;
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
  // Kwartet only: each team's 4 players split into a solo "enkelspel"
  // (this named player, with their fixed A/B/C/D letter) and a triplet (the
  // other 3, playersA/playersB unused). scoreA/scoreB are the sum of the
  // two sub-results below, recomputed automatically whenever a sub-score
  // changes. The enkelspel and triplet happen at the same time between
  // different people, so they need their own plein — `court` is the
  // enkelspel's, `courtTriplet` the triplet's.
  alleenNaamA?: string;
  alleenNaamB?: string;
  alleenLetterA?: string;
  alleenLetterB?: string;
  courtTriplet?: number;
  scoreEnkelA?: number;
  scoreEnkelB?: number;
  scoreTripletA?: number;
  scoreTripletB?: number;
}

// Kwartet: a team's 4 members get a fixed A/B/C/D letter, in registration
// order — printed on cards and the roster so everyone recognizes their own
// letter regardless of which round assigns them the solo "enkelspel".
export const KWARTET_LETTERS = ["A", "B", "C", "D"] as const;

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
  kwartet: "Kwartet",
};

export const FORMAT_TEAM_SIZE: Record<Format, number> = {
  meli: 1, // registration is per individual player
  tete: 1,
  doublet: 2,
  triplet: 3,
  poules: 2, // poule play is registered as doublets, same as most real club poule days
  kwartet: 4,
};

export const ROLE_LABELS: Record<Role, string> = {
  schutter: "Schutter",
  pointeur: "Pointeur",
  flex: "Geen voorkeur",
};
