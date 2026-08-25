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
  teams: Team[];
  rounds: Round[];
  pouleBracket: BracketMatch[];
  knockoutBracket: BracketMatch[];
}

export function defaultAppState(): AppState {
  return {
    clubName: "",
    format: "doublet",
    entryFee: 3,
    totalRounds: 5,
    teams: [],
    rounds: [],
    pouleBracket: [],
    knockoutBracket: [],
  };
}
