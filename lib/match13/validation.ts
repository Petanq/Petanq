import type { Match } from "./types";

// A petanque game is always played to 13: the winner has exactly 13, the
// loser has 0-12. A tie (13-13) can't happen, and a match without a 13 on
// either side hasn't actually finished yet.
//
// A true BYE has teamB === null. Meli-Melo matches set teamB to "" (there's
// no single "team" id, the real players are in playersA/playersB) — that
// must NOT be mistaken for a BYE, so this checks strict null, not falsiness.
export function isCompleteMatch(m: Match): boolean {
  if (m.teamB === null) return true; // BYE — no score needed
  if (m.scoreA === undefined || m.scoreB === undefined) return false;
  if (m.scoreA === 13 && m.scoreB === 13) return false;
  if (m.scoreA === 13) return m.scoreB >= 0 && m.scoreB <= 12;
  if (m.scoreB === 13) return m.scoreA >= 0 && m.scoreA <= 12;
  return false;
}

/** True once both scores are filled in but they don't form a valid petanque result. */
export function isInvalidMatch(m: Match): boolean {
  if (m.teamB === null) return false;
  if (m.scoreA === undefined || m.scoreB === undefined) return false;
  return !isCompleteMatch(m);
}
