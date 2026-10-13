import { describe, expect, it } from "vitest";
import { gelijk, voegSamen } from "./samenvoegen";
import { defaultAppState, type AppState } from "./state";
import type { Match, Team } from "./types";

function team(n: number): Team {
  return { id: `t${n}`, number: n, name: `Team ${n}`, present: true, paid: true, byes: 0 };
}

function basisStand(): AppState {
  const matches: Match[] = [
    { court: 1, teamA: "t1", teamB: "t2" },
    { court: 2, teamA: "t3", teamB: "t4" },
    { court: 3, teamA: "t5", teamB: "t6" },
  ];
  return {
    ...defaultAppState(),
    clubName: "Test",
    teams: [1, 2, 3, 4, 5, 6].map(team),
    rounds: [{ number: 1, matches, startedAt: 1 }],
  };
}

function metScore(s: AppState, idx: number, a: number, b: number): AppState {
  const matches = s.rounds[0].matches.map((m, i) => (i === idx ? { ...m, scoreA: a, scoreB: b } : m));
  return { ...s, rounds: [{ ...s.rounds[0], matches }, ...s.rounds.slice(1)] };
}

describe("gelijk", () => {
  it("negeert sleutelvolgorde en undefined-velden", () => {
    expect(gelijk({ a: 1, b: { c: 2 } }, { b: { c: 2 }, a: 1, d: undefined })).toBe(true);
    expect(gelijk({ a: 1 }, { a: 2 })).toBe(false);
    expect(gelijk([1, 2], [1, 2, 3])).toBe(false);
  });
});

describe("voegSamen", () => {
  it("behoudt scores die gsm en pc op verschillende wedstrijden invoerden", () => {
    const basis = basisStand();
    const gsm = metScore(basis, 0, 13, 7);
    const pc = metScore(basis, 1, 13, 2);
    const samen = voegSamen(basis, gsm, pc) as AppState;
    expect(samen.rounds[0].matches[0]).toMatchObject({ scoreA: 13, scoreB: 7 });
    expect(samen.rounds[0].matches[1]).toMatchObject({ scoreA: 13, scoreB: 2 });
    expect(samen.rounds[0].matches[2].scoreA).toBeUndefined();
  });

  it("is hetzelfde in beide richtingen voor niet-botsende wijzigingen", () => {
    const basis = basisStand();
    const gsm = metScore(basis, 0, 13, 7);
    const pc = metScore(basis, 2, 11, 13);
    expect(gelijk(voegSamen(basis, gsm, pc), voegSamen(basis, pc, gsm))).toBe(true);
  });

  it("bij dezelfde score op beide toestellen wint het toestel dat nu opslaat, enkel voor dat veld", () => {
    const basis = basisStand();
    const gsm = metScore(basis, 0, 13, 7);
    const pc = metScore(metScore(basis, 0, 13, 9), 1, 13, 1);
    const samen = voegSamen(basis, gsm, pc) as AppState;
    expect(samen.rounds[0].matches[0]).toMatchObject({ scoreA: 13, scoreB: 7 }); // mijn (gsm)
    expect(samen.rounds[0].matches[1]).toMatchObject({ scoreA: 13, scoreB: 1 }); // andere wedstrijd blijft staan
  });

  it("voegt teams toe die beide toestellen tegelijk aanmaken", () => {
    const basis = basisStand();
    const gsm = { ...basis, teams: [...basis.teams, team(7)] };
    const pc = { ...basis, teams: [...basis.teams, team(8)] };
    const samen = voegSamen(basis, gsm, pc) as AppState;
    expect(samen.teams.map((t) => t.id).sort()).toEqual(["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"]);
  });

  it("past een team aan op het ene toestel en voegt er een toe op het andere", () => {
    const basis = basisStand();
    const gsm = { ...basis, teams: basis.teams.map((t) => (t.id === "t2" ? { ...t, paid: false } : t)) };
    const pc = { ...basis, teams: [...basis.teams, team(7)] };
    const samen = voegSamen(basis, gsm, pc) as AppState;
    expect(samen.teams).toHaveLength(7);
    expect(samen.teams.find((t) => t.id === "t2")!.paid).toBe(false);
  });

  it("laat een door het ene toestel verwijderd team verdwijnen als het andere het niet aanraakte", () => {
    const basis = basisStand();
    const gsm = { ...basis, teams: basis.teams.filter((t) => t.id !== "t6") };
    const pc = metScore(basis, 0, 13, 4);
    const samen = voegSamen(basis, gsm, pc) as AppState;
    expect(samen.teams.map((t) => t.id)).not.toContain("t6");
    expect(samen.rounds[0].matches[0].scoreA).toBe(13);
  });

  it("houdt een team dat verwijderd werd terwijl het andere toestel het aanpaste", () => {
    const basis = basisStand();
    const gsm = { ...basis, teams: basis.teams.filter((t) => t.id !== "t6") };
    const pc = { ...basis, teams: basis.teams.map((t) => (t.id === "t6" ? { ...t, name: "Nieuw" } : t)) };
    const samen = voegSamen(basis, gsm, pc) as AppState;
    expect(samen.teams.find((t) => t.id === "t6")?.name).toBe("Nieuw");
  });

  it("bij twee tegelijk gemaakte rondes wint de ronde van de server", () => {
    const basis = basisStand();
    const rondeMijn = { number: 2, matches: [{ court: 1, teamA: "t1", teamB: "t3" }] };
    const rondeHunne = { number: 2, matches: [{ court: 1, teamA: "t1", teamB: "t5" }] };
    const gsm = { ...basis, rounds: [...basis.rounds, rondeMijn] };
    const pc = { ...basis, rounds: [...basis.rounds, rondeHunne] };
    const samen = voegSamen(basis, gsm, pc) as AppState;
    expect(samen.rounds).toHaveLength(2);
    expect(samen.rounds[1].matches[0].teamB).toBe("t5");
  });

  it("neemt een ronde over die het andere toestel maakte terwijl ik een score invoerde", () => {
    const basis = basisStand();
    const gsm = metScore(basis, 0, 13, 7);
    const pc = { ...basis, rounds: [...basis.rounds, { number: 2, matches: [{ court: 1, teamA: "t1", teamB: "t3" }] }] };
    const samen = voegSamen(basis, gsm, pc) as AppState;
    expect(samen.rounds).toHaveLength(2);
    expect(samen.rounds[0].matches[0].scoreA).toBe(13);
  });

  it("verandert niets als niemand iets wijzigde of enkel de ander wijzigde", () => {
    const basis = basisStand();
    const pc = metScore(basis, 1, 13, 5);
    expect(gelijk(voegSamen(basis, basis, pc), pc)).toBe(true);
    expect(gelijk(voegSamen(basis, pc, basis), pc)).toBe(true);
    expect(gelijk(voegSamen(basis, basis, basis), basis)).toBe(true);
  });
});
