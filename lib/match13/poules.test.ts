import { describe, expect, it } from "vitest";
import {
  assignPoules,
  buildKnockoutBracket,
  buildPouleBracket,
  buildPouleOf3Bracket,
  buildPouleOf4Bracket,
  buildRoundRobinBracket,
  courtsNeededForPoule,
  playableMatches,
  poulesOf,
  pouleQualifiersReady,
  qualifiersFromBarrageBracket,
  qualifiersFromRoundRobin,
  resolvedTeams,
  winnerLoserOf,
  type BracketMatch,
} from "./poules";
import type { Team } from "./types";

function makeTeam(id: string): Team {
  return { id, number: 1, name: id, present: true, paid: false, byes: 0 };
}

function score(matches: BracketMatch[], id: string, a: number, b: number): BracketMatch[] {
  return matches.map((m) => (m.id === id ? { ...m, scoreA: a, scoreB: b } : m));
}

describe("assignPoules", () => {
  it("makes pools of 4 when the count divides evenly", () => {
    const teams = Array.from({ length: 8 }, (_, i) => makeTeam(`T${i}`));
    const poules = assignPoules(teams);
    const sizes = new Map<string, number>();
    for (const label of poules.values()) sizes.set(label, (sizes.get(label) ?? 0) + 1);
    expect([...sizes.values()].sort()).toEqual([4, 4]);
  });

  it("uses pools of 3 only to fix up a remainder", () => {
    const teams = Array.from({ length: 11 }, (_, i) => makeTeam(`T${i}`));
    const poules = assignPoules(teams);
    const sizes = new Map<string, number>();
    for (const label of poules.values()) sizes.set(label, (sizes.get(label) ?? 0) + 1);
    expect([...sizes.values()].sort()).toEqual([3, 4, 4]);
  });

  it("falls back to a single pool of 5 — the one count with no 3/4 split", () => {
    const teams = Array.from({ length: 5 }, (_, i) => makeTeam(`T${i}`));
    const poules = assignPoules(teams);
    const sizes = new Map<string, number>();
    for (const label of poules.values()) sizes.set(label, (sizes.get(label) ?? 0) + 1);
    expect([...sizes.values()]).toEqual([5]);
  });

  it("skips I and O when labelling pools", () => {
    const teams = Array.from({ length: 36 }, (_, i) => makeTeam(`T${i}`));
    const poules = assignPoules(teams);
    const labels = new Set(poules.values());
    expect(labels.has("I")).toBe(false);
    expect(labels.has("O")).toBe(false);
    expect(labels.size).toBe(9);
  });
});

describe("poulesOf", () => {
  it("groups teams by their assigned pool label", () => {
    const teams = [makeTeam("A1"), makeTeam("A2"), makeTeam("B1")];
    teams[0].poule = "A";
    teams[1].poule = "A";
    teams[2].poule = "B";
    const grouped = poulesOf(teams);
    expect(grouped.get("A")!.map((t) => t.id).sort()).toEqual(["A1", "A2"]);
    expect(grouped.get("B")!.map((t) => t.id)).toEqual(["B1"]);
  });
});

