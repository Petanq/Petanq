import { describe, expect, it } from "vitest";
import { computeMeleeStandings, computeStandings } from "./standings";
import type { Round, Team } from "./types";

function makeTeam(id: string): Team {
  return { id, number: 1, name: id, present: true, paid: false, byes: 0 };
}

describe("computeStandings", () => {
  it("awards 2 matchpunten to the winner and tracks PV/PT/saldo", () => {
    const teams = [makeTeam("A"), makeTeam("B")];
    const rounds: Round[] = [
      { number: 1, matches: [{ court: 1, teamA: "A", teamB: "B", scoreA: 13, scoreB: 7 }] },
    ];
    const [first, second] = computeStandings(teams, rounds);
    expect(first.teamId).toBe("A");
    expect(first).toMatchObject({
      gespeeld: 1,
      overwinningen: 1,
      matchpunten: 2,
      puntenVoor: 13,
      puntenTegen: 7,
      saldo: 6,
    });
    expect(second).toMatchObject({
      gespeeld: 1,
      overwinningen: 0,
      matchpunten: 0,
      puntenVoor: 7,
      puntenTegen: 13,
      saldo: -6,
    });
  });

  it("counts a BYE as an automatic 13-7 win", () => {
    const teams = [makeTeam("A")];
    const rounds: Round[] = [{ number: 1, matches: [{ court: 1, teamA: "A", teamB: null }] }];
    const [row] = computeStandings(teams, rounds);
    expect(row).toMatchObject({
      gespeeld: 1,
      overwinningen: 1,
      matchpunten: 2,
      puntenVoor: 13,
      puntenTegen: 7,
      saldo: 6,
    });
  });

  it("does not count a match whose score hasn't been entered yet", () => {
    const teams = [makeTeam("A"), makeTeam("B")];
    const rounds: Round[] = [{ number: 1, matches: [{ court: 1, teamA: "A", teamB: "B" }] }];
    const [rowA, rowB] = computeStandings(teams, rounds);
    expect(rowA.gespeeld).toBe(0);
    expect(rowB.gespeeld).toBe(0);
  });

  it("splits matchpunten evenly on a tied score", () => {
    const teams = [makeTeam("A"), makeTeam("B")];
    const rounds: Round[] = [
      { number: 1, matches: [{ court: 1, teamA: "A", teamB: "B", scoreA: 10, scoreB: 10 }] },
    ];
    const [rowA, rowB] = computeStandings(teams, rounds);
    expect(rowA.matchpunten).toBe(1);
    expect(rowB.matchpunten).toBe(1);
  });

  it("sorts by matchpunten first, then by saldo", () => {
    const teams = [makeTeam("A"), makeTeam("B"), makeTeam("C")];
    const rounds: Round[] = [
      {
        number: 1,
        matches: [
          { court: 1, teamA: "A", teamB: "B", scoreA: 13, scoreB: 1 }, // A: +12
          { court: 2, teamA: "C", teamB: "A", scoreA: 0, scoreB: 0 }, // placeholder, overwritten below
        ],
      },
    ];
    // Give C a win with a smaller margin than A's, so both have 2 matchpunten
    // but A should rank first on saldo.
    rounds[0].matches[1] = { court: 2, teamA: "C", teamB: "B", scoreA: 13, scoreB: 9 };
    const sorted = computeStandings(teams, rounds);
    expect(sorted.map((r) => r.teamId)).toEqual(["A", "C", "B"]);
  });
});

describe("computeMeleeStandings", () => {
  it("credits the match result to all three players on each side", () => {
    const players = ["S1", "P1", "F1", "S2", "P2", "F2"].map(makeTeam);
    const rounds: Round[] = [
      {
        number: 1,
        matches: [
          {
            court: 1,
            teamA: "",
            teamB: "",
            scoreA: 13,
            scoreB: 6,
            playersA: ["S1", "P1", "F1"],
            playersB: ["S2", "P2", "F2"],
          },
        ],
      },
    ];
    const rows = computeMeleeStandings(players, rounds);
    for (const id of ["S1", "P1", "F1"]) {
      const row = rows.find((r) => r.teamId === id)!;
      expect(row).toMatchObject({ gespeeld: 1, overwinningen: 1, matchpunten: 2, puntenVoor: 13, puntenTegen: 6, saldo: 7 });
    }
    for (const id of ["S2", "P2", "F2"]) {
      const row = rows.find((r) => r.teamId === id)!;
      expect(row).toMatchObject({ gespeeld: 1, overwinningen: 0, matchpunten: 0, puntenVoor: 6, puntenTegen: 13, saldo: -7 });
    }
  });

  it("does not touch a player who rested that round", () => {
    const players = ["S1", "P1", "F1", "S2", "P2", "F2", "F3"].map(makeTeam);
    const rounds: Round[] = [
      {
        number: 1,
        matches: [
          {
            court: 1,
            teamA: "",
            teamB: "",
            scoreA: 13,
            scoreB: 6,
            playersA: ["S1", "P1", "F1"],
            playersB: ["S2", "P2", "F2"],
          },
        ],
        rest: ["F3"],
      },
    ];
    const rows = computeMeleeStandings(players, rounds);
    const rested = rows.find((r) => r.teamId === "F3")!;
    expect(rested).toMatchObject({ gespeeld: 0, matchpunten: 0, puntenVoor: 0, puntenTegen: 0 });
  });

  it("accumulates across rounds even though teammates change every time", () => {
    const players = ["S1", "P1", "F1", "S2", "P2", "F2"].map(makeTeam);
    const rounds: Round[] = [
      {
        number: 1,
        matches: [
          {
            court: 1,
            teamA: "",
            teamB: "",
            scoreA: 13,
            scoreB: 6,
            playersA: ["S1", "P1", "F1"],
            playersB: ["S2", "P2", "F2"],
          },
        ],
      },
      {
        number: 2,
        matches: [
          {
            court: 1,
            teamA: "",
            teamB: "",
            scoreA: 8,
            scoreB: 13,
            playersA: ["S1", "P2", "F2"], // S1 has new teammates this round
            playersB: ["S2", "P1", "F1"],
          },
        ],
      },
    ];
    const rows = computeMeleeStandings(players, rounds);
    const s1 = rows.find((r) => r.teamId === "S1")!;
    expect(s1).toMatchObject({ gespeeld: 2, overwinningen: 1, matchpunten: 2, puntenVoor: 21, puntenTegen: 19, saldo: 2 });
  });
});
