import { describe, expect, it } from "vitest";
import {
  assignKwartetRoles,
  assignSextetRoles,
  buildCourtHistory,
  buildMeleeHistory,
  buildOpponentHistory,
  generateMeleeRound,
  generateRankedRound,
  generateRound,
} from "./draw";
import type { Match, Role, Round, Team } from "./types";

function makeTeam(id: string, byes = 0): Team {
  return { id, number: 1, name: id, present: true, paid: false, byes };
}

function makePlayer(id: string, role: Role, byes = 0): Team {
  return { id, number: 1, name: id, present: true, paid: false, byes, role };
}

function conflictScore(matches: { teamA: string; teamB: string | null }[], history: Map<string, number>) {
  const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  return matches.reduce((sum, m) => {
    if (!m.teamB) return sum;
    return sum + (history.get(key(m.teamA, m.teamB)) ?? 0);
  }, 0);
}

describe("buildOpponentHistory", () => {
  it("counts each played pair once and ignores BYE rows", () => {
    const rounds: Round[] = [
      { number: 1, matches: [{ court: 1, teamA: "A", teamB: "B" }, { court: 2, teamA: "C", teamB: null }] },
      { number: 2, matches: [{ court: 1, teamA: "A", teamB: "B" }] },
    ];
    const history = buildOpponentHistory(rounds);
    expect(history.get("A|B")).toBe(2);
    expect(history.has("C|B")).toBe(false);
  });
});

describe("buildCourtHistory", () => {
  it("counts each team's court once and ignores BYE and Meli-Melo rows", () => {
    const rounds: Round[] = [
      {
        number: 1,
        matches: [
          { court: 1, teamA: "A", teamB: "B" },
          { court: 2, teamA: "C", teamB: null }, // BYE — must not count as "C played court 2"
          { court: 3, teamA: "", teamB: "", playersA: ["p1"], playersB: ["p2"] }, // Meli-Melo — no team ids
        ],
      },
    ];
    const history = buildCourtHistory(rounds);
    expect(history.get("A|1")).toBe(1);
    expect(history.get("B|1")).toBe(1);
    expect(history.has("C|2")).toBe(false);
  });
});

describe("court rotation", () => {
  const equalRank = () => ({ matchpunten: 0, saldo: 0 });

  it("avoids sending a team back to a court it already played on, when a swap fixes it", () => {
    const teams = ["A", "B", "C", "D"].map((id) => makeTeam(id));
    // A already played court 1 (against some other, unrelated team) and C
    // already played court 2 — the naive court-1/court-2 assignment for
    // this round's (A,B) and (C,D) pairing would repeat both, but swapping
    // the two courts avoids it entirely.
    const priorRounds: Round[] = [
      {
        number: 1,
        matches: [
          { court: 1, teamA: "A", teamB: "X" },
          { court: 2, teamA: "C", teamB: "Y" },
        ],
      },
    ];
    const courtHistory = buildCourtHistory(priorRounds);

    const { matches } = generateRankedRound(2, teams, new Map(), equalRank, courtHistory);
    const courtOf = (id: string) => matches.find((m) => m.teamA === id || m.teamB === id)!.court;
    expect(courtOf("A")).toBe(2);
    expect(courtOf("C")).toBe(1);
  });

  it("defaults to plain 1..N court numbers when no court history is passed", () => {
    const teams = ["A", "B", "C", "D"].map((id) => makeTeam(id));
    const { matches } = generateRound(1, teams, new Map());
    expect(matches.map((m) => m.court).sort()).toEqual([1, 2]);
  });
});

