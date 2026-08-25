import type { Round, Team } from "./types";

export interface StandingRow {
  teamId: string;
  number: number;
  name: string;
  gespeeld: number;
  overwinningen: number;
  matchpunten: number;
  puntenVoor: number;
  puntenTegen: number;
  saldo: number;
}

const BYE_SCORE = 13; // a petanque game is played to 13 points — a BYE counts as an automatic 13-7 win
const BYE_AGAINST = 7;

export function computeStandings(teams: Team[], rounds: Round[]): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  for (const t of teams) {
    rows.set(t.id, {
      teamId: t.id,
      number: t.number,
      name: t.name,
      gespeeld: 0,
      overwinningen: 0,
      matchpunten: 0,
      puntenVoor: 0,
      puntenTegen: 0,
      saldo: 0,
    });
  }

  for (const round of rounds) {
    for (const m of round.matches) {
      const rowA = rows.get(m.teamA);
      if (!rowA) continue;

      if (!m.teamB) {
        // BYE: automatic win
        rowA.gespeeld += 1;
        rowA.overwinningen += 1;
        rowA.matchpunten += 2;
        rowA.puntenVoor += BYE_SCORE;
        rowA.puntenTegen += BYE_AGAINST;
        rowA.saldo += BYE_SCORE - BYE_AGAINST;
        continue;
      }

      const rowB = rows.get(m.teamB);
      if (!rowB) continue;
      if (m.scoreA === undefined || m.scoreB === undefined) continue; // not played yet

      rowA.gespeeld += 1;
      rowB.gespeeld += 1;
      rowA.puntenVoor += m.scoreA;
      rowA.puntenTegen += m.scoreB;
      rowB.puntenVoor += m.scoreB;
      rowB.puntenTegen += m.scoreA;
      rowA.saldo = rowA.puntenVoor - rowA.puntenTegen;
      rowB.saldo = rowB.puntenVoor - rowB.puntenTegen;

      if (m.scoreA > m.scoreB) {
        rowA.matchpunten += 2;
        rowA.overwinningen += 1;
      } else if (m.scoreB > m.scoreA) {
        rowB.matchpunten += 2;
        rowB.overwinningen += 1;
      } else {
        rowA.matchpunten += 1;
        rowB.matchpunten += 1;
      }
    }
  }

  return Array.from(rows.values()).sort(
    (a, b) => b.matchpunten - a.matchpunten || b.saldo - a.saldo
  );
}

/**
 * Meli-Melo standings: there are no persistent teams, so each match's result
 * is credited to the three individual players on each side. A player who
 * rests a round simply isn't touched that round — no automatic win/loss,
 * unlike a fixed-team BYE.
 */
export function computeMeleeStandings(players: Team[], rounds: Round[]): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  for (const p of players) {
    rows.set(p.id, {
      teamId: p.id,
      number: p.number,
      name: p.name,
      gespeeld: 0,
      overwinningen: 0,
      matchpunten: 0,
      puntenVoor: 0,
      puntenTegen: 0,
      saldo: 0,
    });
  }

  for (const round of rounds) {
    for (const m of round.matches) {
      if (!m.playersA || !m.playersB) continue;
      if (m.scoreA === undefined || m.scoreB === undefined) continue; // not played yet

      const aWon = m.scoreA > m.scoreB;
      const tie = m.scoreA === m.scoreB;

      for (const pid of m.playersA) {
        const row = rows.get(pid);
        if (!row) continue;
        row.gespeeld += 1;
        row.puntenVoor += m.scoreA;
        row.puntenTegen += m.scoreB;
        row.saldo = row.puntenVoor - row.puntenTegen;
        if (tie) row.matchpunten += 1;
        else if (aWon) {
          row.matchpunten += 2;
          row.overwinningen += 1;
        }
      }
      for (const pid of m.playersB) {
        const row = rows.get(pid);
        if (!row) continue;
        row.gespeeld += 1;
        row.puntenVoor += m.scoreB;
        row.puntenTegen += m.scoreA;
        row.saldo = row.puntenVoor - row.puntenTegen;
        if (tie) row.matchpunten += 1;
        else if (!aWon) {
          row.matchpunten += 2;
          row.overwinningen += 1;
        }
      }
    }
  }

  return Array.from(rows.values()).sort(
    (a, b) => b.matchpunten - a.matchpunten || b.saldo - a.saldo
  );
}
