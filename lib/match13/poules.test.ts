import { describe, expect, it } from "vitest";
import {
  assignPoules,
  buildKnockoutBracket,
  buildKnockoutBracketB,
  buildPouleBracket,
  buildPouleOf3Bracket,
  buildPouleOf4Bracket,
  buildRoundRobinBracket,
  courtsNeededForKnockout,
  courtsNeededForPoule,
  knockoutRanking,
  playableMatches,
  poulesOf,
  poulesRestRanking,
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
    // Alle 4 teams krijgen een plaats: 1+2 voeden Piramide A (de winnaars),
    // 3+4 voeden de optionele Piramide B (de verliezers/"Consolante").
    expect(qualifiers).toHaveLength(4);
    expect(qualifiers.filter((q) => q.place === 1)).toHaveLength(1);
    expect(qualifiers.filter((q) => q.place === 2)).toHaveLength(1);
    expect(qualifiers.filter((q) => q.place === 3)).toHaveLength(1);
    expect(qualifiers.filter((q) => q.place === 4)).toHaveLength(1);
    // the direct qualifier is whoever won A-WIN; the barrage winner is the other Piramide-A qualifier.
    const directWinner = winnerLoserOf(matches, "A-WIN", "winner");
    const barrageWinner = winnerLoserOf(matches, "A-BAR", "winner");
    const topTwo = qualifiers.filter((q) => q.place === 1 || q.place === 2).map((q) => q.teamId);
    expect(new Set(topTwo)).toEqual(new Set([directWinner, barrageWinner]));
    // whoever lost the barrage (place 3), and whoever lost the losers' match
    // (place 4), are out of Piramide A but still show up for Piramide B.
    const barrageLoser = winnerLoserOf(matches, "A-BAR", "loser");
    const lossLoser = winnerLoserOf(matches, "A-LOSS", "loser");
    expect(qualifiers.find((q) => q.place === 3)!.teamId).toBe(barrageLoser);
    expect(qualifiers.find((q) => q.place === 4)!.teamId).toBe(lossLoser);
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
    // m1.teamA lost the winners' match and then the barrage — place 3 (for
    // Piramide B), not eliminated outright. A pool of 3 has no losers'
    // match at all, so there's simply no place 4 here.
    expect(qualifiers.find((q) => q.place === 3)!.teamId).toBe(m1.teamA);
    expect(qualifiers.find((q) => q.place === 4)).toBeUndefined();
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

  it("ranks every team by matchpunten/saldo once every match is scored (up to 4 places)", () => {
    // Only 3 teams here (pouleQualifiersReady treats 3 as a barrage pool, so
    // it isn't exercised in this test) — this test is specifically about
    // qualifiersFromRoundRobin's ranking, independent of pool size.
    const teams = ["T1", "T2", "T3"].map(makeTeam);
    let matches = buildRoundRobinBracket("B", teams, 1);
    matches = score(matches, "B-RR-0-1", 13, 2); // T1 beats T2
    matches = score(matches, "B-RR-0-2", 13, 1); // T1 beats T3
    matches = score(matches, "B-RR-1-2", 13, 9); // T2 beats T3
    const qualifiers = qualifiersFromRoundRobin(matches, "B", teams);
    // Alle 3 teams krijgen een plaats (gekapt op maximum 4) — plaats 1/2
    // voeden Piramide A, de rest (hier enkel plaats 3) voedt Piramide B.
    expect(qualifiers.map((q) => q.teamId)).toEqual(["T1", "T2", "T3"]);
    expect(qualifiers[0].place).toBe(1);
    expect(qualifiers[1].place).toBe(2);
    expect(qualifiers[2].place).toBe(3);
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

describe("buildKnockoutBracketB — the optional 'Consolante' for poule-fase losers", () => {
  // 3 pools of 4 => plaats 3 en 4 per poule, 3 van elk = 6 total, net als
  // Piramide A hierboven maar dan gevoed door de andere twee plaatsen.
  const qualifiers = [
    { teamId: "A-first", poule: "A", place: 1 as const, tiebreak: 0 },
    { teamId: "A-second", poule: "A", place: 2 as const, tiebreak: 0 },
    { teamId: "A-third", poule: "A", place: 3 as const, tiebreak: 0 },
    { teamId: "A-fourth", poule: "A", place: 4 as const, tiebreak: 0 },
    { teamId: "B-first", poule: "B", place: 1 as const, tiebreak: 0 },
    { teamId: "B-second", poule: "B", place: 2 as const, tiebreak: 0 },
    { teamId: "B-third", poule: "B", place: 3 as const, tiebreak: 0 },
    { teamId: "B-fourth", poule: "B", place: 4 as const, tiebreak: 0 },
    { teamId: "C-first", poule: "C", place: 1 as const, tiebreak: 0 },
    { teamId: "C-second", poule: "C", place: 2 as const, tiebreak: 0 },
    { teamId: "C-third", poule: "C", place: 3 as const, tiebreak: 0 },
    { teamId: "C-fourth", poule: "C", place: 4 as const, tiebreak: 0 },
  ];

  it("is seeded from place 3/4 only, never touching place 1/2 (Piramide A's own teams)", () => {
    const bracket = buildKnockoutBracketB(qualifiers, 10);
    const idsInB = new Set(
      bracket.flatMap((m) => [m.teamA, m.teamB]).filter((id): id is string => id !== null)
    );
    expect(idsInB.has("A-first")).toBe(false);
    expect(idsInB.has("A-second")).toBe(false);
    expect(idsInB.has("A-third")).toBe(true);
    expect(idsInB.has("A-fourth")).toBe(true);
  });

  it("keeps each pool's two Piramide-B qualifiers in opposite halves, so they only meet in Piramide B's own final", () => {
    const bracket = buildKnockoutBracketB(qualifiers, 10);
    let matches = bracket;
    const meetings: [string, string][] = [];
    for (let guard = 0; guard < 10; guard++) {
      const playable = playableMatches(matches);
      if (playable.length === 0) break;
      for (const m of playable) {
        const [a, b] = resolvedTeams(matches, m);
        meetings.push([a!, b!]);
        const aWins = a! < b!;
        matches = matches.map((x) => (x.id === m.id ? { ...x, scoreA: aWins ? 13 : 5, scoreB: aWins ? 5 : 13 } : x));
      }
    }
    const samePoolMeetingsBeforeFinal = meetings
      .slice(0, -1)
      .filter(([a, b]) => a.split("-")[0] === b.split("-")[0]);
    expect(samePoolMeetingsBeforeFinal).toEqual([]);
  });

  it("never reuses a plein Piramide A already claimed — everything starts at the given courtStart", () => {
    const courtStart = 10;
    const bracket = buildKnockoutBracketB(qualifiers, courtStart);
    expect(bracket.every((m) => (m.court ?? courtStart) >= courtStart)).toBe(true);
  });

  it("has its own, separate id namespace (KOB-...) so it can never collide with Piramide A's (KO-...)", () => {
    const bracket = buildKnockoutBracketB(qualifiers, 10);
    expect(bracket.every((m) => m.id.startsWith("KOB-"))).toBe(true);
  });
});

describe("courtsNeededForKnockout", () => {
  it("adds up plein 1 (the final) plus both halves' own needs, so Piramide B knows where to start", () => {
    const qualifiers = [
      { teamId: "A-first", poule: "A", place: 1 as const, tiebreak: 0 },
      { teamId: "A-second", poule: "A", place: 2 as const, tiebreak: 0 },
      { teamId: "B-first", poule: "B", place: 1 as const, tiebreak: 0 },
      { teamId: "B-second", poule: "B", place: 2 as const, tiebreak: 0 },
      { teamId: "C-first", poule: "C", place: 1 as const, tiebreak: 0 },
      { teamId: "C-second", poule: "C", place: 2 as const, tiebreak: 0 },
    ];
    // Same shape as the "gives each half its own dedicated ... block of
    // pleinen" test above: half size 3 each -> 2 pleinen per half + plein 1.
    expect(courtsNeededForKnockout(qualifiers)).toBe(1 + 2 + 2);

    const bracketA = buildKnockoutBracket(qualifiers);
    const bracketB = buildKnockoutBracketB(qualifiers, courtsNeededForKnockout(qualifiers));
    const courtsA = new Set(bracketA.map((m) => m.court));
    const courtsB = new Set(bracketB.map((m) => m.court));
    expect([...courtsA].every((c) => !courtsB.has(c))).toBe(true);
  });
});

// Speelt een volledige piramide helemaal uit (deterministisch: wie
// alfabetisch eerst komt "wint"), net als de meeting-tests hierboven.
function speelVolledigeBracketUit(bracket: BracketMatch[]): BracketMatch[] {
  let matches = bracket;
  for (let guard = 0; guard < 10; guard++) {
    const playable = playableMatches(matches);
    if (playable.length === 0) break;
    for (const m of playable) {
      const [a, b] = resolvedTeams(matches, m);
      const aWins = a! < b!;
      matches = matches.map((x) => (x.id === m.id ? { ...x, scoreA: aWins ? 13 : 5, scoreB: aWins ? 5 : 13 } : x));
    }
  }
  return matches;
}

describe("knockoutRanking", () => {
  it("groups 1, 2, 3-4, 5-8 for a clean 4-pool (8-qualifier) piramide", () => {
    const qualifiers = [
      { teamId: "A-first", poule: "A", place: 1 as const, tiebreak: 0 },
      { teamId: "A-second", poule: "A", place: 2 as const, tiebreak: 0 },
      { teamId: "B-first", poule: "B", place: 1 as const, tiebreak: 0 },
      { teamId: "B-second", poule: "B", place: 2 as const, tiebreak: 0 },
      { teamId: "C-first", poule: "C", place: 1 as const, tiebreak: 0 },
      { teamId: "C-second", poule: "C", place: 2 as const, tiebreak: 0 },
      { teamId: "D-first", poule: "D", place: 1 as const, tiebreak: 0 },
      { teamId: "D-second", poule: "D", place: 2 as const, tiebreak: 0 },
    ];
    const gespeeld = speelVolledigeBracketUit(buildKnockoutBracket(qualifiers));
    const groepen = knockoutRanking(gespeeld);
    expect(groepen.map((g) => [g.vanaf, g.tot])).toEqual([
      [1, 1],
      [2, 2],
      [3, 4],
      [5, 8],
    ]);
    expect(groepen[0].teamIds).toHaveLength(1);
    expect(groepen[1].teamIds).toHaveLength(1);
    expect(groepen[2].teamIds).toHaveLength(2);
    expect(groepen[3].teamIds).toHaveLength(4);
    // Alle 8 teams komen exact 1 keer voor, niemand dubbel of ontbrekend.
    const alleIds = groepen.flatMap((g) => g.teamIds);
    expect(new Set(alleIds).size).toBe(8);
    expect(alleIds).toHaveLength(8);
  });

  it("laat Piramide B verder tellen vanaf startRank, na Piramide A", () => {
    const qualifiers = [
      { teamId: "A-first", poule: "A", place: 1 as const, tiebreak: 0 },
      { teamId: "A-second", poule: "A", place: 2 as const, tiebreak: 0 },
      { teamId: "B-first", poule: "B", place: 1 as const, tiebreak: 0 },
      { teamId: "B-second", poule: "B", place: 2 as const, tiebreak: 0 },
    ];
    const gespeeld = speelVolledigeBracketUit(buildKnockoutBracket(qualifiers));
    const groepen = knockoutRanking(gespeeld, 9);
    expect(groepen.map((g) => [g.vanaf, g.tot])).toEqual([
      [9, 9],
      [10, 10],
      [11, 12],
    ]);
  });

  it("telt een bye-plek mee in de reeks, maar geeft ze geen echte verliezer", () => {
    // 3 poules => halve grootte 3, rondt af naar 4: 1 bye per helft.
    const qualifiers = [
      { teamId: "A-first", poule: "A", place: 1 as const, tiebreak: 30 },
      { teamId: "A-second", poule: "A", place: 2 as const, tiebreak: 3 },
      { teamId: "B-first", poule: "B", place: 1 as const, tiebreak: 20 },
      { teamId: "B-second", poule: "B", place: 2 as const, tiebreak: 2 },
      { teamId: "C-first", poule: "C", place: 1 as const, tiebreak: 10 },
      { teamId: "C-second", poule: "C", place: 2 as const, tiebreak: 1 },
    ];
    const gespeeld = speelVolledigeBracketUit(buildKnockoutBracket(qualifiers));
    const groepen = knockoutRanking(gespeeld);
    expect(groepen.map((g) => [g.vanaf, g.tot])).toEqual([
      [1, 1],
      [2, 2],
      [3, 4],
      [5, 8],
    ]);
    // 6 teams total: 1 + 1 + 2 + (enkel de echte verliezers, geen 4 want 2 waren bye-plekken)
    expect(groepen[3].teamIds.length).toBeLessThan(4);
    const alleIds = groepen.flatMap((g) => g.teamIds);
    expect(new Set(alleIds).size).toBe(6);
  });

  it("geeft gewoon plaats 1 en 2 bij een rechtstreekse finale zonder bracket (1 poule)", () => {
    const qualifiers = [
      { teamId: "only-first", poule: "A", place: 1 as const, tiebreak: 0 },
      { teamId: "only-second", poule: "A", place: 2 as const, tiebreak: 0 },
    ];
    const gespeeld = speelVolledigeBracketUit(buildKnockoutBracket(qualifiers));
    const groepen = knockoutRanking(gespeeld);
    expect(groepen).toEqual([
      { vanaf: 1, tot: 1, teamIds: ["only-first"] },
      { vanaf: 2, tot: 2, teamIds: ["only-second"] },
    ]);
  });
});

describe("poulesRestRanking", () => {
  // buildPouleOf4Bracket husselt zelf welk team op teamA/teamB terechtkomt,
  // dus deze uitslagen zijn bewust uitgedrukt in termen van sourceA/sourceB
  // (winnaar/verliezer van m1/m2) i.p.v. vaste teamnamen — dat blijft
  // ondubbelzinnig ongeacht de husseling, en levert exact plaats 1 t.e.m. 4
  // met respectievelijk 2, 2, 1 en 0 overwinningen op.
  function speelPouleVan4Uit(matches: BracketMatch[], prefix: string): BracketMatch[] {
    const [m1, m2] = matches;
    matches = score(matches, m1.id, 13, 5); // m1.teamA wint (1 overwinning)
    matches = score(matches, m2.id, 13, 6); // m2.teamA wint (1 overwinning)
    matches = score(matches, `${prefix}-WIN`, 13, 9); // winnaar m1 wint -> plaats 1 (2 overwinningen)
    matches = score(matches, `${prefix}-LOSS`, 13, 4); // verliezer m1 wint (1 overwinning tot nu toe)
    matches = score(matches, `${prefix}-BAR`, 4, 13); // winnaar A-LOSS wint de barrage -> plaats 2 (2 overwinningen)
    return matches;
  }

  it("geeft wie nooit een piramide bereikte alsnog een plaats, op basis van hun aantal overwinningen in de poule", () => {
    const teams = ["T1", "T2", "T3", "T4"].map(makeTeam).map((t) => ({ ...t, poule: "A" }));
    const matches = speelPouleVan4Uit(buildPouleOf4Bracket("A", teams, 1), "A");
    const qualifiers = qualifiersFromBarrageBracket(matches, "A");
    const plaats = (n: 1 | 2 | 3 | 4) => qualifiers.find((q) => q.place === n)!.teamId;

    // Plaats 1 en 2 stel je voor als al gerangschikt via Piramide A — enkel
    // plaats 3 (1 overwinning) en plaats 4 (0 overwinningen) bereikten nooit
    // een piramide, en horen dus niet samen in dezelfde reeks.
    const groepen = poulesRestRanking(teams, matches, new Set([plaats(1), plaats(2)]), 3);
    expect(groepen).toEqual([
      { vanaf: 3, tot: 3, teamIds: [plaats(3)] }, // 1 overwinning
      { vanaf: 4, tot: 4, teamIds: [plaats(4)] }, // 0 overwinningen
    ]);
  });

  it("groepeert teams uit verschillende poules samen als ze evenveel overwinningen hebben", () => {
    const teamsA = ["A1", "A2", "A3", "A4"].map(makeTeam).map((t) => ({ ...t, poule: "A" }));
    const teamsB = ["B1", "B2", "B3", "B4"].map(makeTeam).map((t) => ({ ...t, poule: "B" }));
    const matchesA = speelPouleVan4Uit(buildPouleOf4Bracket("A", teamsA, 1), "A");
    const matchesB = speelPouleVan4Uit(buildPouleOf4Bracket("B", teamsB, 5), "B");
    const alleMatches = [...matchesA, ...matchesB];
    const alleTeams = [...teamsA, ...teamsB];

    const qualifiersA = qualifiersFromBarrageBracket(matchesA, "A");
    const qualifiersB = qualifiersFromBarrageBracket(matchesB, "B");
    const plaatsA = (n: 1 | 2 | 3 | 4) => qualifiersA.find((q) => q.place === n)!.teamId;
    const plaatsB = (n: 1 | 2 | 3 | 4) => qualifiersB.find((q) => q.place === n)!.teamId;

    // Enkel plaats 1/2 van elke poule bereikte een piramide — plaats 3 van
    // beide poules (1 overwinning elk) en plaats 4 van beide (0 elk) horen
    // dus samen in dezelfde reeks.
    const gedekt = new Set([plaatsA(1), plaatsA(2), plaatsB(1), plaatsB(2)]);
    const groepen = poulesRestRanking(alleTeams, alleMatches, gedekt, 5);
    expect(groepen).toEqual([
      { vanaf: 5, tot: 6, teamIds: expect.arrayContaining([plaatsA(3), plaatsB(3)]) },
      { vanaf: 7, tot: 8, teamIds: expect.arrayContaining([plaatsA(4), plaatsB(4)]) },
    ]);
  });

  it("geeft niets terug als iedereen al een plaats heeft", () => {
    const teams = ["T1", "T2"].map(makeTeam).map((t) => ({ ...t, poule: "A" }));
    expect(poulesRestRanking(teams, [], new Set(["T1", "T2"]), 3)).toEqual([]);
  });
});
