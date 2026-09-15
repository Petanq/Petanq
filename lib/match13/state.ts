import type { Format, Round, Team } from "./types";
import type { BracketMatch } from "./poules";

// The full tournament state, saved as a single blob per toernooi — same
// shape the original local tool used to write to localStorage, now written
// to the `data` jsonb column of `match13_toernooien` instead.
export interface AppState {
  clubName: string;
  format: Format;
  entryFee: number;
  totalRounds: number;
  // Aantal fysiek beschikbare pleinen (bv. beperkt bij binnenspelen 's winters).
  // undefined/0 = onbeperkt, elke wedstrijd speelt meteen (huidig gedrag).
  maxPleinen?: number;
  // Enkel relevant als format === "poules": Poules is in de praktijk geen
  // eigen spelvorm maar een keuze bovenop Tête-à-tête/Doublet/Triplet — dit
  // bepaalt de teamgrootte binnen de poules. undefined = Doublet (2), het
  // oorspronkelijke, enige gedrag vóór dit veld bestond.
  pouleTeamSize?: 1 | 2 | 3;
  // Enkel relevant als format === "poules": speel je, naast de gewone
  // winnaars-piramide, ook een 2de piramide voor wie er in de poule-fase
  // uitvliegt ("Consolante" in petanque-vaktermen)? Een bewuste keuze, geen
  // verplichting — undefined/false = enkel Piramide A, zoals voorheen.
  speelPiramideB?: boolean;
  teams: Team[];
  rounds: Round[];
  pouleBracket: BracketMatch[];
  knockoutBracket: BracketMatch[];
  // Optioneel (zie speelPiramideB) en pas toegevoegd nadat er al toernooien
  // bestonden — undefined betekent gewoon "nog niet gebouwd/niet van
  // toepassing", niet anders behandelen dan een lege array.
  knockoutBracketB?: BracketMatch[];
}

export function defaultAppState(): AppState {
  return {
    clubName: "",
    format: "doublet",
    entryFee: 0,
    totalRounds: 0,
    teams: [],
    rounds: [],
    pouleBracket: [],
    knockoutBracket: [],
    knockoutBracketB: [],
  };
}