describe("buildPouleOf4Bracket — winners/losers/barrage", () => {
  const teams = ["T1", "T2", "T3", "T4"].map(makeTeam);

  it("has round-1, winners/losers, and a barrage, wired to the right sources", () => {
    const matches = buildPouleOf4Bracket("A", teams, 1);
    expect(matches.map((m) => m.id)).toEqual(["A-R1-1", "A-R1-2", "A-WIN", "A-LOSS", "A-BAR"]);
    const win = matches.find((m) => m.id === "A-WIN")!;
    const loss = matches.find((m) => m.id === "A-LOSS")!;
    const bar = matches.find((m) => m.id === "A-BAR")!;
    expect(win.sourceA).toEqual({ matchId: "A-R1-1", result: "winner" });
    expect(win.sourceB).toEqual({ matchId: "A-R1-2", result: "winner" });
    expect(loss.sourceA).toEqual({ matchId: "A-R1-1", result: "loser" });
    expect(loss.sourceB).toEqual({ matchId: "A-R1-2", result: "loser" });
    expect(bar.sourceA).toEqual({ matchId: "A-WIN", result: "loser" });
    expect(bar.sourceB).toEqual({ matchId: "A-LOSS", result: "winner" });
  });

  it("only unlocks the winners/losers matches once both round-1 matches are scored", () => {
    let matches = buildPouleOf4Bracket("A", teams, 1);
    expect(playableMatches(matches).map((m) => m.id).sort()).toEqual(["A-R1-1", "A-R1-2"]);

    // Score only one of the two round-1 matches — nothing downstream unlocks yet,
    // and the OTHER round-1 match stays playable independently.
    matches = score(matches, "A-R1-1", 13, 5);
    expect(playableMatches(matches).map((m) => m.id)).toEqual(["A-R1-2"]);

    matches = score(matches, "A-R1-2", 13, 8);
    expect(playableMatches(matches).map((m) => m.id).sort()).toEqual(["A-LOSS", "A-WIN"]);
  });

  it("sends the two round-1 winners into the winners match and the two losers into the losers match", () => {
    let matches = buildPouleOf4Bracket("A", teams, 1);
    const [m1, m2] = matches;
    matches = score(matches, m1.id, 13, 5); // m1.teamA wins
    matches = score(matches, m2.id, 7, 13); // m2.teamB wins
    const win = matches.find((m) => m.id === "A-WIN")!;
    const [wa, wb] = resolvedTeams(matches, win);
    expect(new Set([wa, wb])).toEqual(new Set([m1.teamA, m2.teamB]));
    const loss = matches.find((m) => m.id === "A-LOSS")!;
    const [la, lb] = resolvedTeams(matches, loss);
    expect(new Set([la, lb])).toEqual(new Set([m1.teamB, m2.teamA]));
  });

  it("produces exactly 2 qualifiers once winners and barrage are both decided, and eliminates the rest", () => {
    let matches = buildPouleOf4Bracket("A", teams, 1);
    const [m1, m2] = matches;
    matches = score(matches, m1.id, 13, 5);
    matches = score(matches, m2.id, 13, 6);
    matches = score(matches, "A-WIN", 13, 9); // round-1 winner of m1 takes the pool outright (2-0)
    matches = score(matches, "A-LOSS", 13, 4); // round-1 loser of m1 beats round-1 loser of m2, advances to barrage
    expect(pouleQualifiersReady(matches, "A", teams)).toBe(false); // barrage not played yet
    matches = score(matches, "A-BAR", 8, 13);

    expect(pouleQualifiersReady(matches, "A", teams)).toBe(true);
    const qualifiers = qualifiersFromBarrageBracket(matches, "A");
    expect(qualifiers).toHaveLength(2);
    expect(qualifiers.filter((q) => q.place === 1)).toHaveLength(1);
    expect(qualifiers.filter((q) => q.place === 2)).toHaveLength(1);
    // the direct qualifier is whoever won A-WIN; the barrage winner is the other qualifier.
    const directWinner = winnerLoserOf(matches, "A-WIN", "winner");
    const barrageWinner = winnerLoserOf(matches, "A-BAR", "winner");
    expect(new Set(qualifiers.map((q) => q.teamId))).toEqual(new Set([directWinner, barrageWinner]));
    // whoever lost the barrage, and whoever lost the losers' match, are eliminated —
    // i.e. never appear among the qualifiers.
    const barrageLoser = winnerLoserOf(matches, "A-BAR", "loser");
    const lossLoser = winnerLoserOf(matches, "A-LOSS", "loser");
    expect(qualifiers.map((q) => q.teamId)).not.toContain(barrageLoser);
    expect(qualifiers.map((q) => q.teamId)).not.toContain(lossLoser);
  });
});

