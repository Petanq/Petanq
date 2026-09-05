import type { Round, Team } from "./types";
import { computeStandings } from "./standings";

// ---- Poules: group stage + knockout pyramid, both built as one shared
// "bracket" structure ----
//
// A poule of 4 is really its own little single-elimination-with-barrage
// bracket, exactly as run at real club tournaments: round 1 is a random
// draw of 2 matches; the two round-1 winners then play each other for a
// direct qualification (2 wins); the two round-1 losers play each other and
// whoever loses THAT is out (2 losses); the loser of the winners' match and
// the winner of the losers' match then play a "barrage" decider for the
// pool's second qualifying spot. A pool of 3 (only ever used to fix up a
// remainder that doesn't divide evenly by 4) has no clean bracket shape for
// 3, so it stays a flat round-robin (every pair plays once), ranked by the
// same matchpunten/saldo already used elsewhere.
//
// The knockout pyramid afterwards is a standard single-elimination bracket,
// built once in full (not one round at a time) so that a match becomes
// playable the moment its two inputs are known — independent of whichever
// other tables are still mid-match. Each pool's two qualifiers are kept in
// opposite halves of the pyramid, so they can only meet again in the final.

const POULE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // I and O skipped — MATCH16 does the same, they look like 1/0

function pouleLabel(n: number): string {
  const base = POULE_LETTERS.length;
  if (n < base) return POULE_LETTERS[n];
  const first = Math.floor(n / base) - 1;
  const second = n % base;
  return POULE_LETTERS[first] + POULE_LETTERS[second];
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Splits N teams into as many pools of 4 as possible, using pools of 3 only
 * to fix up a remainder that doesn't divide evenly — exactly the rule from
 * MATCH16's manual ("zoveel mogelijk poules van 4"). Assignment to a
 * specific pool is random (there's no seeding data at registration time).
 * Returns teamId -> pool label ("A", "B", ... "AA", "AB", ...).
 */
export function assignPoules(teams: Team[]): Map<string, string> {
  const n = teams.length;

  let triples = -1;
  for (let t = 0; t * 3 <= n; t++) {
    if ((n - t * 3) % 4 === 0) {
      triples = t;
      break;
    }
  }

  const groupSizes: number[] = [];
  if (triples === -1) {
    // Only n=5 has no valid combination of 3s and 4s at all (the Frobenius
    // case for coin values 3 and 4) — fall back to one odd-sized pool; the
    // round-robin fallback below already copes fine with any pool size.
    groupSizes.push(n);
  } else {
    const quads = (n - triples * 3) / 4;
    for (let i = 0; i < quads; i++) groupSizes.push(4);
    for (let i = 0; i < triples; i++) groupSizes.push(3);
  }

  const shuffled = shuffle(teams);
  const result = new Map<string, string>();
  let idx = 0;
  groupSizes.forEach((size, pouleIdx) => {
    const label = pouleLabel(pouleIdx);
    for (let k = 0; k < size && idx < shuffled.length; k++) {
      result.set(shuffled[idx++].id, label);
    }
  });
  return result;
}

export function poulesOf(teams: Team[]): Map<string, Team[]> {
  const byPoule = new Map<string, Team[]>();
  for (const t of teams) {
    if (!t.poule) continue;
    const list = byPoule.get(t.poule) ?? [];
    list.push(t);
    byPoule.set(t.poule, list);
  }
  return byPoule;
}

// ---- The shared bracket primitive ----

export interface BracketRef {
  matchId: string;
  result: "winner" | "loser";
}

export interface BracketMatch {
  id: string;
  poule?: string;
  round: number;
  label: string;
  court?: number; // fixed at build time — a physical plein doesn't move once assigned
  teamA: string | null; // a concrete team id, or null when it comes from sourceA
  teamB: string | null; // a concrete team id, null-with-no-sourceB means a real BYE, or null-with-sourceB means "not decided yet"
  sourceA?: BracketRef;
  sourceB?: BracketRef;
  scoreA?: number;
  scoreB?: number;
}

export function isTrueBye(m: BracketMatch): boolean {
  return m.teamB === null && m.sourceB === undefined;
}

/** Resolves a match's two team ids right now, following sourceA/sourceB through already-finished matches. */
export function resolvedTeams(matches: BracketMatch[], m: BracketMatch): [string | null, string | null] {
  const a = m.teamA ?? (m.sourceA ? winnerLoserOf(matches, m.sourceA.matchId, m.sourceA.result) : null);
  if (isTrueBye(m)) return [a, null];
  const b = m.teamB ?? (m.sourceB ? winnerLoserOf(matches, m.sourceB.matchId, m.sourceB.result) : null);
  return [a, b];
}

/** The winner (or loser) of a specific match, or null if that isn't decided yet. */
export function winnerLoserOf(
  matches: BracketMatch[],
  id: string,
  want: "winner" | "loser"
): string | null {
  const m = matches.find((x) => x.id === id);
  if (!m) return null;
  const [a, b] = resolvedTeams(matches, m);
  if (a === null) return null;
  if (isTrueBye(m)) return want === "winner" ? a : null; // a bye has no loser
  if (b === null) return null; // still waiting on the other side
  if (m.scoreA === undefined || m.scoreB === undefined) return null; // not played yet
  const aWon = m.scoreA > m.scoreB;
  if (want === "winner") return aWon ? a : b;
  return aWon ? b : a;
}

/** Every match whose two teams are both known and which hasn't been scored yet — i.e. playable right now. */
export function playableMatches(matches: BracketMatch[]): BracketMatch[] {
  return matches.filter((m) => {
    if (isTrueBye(m)) return false; // auto-resolved, never needs a score
    if (m.scoreA !== undefined && m.scoreB !== undefined) return false; // already played
    const [a, b] = resolvedTeams(matches, m);
    return a !== null && b !== null;
  });
}

/** BYE matches whose one real team is already known — shown for transparency, never need a score. */
export function autoByeMatches(matches: BracketMatch[]): BracketMatch[] {
  return matches.filter((m) => isTrueBye(m) && resolvedTeams(matches, m)[0] !== null);
}

function totalPointDiff(matches: BracketMatch[], teamId: string): number {
  let diff = 0;
  for (const m of matches) {
    if (m.scoreA === undefined || m.scoreB === undefined) continue;
    const [a, b] = resolvedTeams(matches, m);
    if (a === teamId) diff += m.scoreA - m.scoreB;
    else if (b === teamId) diff += m.scoreB - m.scoreA;
  }
  return diff;
}

// ---- Pool of 4: the winners/losers/barrage mini-bracket ----
//
// Real club court assignment, not a global renumbering: each poule keeps 2
// dedicated pleinen for its whole run, so a poule only ever has to watch its
// own 2 courts, never wait on a court belonging to a different poule. Plein
// A hosts the "winning path" (round-1 match 1 -> Winnaars -> Barrage); plein
// B hosts round-1 match 2 and the Verliezers match, then is free.

export function buildPouleOf4Bracket(poule: string, teams: Team[], courtA: number): BracketMatch[] {
  const courtB = courtA + 1;
  const [a, b, c, d] = shuffle(teams);
  const m1 = `${poule}-R1-1`;
  const m2 = `${poule}-R1-2`;
  const win = `${poule}-WIN`;
  const loss = `${poule}-LOSS`;
  const bar = `${poule}-BAR`;
  return [
    { id: m1, poule, round: 1, label: "Ronde 1", court: courtA, teamA: a.id, teamB: b.id },
    { id: m2, poule, round: 1, label: "Ronde 1", court: courtB, teamA: c.id, teamB: d.id },
    {
      id: win,
      poule,
      round: 2,
      label: "Winnaars",
      court: courtA,
      teamA: null,
      teamB: null,
      sourceA: { matchId: m1, result: "winner" },
      sourceB: { matchId: m2, result: "winner" },
    },
    {
      id: loss,
      poule,
      round: 2,
      label: "Verliezers",
      court: courtB,
      teamA: null,
      teamB: null,
      sourceA: { matchId: m1, result: "loser" },
      sourceB: { matchId: m2, result: "loser" },
    },
    {
      id: bar,
      poule,
      round: 3,
      label: "Barrage",
      court: courtA,
      teamA: null,
      teamB: null,
      sourceA: { matchId: win, result: "loser" },
      sourceB: { matchId: loss, result: "winner" },
    },
  ];
}

/**
 * Pool of 3: the same winners/barrage idea as a pool of 4, minus the
 * losers' match — there's only one loser out of round 1 (not two), so
 * there's no one for them to play until the barrage. The third team has no
 * round-1 opponent at all ("vrij geloot" — drawn free) and is credited with
 * that round automatically, exactly like any other BYE in this app. Since
 * every round here has exactly one real match at a time, one dedicated
 * plein is enough for the whole poule.
 */
export function buildPouleOf3Bracket(poule: string, teams: Team[], court: number): BracketMatch[] {
  const [a, b, c] = shuffle(teams);
  const m1 = `${poule}-R1-1`;
  const bye = `${poule}-R1-BYE`;
  const win = `${poule}-WIN`;
  const bar = `${poule}-BAR`;
  return [
    { id: m1, poule, round: 1, label: "Ronde 1", court, teamA: a.id, teamB: b.id },
    { id: bye, poule, round: 1, label: "Vrij geloot", teamA: c.id, teamB: null },
    {
      id: win,
      poule,
      round: 2,
      label: "Winnaars",
      court,
      teamA: null,
      teamB: null,
      sourceA: { matchId: m1, result: "winner" },
      sourceB: { matchId: bye, result: "winner" },
    },
    {
      id: bar,
      poule,
      round: 3,
      label: "Barrage",
      court,
      teamA: null,
      teamB: null,
      sourceA: { matchId: win, result: "loser" },
      sourceB: { matchId: m1, result: "loser" },
    },
  ];
}

// ---- Any other pool size (in practice only the rare n=5 fallback): flat round-robin, no bracket dependencies at all ----
// No dependency chain at all here, so every match could in principle be
// played at once — each gets its own dedicated plein to be safe.

export function buildRoundRobinBracket(poule: string, teams: Team[], courtStart: number): BracketMatch[] {
  const matches: BracketMatch[] = [];
  let court = courtStart;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: `${poule}-RR-${i}-${j}`,
        poule,
        round: 1,
        label: "Groepsfase",
        court: court++,
        teamA: teams[i].id,
        teamB: teams[j].id,
      });
    }
  }
  return matches;
}