describe("generateRound", () => {
  it("pairs every team exactly once with no BYE for an even count", () => {
    const teams = ["A", "B", "C", "D"].map((id) => makeTeam(id));
    const { matches, byeTeamId } = generateRound(1, teams, new Map());
    expect(byeTeamId).toBeNull();
    expect(matches).toHaveLength(2);
    const involved = matches.flatMap((m) => [m.teamA, m.teamB]);
    expect(new Set(involved)).toEqual(new Set(["A", "B", "C", "D"]));
  });

  it("gives exactly one BYE for an odd count and pairs the rest", () => {
    const teams = ["A", "B", "C", "D", "E"].map((id) => makeTeam(id));
    const { matches, byeTeamId } = generateRound(1, teams, new Map());
    expect(byeTeamId).not.toBeNull();
    const byeMatches = matches.filter((m) => m.teamB === null);
    expect(byeMatches).toHaveLength(1);
    expect(byeMatches[0].teamA).toBe(byeTeamId);
    expect(matches.filter((m) => m.teamB !== null)).toHaveLength(2);
  });

  it("finds a zero-conflict draw when one exists", () => {
    // A played B already, C played D already — the only conflict-free
    // pairing left is {A,C or A,D} / {B, the other}.
    const teams = ["A", "B", "C", "D"].map((id) => makeTeam(id));
    const history = new Map([
      ["A|B", 1],
      ["C|D", 1],
    ]);
    const { matches } = generateRound(2, teams, history);
    expect(conflictScore(matches, history)).toBe(0);
  });

  it("rotates the BYE fairly across many rounds instead of always picking the same team", () => {
    let teams = ["A", "B", "C", "D", "E"].map((id) => makeTeam(id));
    let history = new Map<string, number>();
    const byeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    for (let round = 1; round <= 10; round++) {
      const { matches, byeTeamId } = generateRound(round, teams, history);
      if (byeTeamId) {
        byeCounts[byeTeamId] += 1;
        teams = teams.map((t) => (t.id === byeTeamId ? { ...t, byes: t.byes + 1 } : t));
      }
      const priorRounds: Round[] = [{ number: round, matches }];
      const roundHistory = buildOpponentHistory(priorRounds);
      roundHistory.forEach((count, key) => history.set(key, (history.get(key) ?? 0) + count));
    }

    const counts = Object.values(byeCounts);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
  });

  it("handles the smallest possible round: two teams, no BYE", () => {
    const teams = ["A", "B"].map((id) => makeTeam(id));
    const { matches, byeTeamId } = generateRound(1, teams, new Map());
    expect(byeTeamId).toBeNull();
    expect(matches).toEqual([{ court: 1, teamA: matches[0].teamA, teamB: matches[0].teamB }]);
    expect(new Set([matches[0].teamA, matches[0].teamB])).toEqual(new Set(["A", "B"]));
  });
});

describe("generateRankedRound", () => {
  const rankTable: Record<string, { matchpunten: number; saldo: number }> = {
    A: { matchpunten: 4, saldo: 20 },
    B: { matchpunten: 4, saldo: 5 },
    C: { matchpunten: 2, saldo: 0 },
    D: { matchpunten: 0, saldo: -10 },
  };
  const rankOf = (id: string) => rankTable[id];

  it("pairs 1st vs 2nd and 3rd vs 4th when there is no repeat to avoid", () => {
    const teams = ["A", "B", "C", "D"].map((id) => makeTeam(id));
    const { matches } = generateRankedRound(2, teams, new Map(), rankOf);
    const pairs = matches.map((m) => new Set([m.teamA, m.teamB]));
    expect(pairs).toContainEqual(new Set(["A", "B"]));
    expect(pairs).toContainEqual(new Set(["C", "D"]));
  });

  it("swaps away from a strict rank pairing to avoid a repeat opponent", () => {
    const teams = ["A", "B", "C", "D"].map((id) => makeTeam(id));
    // A and B (the top two) already played each other — a strict 1v2 pairing
    // would force a rematch even though a conflict-free option exists.
    const history = new Map([["A|B", 1]]);
    const { matches } = generateRankedRound(2, teams, history, rankOf);
    expect(conflictScore(matches, history)).toBe(0);
  });

  it("gives the BYE to the lowest-ranked team among those with the fewest byes", () => {
    const teams = ["A", "B", "C"].map((id) => makeTeam(id));
    const { byeTeamId } = generateRankedRound(2, teams, new Map(), rankOf);
    expect(byeTeamId).toBe("C"); // C is ranked last among A/B/C
  });
});

