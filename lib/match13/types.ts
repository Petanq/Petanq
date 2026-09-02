export type Format = "tete" | "doublet" | "triplet" | "meli" | "poules" | "kwartet" | "sextet";

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
  // Kwartet/Sextet only: the 4 (or 6) player names in this team, and a
  // rotating pointer into that list saying which one plays the solo
  // "enkelspel" next — advances by 1 every time this team plays (wrapping
  // at 4 for Kwartet, 6 for Sextet), so it's always someone different's
  // turn (per MATCH16's "Kwartet 1-3"/"Sextet 1-2-3" rotation variants).
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
  // Kwartet/Sextet only: each team's players split into a solo "enkelspel"
  // (this named player, with their fixed letter) plus a triplet (Kwartet)
  // or a dubbel + triplet (Sextet). `kwsSoort` says which — needed because
  // isCompleteMatch/isInvalidMatch (pure functions, no format in scope)
  // must know whether 2 or 3 sub-results are required. scoreA/scoreB are
  // the sum of the sub-results, recomputed automatically whenever one
  // changes. Every sub-match happens at the same time between different
  // people, so each needs its own plein: `court` is the enkelspel's,
  // `courtDoublet`/`courtTriplet` the others'.
  kwsSoort?: "kwartet" | "sextet";
  alleenNaamA?: string;
  alleenNaamB?: string;
  alleenLetterA?: string;
  alleenLetterB?: string;
  courtDoublet?: number;
  courtTriplet?: number;
  scoreEnkelA?: number;
  scoreEnkelB?: number;
  scoreDoubletA?: number;
  scoreDoubletB?: number;
  scoreTripletA?: number;
  scoreTripletB?: number;
}

// Kwartet/Sextet: a team's members get a fixed letter (A, B, C, ...) in
// registration order — printed on cards and the roster so everyone
// recognizes their own letter regardless of which round assigns them the
// solo "enkelspel".
export const SPEL_LETTERS = ["A", "B", "C", "D", "E", "F"] as const;

// MATCH16's "Sextet 1-2-3" table (KQS-blad), overgenomen letterlijk: voor
// elke speler die de "alleen"-rol krijgt (index 0-5), welke 2 anderen
// samen de dubbel vormen en welke 3 samen het triplet — geen simpele
// formule, gewoon 6 vaste combinaties zoals MATCH16 ze zelf vastlegt.
export const SEXTET_SPLIT: { doublet: [number, number]; triplet: [number, number, number] }[] = [
  { doublet: [1, 4], triplet: [2, 3, 5] }, // alleen = A (index 0)
  { doublet: [2, 5], triplet: [0, 3, 4] }, // alleen = B (index 1)
  { doublet: [1, 3], triplet: [0, 4, 5] }, // alleen = C (index 2)
  { doublet: [0, 5], triplet: [1, 2, 4] }, // alleen = D (index 3)
  { doublet: [0, 2], triplet: [1, 3, 5] }, // alleen = E (index 4)
  { doublet: [3, 4], triplet: [0, 1, 2] }, // alleen = F (index 5)
];

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
  sextet: "Sextet",
};

export const FORMAT_TEAM_SIZE: Record<Format, number> = {
  meli: 1, // registration is per individual player
  tete: 1,
  doublet: 2,
  triplet: 3,
  poules: 2, // poule play is registered as doublets, same as most real club poule days
  kwartet: 4,
  sextet: 6,
};

export const ROLE_LABELS: Record<Role, string> = {
  schutter: "Schutter",
  pointeur: "Pointeur",
  flex: "Geen voorkeur",
};