export function usesBarrageBracket(teamCount: number): boolean {
  return teamCount === 3 || teamCount === 4;
}

/** How many dedicated pleinen a poule of this size needs for its whole run. */
export function courtsNeededForPoule(teamCount: number): number {
  if (teamCount === 4) return 2;
  if (teamCount === 3) return 1;
  return (teamCount * (teamCount - 1)) / 2; // round-robin: no dependency chain to reuse courts across
}

export function buildPouleBracket(poule: string, teams: Team[], courtStart: number): BracketMatch[] {
  if (teams.length === 4) return buildPouleOf4Bracket(poule, teams, courtStart);
  if (teams.length === 3) return buildPouleOf3Bracket(poule, teams, courtStart);
  return buildRoundRobinBracket(poule, teams, courtStart);
}

/** True once this pool has produced its final ranking (all its matches are decided). */
export function pouleQualifiersReady(matches: BracketMatch[], poule: string, pouleTeams: Team[]): boolean {
  if (usesBarrageBracket(pouleTeams.length)) {
    return (
      winnerLoserOf(matches, `${poule}-WIN`, "winner") !== null &&
      winnerLoserOf(matches, `${poule}-BAR`, "winner") !== null
    );
  }
  return matches
    .filter((m) => m.poule === poule)
    .every((m) => m.scoreA !== undefined && m.scoreB !== undefined);
}