describe("buildPouleOf3Bracket — winners/barrage, no losers' match", () => {
  const teams = ["T1", "T2", "T3"].map(makeTeam);

  it("has round-1 (a real match plus a bye), then winners, then barrage — no losers' match at all", () => {
    const matches = buildPouleOf3Bracket("A", teams, 1);
    expect(matches.map((m) => m.id).sort()).toEqual(["A-BAR", "A-R1-1", "A-R1-BYE", "A-WIN"].sort());
    const bye = matches.find((m) => m.id === "A-R1-BYE")!;
    expect(bye.teamB).toBeNull();
    expect(bye.label).toBe("Vrij geloot");
    const win = matches.find((m) => m.id === "A-WIN")!;
    expect(win.sourceA).toEqual({ matchId: "A-R1-1", result: "winner" });
    expect(win.sourceB).toEqual({ matchId: "A-R1-BYE", result: "winner" });
    const bar = matches.find((m) => m.id === "A-BAR")!;
    expect(bar.sourceA).toEqual({ matchId: "A-WIN", result: "loser" });
    expect(bar.sourceB).toEqual({ matchId: "A-R1-1", result: "loser" });
  });

  it("the bye team is immediately playable against the round-1 winner — no waiting on a losers' match", () => {
    let matches = buildPouleOf3Bracket("A", teams, 1);
    const [m1] = matches;
    expect(playableMatches(matches).map((m) => m.id)).toEqual([m1.id]); // the bye isn't "playable", just auto-resolved
    matches = score(matches, m1.id, 13, 5);
    const win = matches.find((m) => m.id === "A-WIN")!;
    const [wa, wb] = resolvedTeams(matches, win);
    expect(new Set([wa, wb])).toEqual(new Set([m1.teamA, teams.find((t) => t.id !== m1.teamA && t.id !== m1.teamB)!.id]));
  });

  it("sends the round-1 loser straight to the barrage against the winners'-match loser", () => {
    let matches = buildPouleOf3Bracket("A", teams, 1);
    const [m1] = matches;
    const byeTeam = matches.find((m) => m.id === "A-R1-BYE")!.teamA!;
    matches = score(matches, m1.id, 13, 5); // m1.teamA wins, m1.teamB is the round-1 loser
    matches = score(matches, "A-WIN", 4, 13); // byeTeam wins the winners' match — m1.teamA now also lost this
    expect(pouleQualifiersReady(matches, "A", teams)).toBe(false);
    matches = score(matches, "A-BAR", 6, 13); // m1.teamB (the round-1 loser) beats m1.teamA in the barrage
    expect(pouleQualifiersReady(matches, "A", teams)).toBe(true);
    const qualifiers = qualifiersFromBarrageBracket(matches, "A");
    expect(qualifiers.find((q) => q.place === 1)!.teamId).toBe(byeTeam);
    expect(qualifiers.find((q) => q.place === 2)!.teamId).toBe(m1.teamB);
    expect(qualifiers.map((q) => q.teamId)).not.toContain(m1.teamA); // m1.teamA lost the winners' match and then the barrage
  });
});

describe("buildRoundRobinBracket — the rare non-3/4 pool size fallback (n=5)", () => {
  it("pairs every team against every other team exactly once, with no dependencies at all", () => {
    const teams = Array.from({ length: 5 }, (_, i) => makeTeam(`T${i}`));
    const matches = buildRoundRobinBracket("B", teams, 1);
    expect(matches).toHaveLength(10); // C(5,2)
    // every match is immediately playable — no waiting on anything.
    expect(playableMatches(matches)).toHaveLength(10);
  });

  it("ranks the top 2 by matchpunten/saldo once every match is scored", () => {
    // Only 3 teams here (pouleQualifiersReady treats 3 as a barrage pool, so
    // it isn't exercised in this test) — this test is specifically about
    // qualifiersFromRoundRobin's ranking, independent of pool size.
    const teams = ["T1", "T2", "T3"].map(makeTeam);
    let matches = buildRoundRobinBracket("B", teams, 1);
    matches = score(matches, "B-RR-0-1", 13, 2); // T1 beats T2
    matches = score(matches, "B-RR-0-2", 13, 1); // T1 beats T3
    matches = score(matches, "B-RR-1-2", 13, 9); // T2 beats T3
    const qualifiers = qualifiersFromRoundRobin(matches, "B", teams);
    expect(qualifiers.map((q) => q.teamId)).toEqual(["T1", "T2"]);
    expect(qualifiers[0].place).toBe(1);
    expect(qualifiers[1].place).toBe(2);
  });
});

