import { SPEL_LETTERS, type Match, type Role, type Round, type Team } from "./types";

// Real opponent-avoidance draw engine.
//
// MATCH16 (the legacy Excel/VBA tool this is modeled on) generates a round by
// retrying a fully random draw up to 7 times and keeping whichever attempt had
// the fewest repeat-opponent conflicts — it accepts a conflicted draw if none
// of the 7 tries came back clean. This engine instead runs many cheap
// randomized attempts (rounds are tiny, so this is instant) and keeps the
// best, stopping early the moment a conflict-free draw is found. It is a
// heuristic, not a full constraint solver, but it finds a zero-conflict draw
// whenever one exists for realistic club-sized rounds.

const MAX_ATTEMPTS = 500;

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function buildOpponentHistory(rounds: Round[]): Map<string, number> {
  const history = new Map<string, number>();
  for (const round of rounds) {
    for (const m of round.matches) {
      if (!m.teamB) continue;
      const key = pairKey(m.teamA, m.teamB);
      history.set(key, (history.get(key) ?? 0) + 1);
    }
  }
  return history;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function greedyPair(ids: string[], history: Map<string, number>): [string, string][] {
  const remaining = shuffle(ids);
  const pairs: [string, string][] = [];
  while (remaining.length > 0) {
    const a = remaining.shift()!;
    let bestCount = Infinity;
    let candidates: number[] = [];
    remaining.forEach((b, i) => {
      const c = history.get(pairKey(a, b)) ?? 0;
      if (c < bestCount) {
        bestCount = c;
        candidates = [i];
      } else if (c === bestCount) {
        candidates.push(i);
      }
    });
    const idx = candidates[Math.floor(Math.random() * candidates.length)];
    const b = remaining.splice(idx, 1)[0];
    pairs.push([a, b]);
  }
  return pairs;
}

export function scorePairing(pairs: [string, string][], history: Map<string, number>): number {
  return pairs.reduce((sum, [a, b]) => sum + (history.get(pairKey(a, b)) ?? 0), 0);
}

/** Picks who sits out this round when the present-team count is odd, rotating fairly. */
function pickByeTeam(teams: Team[]): Team {
  const minByes = Math.min(...teams.map((t) => t.byes));
  const candidates = teams.filter((t) => t.byes === minByes);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ---- Court ("plein") rotation ----
//
// MATCH16 also tracks which court each team already played on and tries to
// avoid sending them back to the same one (its own PLN_SEL routine, "best of
// 3 tries"). Court numbers only matter for the fixed-team formats — a
// Meli-Melo triplet is new every round anyway, so there's no team identity to
// rotate a court away from.

function courtKey(teamId: string, court: number): string {
  return `${teamId}|${court}`;
}

export function buildCourtHistory(rounds: Round[]): Map<string, number> {
  const history = new Map<string, number>();
  for (const round of rounds) {
    for (const m of round.matches) {
      if (m.teamB === null || m.playersA) continue; // skip BYE rows and Meli-Melo rows
      for (const id of [m.teamA, m.teamB]) {
        const k = courtKey(id, m.court);
        history.set(k, (history.get(k) ?? 0) + 1);
      }
    }
  }
  return history;
}

function courtScore(pairs: [string, string][], courts: number[], history: Map<string, number>): number {
  return pairs.reduce((sum, [a, b], i) => {
    const c = courts[i];
    return sum + (history.get(courtKey(a, c)) ?? 0) + (history.get(courtKey(b, c)) ?? 0);
  }, 0);
}

/** Assigns court numbers 1..N to N already-decided pairings, preferring courts neither team has had before. */
function assignCourts(pairs: [string, string][], history: Map<string, number>): number[] {
  const n = pairs.length;
  if (n === 0) return [];
  const baseCourts = Array.from({ length: n }, (_, i) => i + 1);

  let best = baseCourts;
  let bestScore = courtScore(pairs, best, history);

  for (let attempt = 0; attempt < 200 && bestScore > 0; attempt++) {
    const candidate = shuffle(baseCourts);
    for (let pass = 0; pass < 6; pass++) {
      let improved = false;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const before = courtScore(pairs, candidate, history);
          [candidate[i], candidate[j]] = [candidate[j], candidate[i]];
          const after = courtScore(pairs, candidate, history);
          if (after < before) {
            improved = true;
          } else {
            [candidate[i], candidate[j]] = [candidate[j], candidate[i]];
          }
        }
      }
      if (!improved) break;
    }
    const score = courtScore(pairs, candidate, history);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

export function generateRound(
  roundNumber: number,
  presentTeams: Team[],
  history: Map<string, number>,
  courtHistory: Map<string, number> = new Map()
): { matches: Match[]; byeTeamId: string | null } {
  let pairPool = presentTeams;
  let byeTeamId: string | null = null;

  if (pairPool.length % 2 !== 0) {
    const byeTeam = pickByeTeam(pairPool);
    byeTeamId = byeTeam.id;
    pairPool = pairPool.filter((t) => t.id !== byeTeam.id);
  }

  const ids = pairPool.map((t) => t.id);
  let best: [string, string][] = greedyPair(ids, history);
  let bestScore = scorePairing(best, history);

  for (let attempt = 1; attempt < MAX_ATTEMPTS && bestScore > 0; attempt++) {
    const candidate = greedyPair(ids, history);
    const score = scorePairing(candidate, history);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  const courts = assignCourts(best, courtHistory);
  const matches: Match[] = best.map(([teamA, teamB], i) => ({
    court: courts[i],
    teamA,
    teamB,
  }));

  if (byeTeamId) {
    matches.push({ court: matches.length + 1, teamA: byeTeamId, teamB: null });
  }

  return { matches, byeTeamId };
}

// ---- Meli-Melo ----
//
// Unlike the fixed-team formats above, Meli-Melo has no teams at all: players
// register individually with a role (schutter/pointeur/flex — MATCH16 calls
// these A/B/C) and get regrouped into fresh triplets every single round. Each
// match is really 6 people at once: two brand-new triplets facing each other.
// MATCH16's own conflict rule (from its INV_DUBBEL function) weighs a repeat
// *teammate* 100x heavier than a repeat *opponent* — a rematch feels far more
// repetitive than facing the same rival twice — and this engine keeps that
// weighting, just resolved with the same "many randomized attempts, keep the
// best" search used above instead of MATCH16's 7-try cap.

export interface MeleeHistory {
  teammate: Map<string, number>;
  opponent: Map<string, number>;
}

export function buildMeleeHistory(rounds: Round[]): MeleeHistory {
  const teammate = new Map<string, number>();
  const opponent = new Map<string, number>();
  for (const round of rounds) {
    for (const m of round.matches) {
      if (!m.playersA || !m.playersB) continue;
      for (const side of [m.playersA, m.playersB]) {
        for (let i = 0; i < side.length; i++) {
          for (let j = i + 1; j < side.length; j++) {
            const k = pairKey(side[i], side[j]);
            teammate.set(k, (teammate.get(k) ?? 0) + 1);
          }
        }
      }
      for (const a of m.playersA) {
        for (const b of m.playersB) {
          const k = pairKey(a, b);
          opponent.set(k, (opponent.get(k) ?? 0) + 1);
        }
      }
    }
  }
  return { teammate, opponent };
}

interface MeleeCandidateMatch {
  A: string[];
  B: string[];
}

function scoreMeleeRound(matches: MeleeCandidateMatch[], history: MeleeHistory): number {
  let score = 0;
  for (const m of matches) {
    for (const side of [m.A, m.B]) {
      for (let i = 0; i < side.length; i++) {
        for (let j = i + 1; j < side.length; j++) {
          score += (history.teammate.get(pairKey(side[i], side[j])) ?? 0) * 100;
        }
      }
    }
    for (const a of m.A) {
      for (const b of m.B) {
        score += history.opponent.get(pairKey(a, b)) ?? 0;
      }
    }
  }
  return score;
}

/**
 * Decides how many 3-vs-3, 2-vs-3, and 2-vs-2 matches to run so that as few
 * players as mathematically possible sit out — never benching someone just
 * because the group didn't divide evenly by 3. Maximizes the number of
 * normal 3v3 matches first; whatever's left over after that is covered by
 * 2v3 and 2v2 matches instead (preferring the bigger 2v3 sub-match within
 * that leftover). Only truly unavoidable cases (e.g. exactly 7 players, which
 * cannot be split into any combination of 4/5/6-sized matches without a
 * remainder) fall back to resting the smallest possible number of players.
 */
function planMeleeMatchSizes(n: number): {
  triple: number;
  duoVsTriple: number;
  duoVsDuo: number;
  covered: number;
} {
  for (let covered = n; covered >= 4; covered--) {
    for (let triple = Math.floor(covered / 6); triple >= 0; triple--) {
      const afterTriples = covered - triple * 6;
      for (let duoVsTriple = Math.floor(afterTriples / 5); duoVsTriple >= 0; duoVsTriple--) {
        const afterDuoTriple = afterTriples - duoVsTriple * 5;
        if (afterDuoTriple % 4 === 0) {
          return { triple, duoVsTriple, duoVsDuo: afterDuoTriple / 4, covered };
        }
      }
    }
  }
  return { triple: 0, duoVsTriple: 0, duoVsDuo: 0, covered: 0 };
}

interface MeleeMatchSpec {
  aSize: 2 | 3;
  bSize: 2 | 3;
}

function buildMeleeMatchSpecs(plan: { triple: number; duoVsTriple: number; duoVsDuo: number }): MeleeMatchSpec[] {
  const specs: MeleeMatchSpec[] = [];
  for (let i = 0; i < plan.triple; i++) specs.push({ aSize: 3, bSize: 3 });
  for (let i = 0; i < plan.duoVsTriple; i++) specs.push({ aSize: 2, bSize: 3 });
  for (let i = 0; i < plan.duoVsDuo; i++) specs.push({ aSize: 2, bSize: 2 });
  return specs;
}

/**
 * Fills schutter/pointeur/flex slots for a list of match specs. Every side
 * (2-player or 3-player) gets exactly one schutter slot and one pointeur
 * slot — best-effort, same as before; a 3-player side additionally gets one
 * flex slot. A role pool that's too small borrows from the flex pool first,
 * then from whatever else is left — mirroring MATCH16's "meer pointeurs dan
 * schutters? de rest wordt flex" rule — and a role pool with leftovers
 * simply donates its surplus to cover other roles' shortfalls.
 */
function assignMeleeRoles(
  totalSides: number,
  flexSlotsNeeded: number,
  schutters: string[],
  pointeurs: string[],
  flex: string[]
): { schutter: string[]; pointeur: string[]; flex: string[] } {
  const pools: Record<"schutter" | "pointeur" | "flex", string[]> = {
    schutter: shuffle(schutters),
    pointeur: shuffle(pointeurs),
    flex: shuffle(flex),
  };
  function take(role: "schutter" | "pointeur" | "flex"): string {
    if (pools[role].length > 0) return pools[role].pop()!;
    if (pools.flex.length > 0) return pools.flex.pop()!;
    for (const r of ["schutter", "pointeur", "flex"] as const) {
      if (pools[r].length > 0) return pools[r].pop()!;
    }
    throw new Error("not enough players to fill this round");
  }
  return {
    schutter: Array.from({ length: totalSides }, () => take("schutter")),
    pointeur: Array.from({ length: totalSides }, () => take("pointeur")),
    flex: Array.from({ length: flexSlotsNeeded }, () => take("flex")),
  };
}

const MELEE_ATTEMPTS = 60; // fewer than MAX_ATTEMPTS since each one now runs a repair pass

function buildMeleeCandidate(
  specs: MeleeMatchSpec[],
  roles: { schutter: string[]; pointeur: string[]; flex: string[] }
): MeleeCandidateMatch[] {
  let sideIdx = 0;
  let flexIdx = 0;
  function buildSide(size: 2 | 3): string[] {
    const s = sideIdx++;
    const players = [roles.schutter[s], roles.pointeur[s]];
    if (size === 3) players.push(roles.flex[flexIdx++]);
    return players;
  }
  return specs.map((spec) => ({ A: buildSide(spec.aSize), B: buildSide(spec.bSize) }));
}

/**
 * Local hill-climbing repair: try swapping any two players who hold the same
 * role (two schutters, two pointeurs, or two flex slots) across the whole
 * round, keep the swap only if it lowers the total conflict score. Plain
 * random slot-filling rarely stumbles onto a conflict-free round on its own
 * once there's more than one match at once — this is what actually finds it.
 */
function repairMeleeRoles(
  specs: MeleeMatchSpec[],
  roles: { schutter: string[]; pointeur: string[]; flex: string[] },
  history: MeleeHistory
): void {
  for (let pass = 0; pass < 8; pass++) {
    let improved = false;
    for (const key of ["schutter", "pointeur", "flex"] as const) {
      const arr = roles[key];
      for (let p = 0; p < arr.length; p++) {
        for (let q = p + 1; q < arr.length; q++) {
          const before = scoreMeleeRound(buildMeleeCandidate(specs, roles), history);
          [arr[p], arr[q]] = [arr[q], arr[p]];
          const after = scoreMeleeRound(buildMeleeCandidate(specs, roles), history);
          if (after < before) {
            improved = true;
          } else {
            [arr[p], arr[q]] = [arr[q], arr[p]];
          }
        }
      }
    }
    if (!improved) break;
  }
}

export function generateMeleeRound(
  roundNumber: number,
  presentPlayers: Team[],
  history: MeleeHistory
): { matches: Match[]; restIds: string[] } {
  const plan = planMeleeMatchSizes(presentPlayers.length);
  const specs = buildMeleeMatchSpecs(plan);
  if (specs.length === 0) {
    return { matches: [], restIds: presentPlayers.map((p) => p.id) };
  }
  const sideSizes = specs.flatMap((s) => [s.aSize, s.bSize]);
  const totalSides = sideSizes.length;
  const flexSlotsNeeded = sideSizes.filter((s) => s === 3).length;
  const restCount = presentPlayers.length - plan.covered;

  // How many players of this exact role are present, beyond this round's
  // base quota (one schutter/pointeur slot per side, one flex slot per
  // 3-player side)? A role with real surplus should give up its rest-taker
  // first — resting a schutter/pointeur that's already at exact quota would
  // just force an unnecessary flex-covers-the-gap swap instead. (A role
  // running short is handled separately, by assignMeleeRoles borrowing from
  // flex — that's not a "surplus" and never rests for it.)
  const roleCount: Record<Role, number> = {
    schutter: presentPlayers.filter((p) => p.role === "schutter").length,
    pointeur: presentPlayers.filter((p) => p.role === "pointeur").length,
    flex: presentPlayers.filter((p) => p.role !== "schutter" && p.role !== "pointeur").length,
  };
  function ownRoleSurplus(p: Team): number {
    const role: Role = p.role === "schutter" || p.role === "pointeur" ? p.role : "flex";
    const roleNeeded = role === "flex" ? flexSlotsNeeded : totalSides;
    return Math.max(0, roleCount[role] - roleNeeded);
  }

  // Highest own-role surplus rests first; within that, fewest byes so far
  // (so resting turns stay balanced across a whole tournament). Almost
  // always restCount is 0 — this only ever fires for the rare player count
  // (like exactly 7) that has no zero-rest combination at all.
  const restSorted = presentPlayers
    .slice()
    .sort((a, b) => ownRoleSurplus(b) - ownRoleSurplus(a) || a.byes - b.byes || Math.random() - 0.5);
  const restIds = restSorted.slice(0, restCount).map((p) => p.id);
  const playing = restSorted.slice(restCount);

  let best: MeleeCandidateMatch[] | null = null;
  let bestScore = Infinity;

  for (let attempt = 0; attempt < MELEE_ATTEMPTS && bestScore > 0; attempt++) {
    const schutters = playing.filter((p) => p.role === "schutter").map((p) => p.id);
    const pointeurs = playing.filter((p) => p.role === "pointeur").map((p) => p.id);
    const flexPlayers = playing
      .filter((p) => p.role !== "schutter" && p.role !== "pointeur")
      .map((p) => p.id);
    const roles = assignMeleeRoles(totalSides, flexSlotsNeeded, schutters, pointeurs, flexPlayers);
    repairMeleeRoles(specs, roles, history);

    const candidate = buildMeleeCandidate(specs, roles);
    const score = scoreMeleeRound(candidate, history);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  const matches: Match[] = (best ?? []).map((m, i) => ({
    court: i + 1,
    teamA: "",
    teamB: "",
    playersA: m.A,
    playersB: m.B,
  }));

  return { matches, restIds };
}

export interface TeamRank {
  matchpunten: number;
  saldo: number;
}

/**
 * Ranked ("Swiss") draw: sorts present teams by matchpunten then saldo and
 * pairs 1v2, 3v4, 5v6... — winners face winners, losers face losers. Repeat
 * opponents are then shaken loose with a bounded local repair pass (swap the
 * second half of two neighbouring pairs whenever that lowers the total
 * repeat-count) so it doesn't blindly force a rematch just to keep strict
 * rank order.
 */
export function generateRankedRound(
  roundNumber: number,
  presentTeams: Team[],
  history: Map<string, number>,
  rankOf: (teamId: string) => TeamRank,
  courtHistory: Map<string, number> = new Map()
): { matches: Match[]; byeTeamId: string | null } {
  const sorted = presentTeams.slice().sort((a, b) => {
    const ra = rankOf(a.id);
    const rb = rankOf(b.id);
    return rb.matchpunten - ra.matchpunten || rb.saldo - ra.saldo;
  });

  let byeTeamId: string | null = null;
  if (sorted.length % 2 !== 0) {
    const minByes = Math.min(...sorted.map((t) => t.byes));
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].byes === minByes) {
        byeTeamId = sorted[i].id;
        sorted.splice(i, 1);
        break;
      }
    }
  }

  const pairs: [string, string][] = [];
  for (let i = 0; i < sorted.length; i += 2) {
    pairs.push([sorted[i].id, sorted[i + 1].id]);
  }

  for (let pass = 0; pass < 6; pass++) {
    let improved = false;
    for (let i = 0; i < pairs.length - 1; i++) {
      const before = scorePairing([pairs[i], pairs[i + 1]], history);
      const swapped: [string, string][] = [
        [pairs[i][0], pairs[i + 1][1]],
        [pairs[i + 1][0], pairs[i][1]],
      ];
      const after = scorePairing(swapped, history);
      if (after < before) {
        pairs[i] = swapped[0];
        pairs[i + 1] = swapped[1];
        improved = true;
      }
    }
    if (!improved) break;
  }

  const courts = assignCourts(pairs, courtHistory);
  const matches: Match[] = pairs.map(([teamA, teamB], i) => ({
    court: courts[i],
    teamA,
    teamB,
  }));

  if (byeTeamId) {
    matches.push({ court: matches.length + 1, teamA: byeTeamId, teamB: null });
  }

  return { matches, byeTeamId };
}

// Kwartet: pick who plays the solo "enkelspel" for each team in this round
// (the other 3 automatically form the triplet). Rotates through the team's
// 4 members — index 0, then 1, then 2, then 3, then back to 0 — so it's
// someone different's turn every time that team plays, mirroring MATCH16's
// "Kwartet 1-3" rotation variants (one per possible solo player).
export function assignKwartetRoles(
  matches: Match[],
  teams: Team[]
): { matches: Match[]; alleenIndexUpdates: Map<string, number> } {
  const teamById = new Map(teams.map((t) => [t.id, t]));
  const alleenIndexUpdates = new Map<string, number>();
  // The enkelspel and triplet happen at the same time between different
  // people, so they need separate pleinen — the triplet's plein numbers
  // start right after every match's own enkelspel plein.
  const speelbareMatches = matches.filter((m) => m.teamB !== null).length;

  const updatedMatches = matches.map((m) => {
    if (m.teamB === null) return m;
    const teamA = teamById.get(m.teamA);
    const teamB = teamById.get(m.teamB);
    const idxA = teamA?.kwartetAlleenIndex ?? 0;
    const idxB = teamB?.kwartetAlleenIndex ?? 0;
    alleenIndexUpdates.set(m.teamA, (idxA + 1) % 4);
    alleenIndexUpdates.set(m.teamB, (idxB + 1) % 4);
    return {
      ...m,
      kwsSoort: "kwartet" as const,
      alleenNaamA: teamA?.members?.[idxA] ?? teamA?.name ?? "",
      alleenNaamB: teamB?.members?.[idxB] ?? teamB?.name ?? "",
      alleenLetterA: SPEL_LETTERS[idxA],
      alleenLetterB: SPEL_LETTERS[idxB],
      courtTriplet: m.court + speelbareMatches,
    };
  });

  return { matches: updatedMatches, alleenIndexUpdates };
}

// Sextet: pick who plays the solo "enkelspel" for each team in this round —
// the fixed MATCH16 lookup table (SEXTET_SPLIT) then decides which other 2
// form the dubbel and which other 3 form the triplet. Rotates through the
// team's 6 members the same way Kwartet does (index 0→1→2→3→4→5→0).
export function assignSextetRoles(
  matches: Match[],
  teams: Team[]
): { matches: Match[]; alleenIndexUpdates: Map<string, number> } {
  const teamById = new Map(teams.map((t) => [t.id, t]));
  const alleenIndexUpdates = new Map<string, number>();
  // Enkelspel, dubbel en triplet gebeuren tegelijk door andere mensen, dus
  // elk krijgt zijn eigen blok pleinnummers: enkelspel eerst, dan dubbel,
  // dan triplet.
  const speelbareMatches = matches.filter((m) => m.teamB !== null).length;

  const updatedMatches = matches.map((m) => {
    if (m.teamB === null) return m;
    const teamA = teamById.get(m.teamA);
    const teamB = teamById.get(m.teamB);
    const idxA = teamA?.kwartetAlleenIndex ?? 0;
    const idxB = teamB?.kwartetAlleenIndex ?? 0;
    alleenIndexUpdates.set(m.teamA, (idxA + 1) % 6);
    alleenIndexUpdates.set(m.teamB, (idxB + 1) % 6);
    return {
      ...m,
      kwsSoort: "sextet" as const,
      alleenNaamA: teamA?.members?.[idxA] ?? teamA?.name ?? "",
      alleenNaamB: teamB?.members?.[idxB] ?? teamB?.name ?? "",
      alleenLetterA: SPEL_LETTERS[idxA],
      alleenLetterB: SPEL_LETTERS[idxB],
      courtDoublet: m.court + speelbareMatches,
      courtTriplet: m.court + speelbareMatches * 2,
    };
  });

  return { matches: updatedMatches, alleenIndexUpdates };
}