export interface PouleQualifier {
  teamId: string;
  poule: string;
  place: 1 | 2;
  tiebreak: number;
}

/** The pool's winner (place 1, direct 2-0 qualification) and its barrage winner (place 2) — pools of 3 and 4 alike. */
export function qualifiersFromBarrageBracket(matches: BracketMatch[], poule: string): PouleQualifier[] {
  const winnerId = winnerLoserOf(matches, `${poule}-WIN`, "winner");
  const barrageWinnerId = winnerLoserOf(matches, `${poule}-BAR`, "winner");
  const qualifiers: PouleQualifier[] = [];
  if (winnerId) qualifiers.push({ teamId: winnerId, poule, place: 1, tiebreak: totalPointDiff(matches, winnerId) });
  if (barrageWinnerId) {
    qualifiers.push({
      teamId: barrageWinnerId,
      poule,
      place: 2,
      tiebreak: totalPointDiff(matches, barrageWinnerId),
    });
  }
  return qualifiers;
}

/** Top 2 of a round-robin pool, ranked the same way as the rest of the app (matchpunten then saldo). */
export function qualifiersFromRoundRobin(
  matches: BracketMatch[],
  poule: string,
  pouleTeams: Team[]
): PouleQualifier[] {
  const fakeRound: Round = {
    number: 1,
    matches: matches
      .filter((m) => m.poule === poule)
      .map((m) => ({ court: 0, teamA: m.teamA as string, teamB: m.teamB, scoreA: m.scoreA, scoreB: m.scoreB })),
  };
  const standings = computeStandings(pouleTeams, [fakeRound]);
  return standings
    .slice(0, 2)
    .map((s, i) => ({ teamId: s.teamId, poule, place: (i === 0 ? 1 : 2) as 1 | 2, tiebreak: s.saldo }));
}