describe("buildPouleBracket dispatch", () => {
  it("uses the winners/barrage bracket for pools of 3 and 4, round-robin otherwise", () => {
    const four = buildPouleBracket("A", ["T1", "T2", "T3", "T4"].map(makeTeam), 1);
    expect(four.some((m) => m.id === "A-BAR")).toBe(true);
    const three = buildPouleBracket("B", ["T1", "T2", "T3"].map(makeTeam), 3);
    expect(three.some((m) => m.id === "B-BAR")).toBe(true);
    expect(three.some((m) => m.id === "B-R1-BYE")).toBe(true);
    const five = buildPouleBracket("C", Array.from({ length: 5 }, (_, i) => makeTeam(`T${i}`)), 4);
    expect(five.some((m) => m.id.includes("BAR"))).toBe(false);
    expect(five).toHaveLength(10);
  });
});

describe("courtsNeededForPoule and per-poule static court assignment", () => {
  it("a poule of 4 gets 2 dedicated pleinen: courtA hosts the winning path, courtB the rest", () => {
    expect(courtsNeededForPoule(4)).toBe(2);
    const teams = ["T1", "T2", "T3", "T4"].map(makeTeam);
    const matches = buildPouleOf4Bracket("A", teams, 5);
    const byId = new Map(matches.map((m) => [m.id, m.court]));
    expect(byId.get("A-R1-1")).toBe(5);
    expect(byId.get("A-R1-2")).toBe(6);
    expect(byId.get("A-WIN")).toBe(5); // winning path stays on courtA
    expect(byId.get("A-LOSS")).toBe(6); // losers' match stays on courtB
    expect(byId.get("A-BAR")).toBe(5); // barrage — the decisive match — is back on courtA
  });

  it("a poule of 3 only ever needs 1 dedicated plein — every round there is sequential, never simultaneous", () => {
    expect(courtsNeededForPoule(3)).toBe(1);
    const teams = ["T1", "T2", "T3"].map(makeTeam);
    const matches = buildPouleOf3Bracket("A", teams, 7);
    const byId = new Map(matches.map((m) => [m.id, m.court]));
    expect(byId.get("A-R1-1")).toBe(7);
    expect(byId.get("A-WIN")).toBe(7);
    expect(byId.get("A-BAR")).toBe(7);
  });

  it("two poules built back-to-back never share a plein — each only ever has to watch its own courts", () => {
    const pouleA = buildPouleBracket("A", ["T1", "T2", "T3", "T4"].map(makeTeam), 1);
    const pouleB = buildPouleBracket("B", ["T1", "T2", "T3", "T4"].map(makeTeam), 1 + courtsNeededForPoule(4));
    const courtsA = new Set(pouleA.map((m) => m.court).filter((c) => c !== undefined));
    const courtsB = new Set(pouleB.map((m) => m.court).filter((c) => c !== undefined));
    expect([...courtsA].every((c) => !courtsB.has(c))).toBe(true);
    expect(courtsA).toEqual(new Set([1, 2]));
    expect(courtsB).toEqual(new Set([3, 4]));
  });
});