describe("generateMeleeRound", () => {
  function sixPlayers() {
    return [
      makePlayer("S1", "schutter"),
      makePlayer("S2", "schutter"),
      makePlayer("P1", "pointeur"),
      makePlayer("P2", "pointeur"),
      makePlayer("F1", "flex"),
      makePlayer("F2", "flex"),
    ];
  }

  it("forms exactly one match of two triplets from 6 players, nobody resting", () => {
    const { matches, restIds } = generateMeleeRound(1, sixPlayers(), buildMeleeHistory([]));
    expect(matches).toHaveLength(1);
    expect(restIds).toHaveLength(0);
    expect(matches[0].playersA).toHaveLength(3);
    expect(matches[0].playersB).toHaveLength(3);
    const everyone = [...matches[0].playersA!, ...matches[0].playersB!];
    expect(new Set(everyone)).toEqual(new Set(["S1", "S2", "P1", "P2", "F1", "F2"]));
  });

  it("gives every triplet exactly one schutter and one pointeur", () => {
    const { matches } = generateMeleeRound(1, sixPlayers(), buildMeleeHistory([]));
    const schutterCount = (side: string[]) => side.filter((id) => id.startsWith("S")).length;
    const pointeurCount = (side: string[]) => side.filter((id) => id.startsWith("P")).length;
    expect(schutterCount(matches[0].playersA!)).toBe(1);
    expect(schutterCount(matches[0].playersB!)).toBe(1);
    expect(pointeurCount(matches[0].playersA!)).toBe(1);
    expect(pointeurCount(matches[0].playersB!)).toBe(1);
  });

  it("rests the leftover players when the count isn't a multiple of six", () => {
    const players = [...sixPlayers(), makePlayer("F3", "flex")]; // 7 present
    const { matches, restIds } = generateMeleeRound(1, players, buildMeleeHistory([]));
    expect(matches).toHaveLength(1);
    expect(restIds).toHaveLength(1);
  });

  it("only rests a player from a role that actually has surplus that round", () => {
    // Exactly 2 schutters and 2 pointeurs (both at exact quota for 1 match)
    // but 3 flex players — the odd one out must be a flex player, never a
    // schutter or pointeur, or the match would end up missing a role.
    const players = [...sixPlayers(), makePlayer("F3", "flex")];
    const { matches, restIds } = generateMeleeRound(1, players, buildMeleeHistory([]));
    expect(restIds).toHaveLength(1);
    expect(restIds[0].startsWith("F")).toBe(true); // must be one of the 3 flex players, never S/P
    const schutterCount = (side: string[]) => side.filter((id) => id.startsWith("S")).length;
    const pointeurCount = (side: string[]) => side.filter((id) => id.startsWith("P")).length;
    expect(schutterCount(matches[0].playersA!)).toBe(1);
    expect(schutterCount(matches[0].playersB!)).toBe(1);
    expect(pointeurCount(matches[0].playersA!)).toBe(1);
    expect(pointeurCount(matches[0].playersB!)).toBe(1);
  });

  it("forms a 2-vs-3 match instead of resting everyone when only 5 are present", () => {
    const players = sixPlayers().slice(0, 5);
    const { matches, restIds } = generateMeleeRound(1, players, buildMeleeHistory([]));
    expect(restIds).toHaveLength(0);
    expect(matches).toHaveLength(1);
    const sizes = [matches[0].playersA!.length, matches[0].playersB!.length].sort();
    expect(sizes).toEqual([2, 3]);
    const everyone = [...matches[0].playersA!, ...matches[0].playersB!];
    expect(everyone).toHaveLength(5);
  });

  it("forms one 2-vs-2 match instead of resting everyone when only 4 are present", () => {
    const players = sixPlayers().slice(0, 4);
    const { matches, restIds } = generateMeleeRound(1, players, buildMeleeHistory([]));
    expect(restIds).toHaveLength(0);
    expect(matches).toHaveLength(1);
    expect(matches[0].playersA).toHaveLength(2);
    expect(matches[0].playersB).toHaveLength(2);
  });

  it("still rests everyone when fewer than four are present — no valid match exists at all", () => {
    const players = sixPlayers().slice(0, 3);
    const { matches, restIds } = generateMeleeRound(1, players, buildMeleeHistory([]));
    expect(matches).toHaveLength(0);
    expect(restIds).toHaveLength(3);
  });

  it("rests as few players as mathematically unavoidable — 7 present has no zero-rest split", () => {
    // 7 can't be written as any combination of 4s/5s/6s, so exactly 1 must
    // rest (falling back to a clean single 3v3 match for the other 6).
    const players = [...sixPlayers(), makePlayer("F3", "flex")];
    const { matches, restIds } = generateMeleeRound(1, players, buildMeleeHistory([]));
    expect(restIds).toHaveLength(1);
    expect(matches).toHaveLength(1);
    expect(matches[0].playersA).toHaveLength(3);
    expect(matches[0].playersB).toHaveLength(3);
  });

  it("with 13 present, splits into a 2v3 and two 2v2 matches rather than resting one player", () => {
    // 13 has no combination that keeps even a single 3v3 — the only
    // zero-rest split is one 2v3 (5) plus two 2v2s (4+4) = 13.
    const players = Array.from({ length: 13 }, (_, i) => makePlayer(`P${i}`, "flex"));
    const { matches, restIds } = generateMeleeRound(1, players, buildMeleeHistory([]));
    expect(restIds).toHaveLength(0);
    expect(matches).toHaveLength(3);
    const sizes = matches.map((m) => m.playersA!.length + m.playersB!.length).sort();
    expect(sizes).toEqual([4, 4, 5]);
    const everyone = matches.flatMap((m) => [...m.playersA!, ...m.playersB!]);
    expect(new Set(everyone).size).toBe(13);
  });

  it("still gives a 2-player side exactly one schutter and one pointeur, best-effort", () => {
    const players = sixPlayers().slice(0, 4); // 2 schutters, 2 pointeurs, forms one 2v2
    const { matches } = generateMeleeRound(1, players, buildMeleeHistory([]));
    const schutterCount = (side: string[]) => side.filter((id) => id.startsWith("S")).length;
    const pointeurCount = (side: string[]) => side.filter((id) => id.startsWith("P")).length;
    expect(schutterCount(matches[0].playersA!)).toBe(1);
    expect(schutterCount(matches[0].playersB!)).toBe(1);
    expect(pointeurCount(matches[0].playersA!)).toBe(1);
    expect(pointeurCount(matches[0].playersB!)).toBe(1);
  });

  it("redistributes a surplus role into the flex slot instead of dropping players", () => {
    // 3 schutters, 1 pointeur, 2 flex — the extra schutter has to fill a flex slot.
    const players = [
      makePlayer("S1", "schutter"),
      makePlayer("S2", "schutter"),
      makePlayer("S3", "schutter"),
      makePlayer("P1", "pointeur"),
      makePlayer("F1", "flex"),
      makePlayer("F2", "flex"),
    ];
    const { matches, restIds } = generateMeleeRound(1, players, buildMeleeHistory([]));
    expect(restIds).toHaveLength(0);
    const everyone = [...matches[0].playersA!, ...matches[0].playersB!];
    expect(new Set(everyone)).toEqual(new Set(["S1", "S2", "S3", "P1", "F1", "F2"]));
  });

  it("reduces conflicts round over round when a fresh grouping is available", () => {
    // With 12 players (2 matches at once) there's real freedom to avoid a
    // repeat — verify the round-2 conflict score is strictly lower than
    // forcing the exact same grouping as round 1 would have been.
    const players = [
      ...["S1", "S2", "S3", "S4"].map((id) => makePlayer(id, "schutter")),
      ...["P1", "P2", "P3", "P4"].map((id) => makePlayer(id, "pointeur")),
      ...["F1", "F2", "F3", "F4"].map((id) => makePlayer(id, "flex")),
    ];
    const firstRound = generateMeleeRound(1, players, buildMeleeHistory([]));
    const rounds: Round[] = [{ number: 1, matches: firstRound.matches }];
    const history = buildMeleeHistory(rounds);

    const identicalRepeatScore = firstRound.matches.reduce((sum, m) => {
      const sides = [m.playersA!, m.playersB!];
      let s = 0;
      for (const side of sides) {
        for (let i = 0; i < side.length; i++) {
          for (let j = i + 1; j < side.length; j++) s += 100;
        }
      }
      s += m.playersA!.length * m.playersB!.length;
      return sum + s;
    }, 0);

    const { matches } = generateMeleeRound(2, players, history);
    let round2Score = 0;
    for (const m of matches) {
      const sides = [m.playersA!, m.playersB!];
      for (const side of sides) {
        for (let i = 0; i < side.length; i++) {
          for (let j = i + 1; j < side.length; j++) {
            round2Score += (history.teammate.get([side[i], side[j]].sort().join("|")) ?? 0) * 100;
          }
        }
      }
      for (const a of m.playersA!) {
        for (const b of m.playersB!) {
          round2Score += history.opponent.get([a, b].sort().join("|")) ?? 0;
        }
      }
    }
    expect(round2Score).toBeLessThan(identicalRepeatScore);
  });

  it("still produces a valid role composition even when every pairing has already happened", () => {
    const players = sixPlayers();
    // Saturate history: every one of the 15 possible pairs already met, so a
    // conflict-free round is impossible — the engine must still return a
    // structurally valid (1 schutter + 1 pointeur + 1 flex per side) result.
    const ids = players.map((p) => p.id);
    const teammate = new Map<string, number>();
    const opponent = new Map<string, number>();
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const k = [ids[i], ids[j]].sort().join("|");
        teammate.set(k, 1);
        opponent.set(k, 1);
      }
    }

    const { matches, restIds } = generateMeleeRound(2, players, { teammate, opponent });
    expect(restIds).toHaveLength(0);
    expect(matches).toHaveLength(1);
    const schutterCount = (side: string[]) => side.filter((id) => id.startsWith("S")).length;
    const pointeurCount = (side: string[]) => side.filter((id) => id.startsWith("P")).length;
    expect(schutterCount(matches[0].playersA!)).toBe(1);
    expect(schutterCount(matches[0].playersB!)).toBe(1);
    expect(pointeurCount(matches[0].playersA!)).toBe(1);
    expect(pointeurCount(matches[0].playersB!)).toBe(1);
  });
});