export function qualifiersFromPoule(matches: BracketMatch[], poule: string, pouleTeams: Team[]): PouleQualifier[] {
  return usesBarrageBracket(pouleTeams.length)
    ? qualifiersFromBarrageBracket(matches, poule)
    : qualifiersFromRoundRobin(matches, poule, pouleTeams);
}

// ---- The knockout pyramid ----

/** Classic recursive bracket-seed order (1v2 -> 1v4,2v3 -> 1v8,4v5,2v7,3v6 -> ...). */
function seedOrder(size: number): number[] {
  let seeds = [1, 2];
  while (seeds.length < size) {
    const n = seeds.length * 2 + 1;
    const next: number[] = [];
    for (const s of seeds) next.push(s, n - s);
    seeds = next;
  }
  return seeds;
}

function nextPowerOfTwo(n: number): number {
  let size = 1;
  while (size < n) size *= 2;
  return size;
}

function labelForRound(matchesInRound: number): string {
  if (matchesInRound === 1) return "Finale";
  if (matchesInRound === 2) return "Halve finale";
  if (matchesInRound === 4) return "Kwartfinale";
  if (matchesInRound === 8) return "Achtste finale";
  if (matchesInRound === 16) return "Zestiende finale";
  return `Ronde met ${matchesInRound} wedstrijden`;
}

/** How many dedicated pleinen one half of the pyramid needs for its whole run (its round-1 match count). */
function courtsNeededForHalf(seedCount: number): number {
  return seedCount <= 1 ? 0 : nextPowerOfTwo(seedCount) / 2;
}

/**
 * A standard single-elimination bracket for one seeded list — used to build
 * each half of the pyramid. When the seed count isn't itself a power of 2,
 * round 1 is a mix of byes (for the best-ranked seeds) and real matches for
 * the rest — those real matches are the "barrage" that trims the field down
 * to a clean size (e.g. 20 seeds -> 4 barrage matches among the bottom 8,
 * so exactly 16 go through to the round of 16). From round 2 on the field
 * size is always a clean power of 2, so those rounds get the normal
 * "Achtste/Kwart/Halve finale" names. This half keeps its own dedicated
 * block of pleinen for its whole run, reused position-by-position as rounds
 * progress (fewer matches each round, same courts).
 */