describe("buildKnockoutBracket", () => {
  it("keeps each pool's two qualifiers in opposite halves, so they can only meet in the final", () => {
    // 3 pools of 4 => 3 direct qualifiers + 3 barrage qualifiers = 6 total.
    const qualifiers = [
      { teamId: "A-first", poule: "A", place: 1 as const, tiebreak: 20 },
      { teamId: "A-second", poule: "A", place: 2 as const, tiebreak: 5 },
      { teamId: "B-first", poule: "B", place: 1 as const, tiebreak: 15 },
      { teamId: "B-second", poule: "B", place: 2 as const, tiebreak: 10 },
      { teamId: "C-first", poule: "C", place: 1 as const, tiebreak: 12 },
      { teamId: "C-second", poule: "C", place: 2 as const, tiebreak: 8 },
    ];
    const bracket = buildKnockoutBracket(qualifiers);
    const finalMatch = bracket[bracket.length - 1];
    expect(finalMatch.label).toBe("Finale");

    // Simulate every match through to the end, tracking who meets whom.
    let matches = bracket;
    const meetings: [string, string][] = [];
    // Keep resolving+scoring round by round until everything is decided.
    for (let guard = 0; guard < 10; guard++) {
      const playable = playableMatches(matches);
      if (playable.length === 0) break;
      for (const m of playable) {
        const [a, b] = resolvedTeams(matches, m);
        meetings.push([a!, b!]);
        // team that sorts first alphabetically "wins" — deterministic, doesn't matter who.
        const aWins = a! < b!;
        matches = matches.map((x) => (x.id === m.id ? { ...x, scoreA: aWins ? 13 : 5, scoreB: aWins ? 5 : 13 } : x));
      }
    }
    const samePoolMeetingsBeforeFinal = meetings
      .slice(0, -1) // drop the grand final itself
      .filter(([a, b]) => a.split("-")[0] === b.split("-")[0]);
    expect(samePoolMeetingsBeforeFinal).toEqual([]);
  });

  it("gives the top seed of each half a bye when that half isn't a power of 2", () => {
    // 3 pools => 3 direct qualifiers (half size 3, rounds up to 4, seed 1 gets a bye)
    const qualifiers = [
      { teamId: "A-first", poule: "A", place: 1 as const, tiebreak: 30 },
      { teamId: "A-second", poule: "A", place: 2 as const, tiebreak: 1 },
      { teamId: "B-first", poule: "B", place: 1 as const, tiebreak: 20 },
      { teamId: "B-second", poule: "B", place: 2 as const, tiebreak: 2 },
      { teamId: "C-first", poule: "C", place: 1 as const, tiebreak: 10 },
      { teamId: "C-second", poule: "C", place: 2 as const, tiebreak: 3 },
    ];
    const bracket = buildKnockoutBracket(qualifiers);
    const topHalfR1 = bracket.filter((m) => m.id.startsWith("KO-A-R1-"));
    const bye = topHalfR1.find((m) => m.teamB === null);
    expect(bye?.teamA).toBe("A-first"); // best-ranked direct qualifier is protected with the bye
  });

  it("labels the trimming round 'Barrage' when the half isn't a power of 2, and the clean round after it by size", () => {
    // 5 direct qualifiers -> half size 5, rounds up to 8: byes for the top 3
    // seeds, 1 real "barrage" match between the bottom 2 (seeds 4 and 5) —
    // trimming the field to exactly 4 for a clean "halve finale" round 2.
    const qualifiers = [
      ...Array.from({ length: 5 }, (_, i) => ({
        teamId: `P${i}-first`,
        poule: `P${i}`,
        place: 1 as const,
        tiebreak: 100 - i,
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        teamId: `P${i}-second`,
        poule: `P${i}`,
        place: 2 as const,
        tiebreak: 100 - i,
      })),
    ];
    const bracket = buildKnockoutBracket(qualifiers);
    const topR1 = bracket.filter((m) => m.id.startsWith("KO-A-R1-"));
    const byes = topR1.filter((m) => m.teamB === null);
    const real = topR1.filter((m) => m.teamB !== null);
    expect(byes).toHaveLength(3);
    expect(real).toHaveLength(1);
    expect(byes.every((m) => m.label === "Rechtstreeks door")).toBe(true);
    expect(real.every((m) => m.label === "Barrage")).toBe(true);
    // byes (3) + the barrage winner (1) = 4 survivors per half, 8 combined
    // across both halves -> a "kwartfinale" round, not "halve finale" (that
    // combined-across-halves count is what must drive the label, not the
    // per-half match count alone).
    const topR2 = bracket.filter((m) => m.id.startsWith("KO-A-R2-"));
    expect(topR2).toHaveLength(2);
    expect(topR2.every((m) => m.label === "Kwartfinale")).toBe(true);
    // Round 3 (1 match) is the half's own final -> the real combined semifinal.
    const topR3 = bracket.filter((m) => m.id.startsWith("KO-A-R3-"));
    expect(topR3).toHaveLength(1);
    expect(topR3[0].label).toBe("Halve finale");
  });

  it("labels round 1 by the combined-across-both-halves round-of-N name when the half is already a clean power of 2", () => {
    const qualifiers = [
      { teamId: "A-first", poule: "A", place: 1 as const, tiebreak: 40 },
      { teamId: "A-second", poule: "A", place: 2 as const, tiebreak: 1 },
      { teamId: "B-first", poule: "B", place: 1 as const, tiebreak: 30 },
      { teamId: "B-second", poule: "B", place: 2 as const, tiebreak: 2 },
      { teamId: "C-first", poule: "C", place: 1 as const, tiebreak: 20 },
      { teamId: "C-second", poule: "C", place: 2 as const, tiebreak: 3 },
      { teamId: "D-first", poule: "D", place: 1 as const, tiebreak: 10 },
      { teamId: "D-second", poule: "D", place: 2 as const, tiebreak: 4 },
    ];
    const bracket = buildKnockoutBracket(qualifiers);
    const topR1 = bracket.filter((m) => m.id.startsWith("KO-A-R1-"));
    expect(topR1).toHaveLength(2); // exactly 4 direct qualifiers, no byes needed
    expect(topR1.every((m) => m.teamB !== null)).toBe(true);
    // 2 matches per half = 4 combined across both halves -> "kwartfinale",
    // even though it's only 2 matches within this one half's own bracket.
    expect(topR1.every((m) => m.label === "Kwartfinale")).toBe(true);
    // Round 2 (the half's own final, 1 match) is the true combined semifinal.
    const topR2 = bracket.filter((m) => m.id.startsWith("KO-A-R2-"));
    expect(topR2).toHaveLength(1);
    expect(topR2[0].label).toBe("Halve finale");
  });

  it("builds a direct final with no bracket at all when there's only one pool", () => {
    const qualifiers = [
      { teamId: "only-first", poule: "A", place: 1 as const, tiebreak: 10 },
      { teamId: "only-second", poule: "A", place: 2 as const, tiebreak: 5 },
    ];
    const bracket = buildKnockoutBracket(qualifiers);
    expect(bracket).toHaveLength(1);
    expect(bracket[0].teamA).toBe("only-first");
    expect(bracket[0].teamB).toBe("only-second");
    expect(bracket[0].label).toBe("Finale");
  });
});