describe("assignKwartetRoles", () => {
  function makeKwartetTeam(id: string, members: string[], kwartetAlleenIndex = 0): Team {
    return { id, number: 1, name: members.join(" & "), present: true, paid: false, byes: 0, members, kwartetAlleenIndex };
  }

  it("picks the player at kwartetAlleenIndex as the solo player for each side", () => {
    const teamA = makeKwartetTeam("A", ["A1", "A2", "A3", "A4"], 0);
    const teamB = makeKwartetTeam("B", ["B1", "B2", "B3", "B4"], 2);
    const matches: Match[] = [{ court: 1, teamA: "A", teamB: "B" }];

    const { matches: result } = assignKwartetRoles(matches, [teamA, teamB]);

    expect(result[0].alleenNaamA).toBe("A1");
    expect(result[0].alleenNaamB).toBe("B3");
    expect(result[0].alleenLetterA).toBe("A");
    expect(result[0].alleenLetterB).toBe("C");
  });

  it("gives the triplet its own plein, offset past every match's enkelspel plein", () => {
    const teamA = makeKwartetTeam("A", ["A1", "A2", "A3", "A4"]);
    const teamB = makeKwartetTeam("B", ["B1", "B2", "B3", "B4"]);
    const teamC = makeKwartetTeam("C", ["C1", "C2", "C3", "C4"]);
    const teamD = makeKwartetTeam("D", ["D1", "D2", "D3", "D4"]);
    const matches: Match[] = [
      { court: 1, teamA: "A", teamB: "B" },
      { court: 2, teamA: "C", teamB: "D" },
    ];

    const { matches: result } = assignKwartetRoles(matches, [teamA, teamB, teamC, teamD]);

    expect(result[0].courtTriplet).toBe(3); // 1 + 2 speelbare wedstrijden
    expect(result[1].courtTriplet).toBe(4);
  });

  it("advances each involved team's index by 1, wrapping 3 back to 0", () => {
    const teamA = makeKwartetTeam("A", ["A1", "A2", "A3", "A4"], 1);
    const teamB = makeKwartetTeam("B", ["B1", "B2", "B3", "B4"], 3);
    const matches: Match[] = [{ court: 1, teamA: "A", teamB: "B" }];

    const { alleenIndexUpdates } = assignKwartetRoles(matches, [teamA, teamB]);

    expect(alleenIndexUpdates.get("A")).toBe(2);
    expect(alleenIndexUpdates.get("B")).toBe(0); // wraps around
  });

  it("leaves a BYE match untouched — no solo assignment, no index update", () => {
    const teamA = makeKwartetTeam("A", ["A1", "A2", "A3", "A4"], 0);
    const matches: Match[] = [{ court: 1, teamA: "A", teamB: null }];

    const { matches: result, alleenIndexUpdates } = assignKwartetRoles(matches, [teamA]);

    expect(result[0].alleenNaamA).toBeUndefined();
    expect(alleenIndexUpdates.size).toBe(0);
  });
});