function buildSingleBracket(seeds: string[], idPrefix: string, courtStart: number): BracketMatch[] {
  if (seeds.length <= 1) return [];
  const size = nextPowerOfTwo(seeds.length);
  const hasByes = size > seeds.length;
  const order = seedOrder(size);
  const matches: BracketMatch[] = [];
  let roundIds: string[] = [];
  for (let i = 0; i < order.length; i += 2) {
    const aSeed = order[i];
    const bSeed = order[i + 1];
    const aId = aSeed <= seeds.length ? seeds[aSeed - 1] : null;
    const bId = bSeed <= seeds.length ? seeds[bSeed - 1] : null;
    const id = `${idPrefix}-R1-${matches.length}`;
    const court = courtStart + matches.length;
    if (aId && bId) {
      matches.push({ id, round: 1, label: hasByes ? "Barrage" : "", court, teamA: aId, teamB: bId });
    } else {
      matches.push({ id, round: 1, label: hasByes ? "Rechtstreeks door" : "", court, teamA: aId ?? bId, teamB: null });
    }
    roundIds.push(id);
  }
  let round = 2;
  while (roundIds.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < roundIds.length; i += 2) {
      const id = `${idPrefix}-R${round}-${next.length}`;
      matches.push({
        id,
        round,
        label: "",
        court: courtStart + next.length,
        teamA: null,
        teamB: null,
        sourceA: { matchId: roundIds[i], result: "winner" },
        sourceB: { matchId: roundIds[i + 1], result: "winner" },
      });
      next.push(id);
    }
    roundIds = next;
    round++;
  }
  // Elke ronde hier is maar 1 helft van de echte piramide — de andere helft
  // speelt evenveel wedstrijden in diezelfde ronde. "Kwartfinale"/"Achtste
  // finale" moet dus op het GECOMBINEERDE aantal wedstrijden over beide
  // helften gebaseerd zijn (× 2), anders heet bv. ronde 1 van elke helft bij
  // 4+ poules ten onrechte al "Halve finale" — hetzelfde label dat de echte
  // halve finale (de laatste ronde van de helft, hieronder geforceerd) ook
  // krijgt.
  if (!hasByes) {
    // The seed count was already a clean power of 2 — round 1 is a normal
    // round-of-N stage too, not a barrage, so it gets the same naming as
    // every later round.
    const perRound = new Map<number, number>();
    matches.forEach((m) => perRound.set(m.round, (perRound.get(m.round) ?? 0) + 1));
    return matches.map((m) => ({ ...m, label: labelForRound(perRound.get(m.round)! * 2) }));
  }
  // Round 1 was a barrage/bye mix (labelled above); from round 2 on the
  // field is always a clean power of 2, so those get the standard names.
  const perRound = new Map<number, number>();
  matches.filter((m) => m.round > 1).forEach((m) => perRound.set(m.round, (perRound.get(m.round) ?? 0) + 1));
  return matches.map((m) => (m.round === 1 ? m : { ...m, label: labelForRound(perRound.get(m.round)! * 2) }));
}

/**
 * Builds the entire knockout pyramid in one shot, from the qualifiers of
 * every pool. Place-1 qualifiers (direct, 2-0) seed one half of the pyramid,
 * place-2 qualifiers (via the barrage) seed the other half — since the two
 * qualifiers from any one pool always land one in each half, they can only
 * possibly meet again in the grand final, never earlier.
 */
export function buildKnockoutBracket(qualifiers: PouleQualifier[]): BracketMatch[] {
  const firstPlace = qualifiers
    .filter((q) => q.place === 1)
    .sort((a, b) => b.tiebreak - a.tiebreak)
    .map((q) => q.teamId);
  const secondPlace = qualifiers
    .filter((q) => q.place === 2)
    .sort((a, b) => b.tiebreak - a.tiebreak)
    .map((q) => q.teamId);

  // Plein 1 is reserved for the grand final alone; the two halves get their
  // own dedicated, non-overlapping blocks of pleinen after that.
  const top = buildSingleBracket(firstPlace, "KO-A", 2);
  const bottom = buildSingleBracket(secondPlace, "KO-B", 2 + courtsNeededForHalf(firstPlace.length));

  const topRef: BracketRef | { teamId: string } | null =
    top.length > 0
      ? { matchId: top[top.length - 1].id, result: "winner" }
      : firstPlace.length === 1
      ? { teamId: firstPlace[0] }
      : null;
  const bottomRef: BracketRef | { teamId: string } | null =
    bottom.length > 0
      ? { matchId: bottom[bottom.length - 1].id, result: "winner" }
      : secondPlace.length === 1
      ? { teamId: secondPlace[0] }
      : null;

  if (!topRef && !bottomRef) return [];
  if (!bottomRef) return top;
  if (!topRef) return bottom;

  if (top.length > 0) top[top.length - 1] = { ...top[top.length - 1], label: "Halve finale" };
  if (bottom.length > 0) bottom[bottom.length - 1] = { ...bottom[bottom.length - 1], label: "Halve finale" };

  const maxRound = Math.max(top[top.length - 1]?.round ?? 0, bottom[bottom.length - 1]?.round ?? 0);
  const grandFinal: BracketMatch = {
    id: "KO-FINAL",
    round: maxRound + 1,
    label: "Finale",
    court: 1,
    teamA: "teamId" in topRef ? topRef.teamId : null,
    teamB: "teamId" in bottomRef ? bottomRef.teamId : null,
    sourceA: "matchId" in topRef ? topRef : undefined,
    sourceB: "matchId" in bottomRef ? bottomRef : undefined,
  };
  return [...top, ...bottom, grandFinal];
}