describe("buildKnockoutBracket — static, per-half plein blocks with the final pinned to plein 1", () => {
  it("always gives the grand final plein 1, no matter the field size", () => {
    const qualifiers = [
      { teamId: "only-first", poule: "A", place: 1 as const, tiebreak: 10 },
      { teamId: "only-second", poule: "A", place: 2 as const, tiebreak: 5 },
    ];
    const bracket = buildKnockoutBracket(qualifiers);
    const finalMatch = bracket[bracket.length - 1];
    expect(finalMatch.label).toBe("Finale");
    expect(finalMatch.court).toBe(1);
  });

  it("gives each half its own dedicated, non-overlapping block of pleinen, reused round to round", () => {
    // 3 pools of 4 -> half size 3 each, rounds up to 4 (1 bye + 1 real match
    // in round 1, needing 2 pleinen for that half).
    const qualifiers = [
      { teamId: "A-first", poule: "A", place: 1 as const, tiebreak: 30 },
      { teamId: "A-second", poule: "A", place: 2 as const, tiebreak: 1 },
      { teamId: "B-first", poule: "B", place: 1 as const, tiebreak: 20 },
      { teamId: "B-second", poule: "B", place: 2 as const, tiebreak: 2 },
      { teamId: "C-first", poule: "C", place: 1 as const, tiebreak: 10 },
      { teamId: "C-second", poule: "C", place: 2 as const, tiebreak: 3 },
    ];
    const bracket = buildKnockoutBracket(qualifiers);
    const finalMatch = bracket[bracket.length - 1];
    expect(finalMatch.court).toBe(1);

    const top = bracket.filter((m) => m.id.startsWith("KO-A-"));
    const bottom = bracket.filter((m) => m.id.startsWith("KO-B-"));
    const topCourts = new Set(top.map((m) => m.court));
    const bottomCourts = new Set(bottom.map((m) => m.court));
    // plein 1 is reserved for the final alone, and the two halves never share a plein.
    expect(topCourts.has(1)).toBe(false);
    expect(bottomCourts.has(1)).toBe(false);
    expect([...topCourts].every((c) => !bottomCourts.has(c))).toBe(true);

    // Round 1 of the top half needs 2 pleinen (bye + 1 real match); round 2
    // (its own "halve finale") is just 1 match, reusing the FIRST of those
    // same 2 pleinen rather than being handed a brand new number.
    const topR1Courts = top.filter((m) => m.round === 1).map((m) => m.court);
    const topR2Court = top.find((m) => m.round === 2)!.court;
    expect(new Set(topR1Courts).size).toBe(2);
    expect(topR2Court).toBe(Math.min(...(topR1Courts as number[])));
  });
});