describe("assignSextetRoles", () => {
  function makeSextetTeam(id: string, members: string[], kwartetAlleenIndex = 0): Team {
    return { id, number: 1, name: members.join(" & "), present: true, paid: false, byes: 0, members, kwartetAlleenIndex };
  }

  it("picks the player at kwartetAlleenIndex as the solo player, wrapping at 6", () => {
    const teamA = makeSextetTeam("A", ["A1", "A2", "A3", "A4", "A5", "A6"], 5);
    const teamB = makeSextetTeam("B", ["B1", "B2", "B3", "B4", "B5", "B6"], 0);
    const matches: Match[] = [{ court: 1, teamA: "A", teamB: "B" }];

    const { matches: result, alleenIndexUpdates } = assignSextetRoles(matches, [teamA, teamB]);

    expect(result[0].alleenNaamA).toBe("A6");
    expect(result[0].alleenLetterA).toBe("F");
    expect(result[0].kwsSoort).toBe("sextet");
    expect(alleenIndexUpdates.get("A")).toBe(0); // wraps around past F
    expect(alleenIndexUpdates.get("B")).toBe(1);
  });

  it("gives the dubbel and triplet their own pleinen, stacked past the enkelspel pleinen", () => {
    const teamA = makeSextetTeam("A", ["A1", "A2", "A3", "A4", "A5", "A6"]);
    const teamB = makeSextetTeam("B", ["B1", "B2", "B3", "B4", "B5", "B6"]);
    const teamC = makeSextetTeam("C", ["C1", "C2", "C3", "C4", "C5", "C6"]);
    const teamD = makeSextetTeam("D", ["D1", "D2", "D3", "D4", "D5", "D6"]);
    const matches: Match[] = [
      { court: 1, teamA: "A", teamB: "B" },
      { court: 2, teamA: "C", teamB: "D" },
    ];

    const { matches: result } = assignSextetRoles(matches, [teamA, teamB, teamC, teamD]);

    expect(result[0].courtDoublet).toBe(3); // 1 + 2 speelbare wedstrijden
    expect(result[0].courtTriplet).toBe(5); // 1 + 2 * 2 speelbare wedstrijden
    expect(result[1].courtDoublet).toBe(4);
    expect(result[1].courtTriplet).toBe(6);
  });

  it("leaves a BYE match untouched", () => {
    const teamA = makeSextetTeam("A", ["A1", "A2", "A3", "A4", "A5", "A6"]);
    const matches: Match[] = [{ court: 1, teamA: "A", teamB: null }];

    const { matches: result, alleenIndexUpdates } = assignSextetRoles(matches, [teamA]);

    expect(result[0].alleenNaamA).toBeUndefined();
    expect(alleenIndexUpdates.size).toBe(0);
  });
});
