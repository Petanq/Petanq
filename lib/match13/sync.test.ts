import { describe, expect, it } from "vitest";
import { maakSync, type OpslagUitkomst, type StandUitkomst } from "./sync";
import { defaultAppState, type AppState } from "./state";
import type { Match, Team } from "./types";

const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Nagebootste server met dezelfde regels als slaMatch13OpAsync: opslaan lukt
// enkel als de verwachte versie klopt (atomair), anders komt de serverstand terug.
class FakeServer {
  state: AppState;
  versie = 0;
  vertraging = 0;
  constructor(state: AppState) {
    this.state = state;
  }
  async slaOp(state: AppState, verwacht: number | null): Promise<OpslagUitkomst> {
    await tick(this.vertraging);
    if (verwacht === null) {
      this.state = JSON.parse(JSON.stringify(state));
      return { succes: true, versie: null };
    }
    if (verwacht !== this.versie) {
      return { succes: false, fout: "conflict", versie: this.versie, state: JSON.parse(JSON.stringify(this.state)) };
    }
    this.state = JSON.parse(JSON.stringify(state)); // jsonb: undefined-velden verdwijnen
    this.versie += 1;
    return { succes: true, versie: this.versie };
  }
  async haalStand(bekend: number): Promise<StandUitkomst> {
    await tick(this.vertraging);
    if (bekend === this.versie) return { gewijzigd: false };
    return { gewijzigd: true, versie: this.versie, state: JSON.parse(JSON.stringify(this.state)) };
  }
}

function team(n: number): Team {
  return { id: `t${n}`, number: n, name: `Team ${n}`, present: true, paid: true, byes: 0 };
}
function beginStand(): AppState {
  const matches: Match[] = [0, 1, 2, 3].map((i) => ({ court: i + 1, teamA: `t${i * 2 + 1}`, teamB: `t${i * 2 + 2}` }));
  return {
    ...defaultAppState(),
    clubName: "Test",
    teams: [1, 2, 3, 4, 5, 6, 7, 8].map(team),
    rounds: [{ number: 1, matches, startedAt: 1 }],
  };
}

function maakToestel(server: FakeServer) {
  const toestel = {
    stand: JSON.parse(JSON.stringify(server.state)) as AppState,
    mislukt: false,
    meldingen: 0,
    sync: undefined as unknown as ReturnType<typeof maakSync>,
    typScore(i: number, a: number, b: number) {
      const matches = toestel.stand.rounds[0].matches.map((m, k) => (k === i ? { ...m, scoreA: a, scoreB: b } : m));
      toestel.stand = { ...toestel.stand, rounds: [{ ...toestel.stand.rounds[0], matches }] };
    },
    score(i: number) {
      const m = toestel.stand.rounds[0].matches[i];
      return m.scoreA === undefined ? null : `${m.scoreA}-${m.scoreB}`;
    },
  };
  toestel.sync = maakSync(toestel.stand, server.versie, {
    slaOp: (s, v) => server.slaOp(s, v),
    haalStand: (v) => server.haalStand(v),
    lokaleStand: () => toestel.stand,
    zetLokaleStand: (s) => {
      toestel.stand = s;
    },
    opslaanMislukt: (m) => {
      toestel.mislukt = m;
    },
    samengevoegd: () => {
      toestel.meldingen++;
    },
  });
  return toestel;
}

describe("twee toestellen tegelijk", () => {
  it("gsm en pc voeren tegelijk een score in op verschillende wedstrijden: niets gaat verloren", async () => {
    const server = new FakeServer(beginStand());
    server.vertraging = 5;
    const gsm = maakToestel(server);
    const pc = maakToestel(server);

    gsm.typScore(0, 13, 7);
    pc.typScore(1, 13, 2);
    await Promise.all([gsm.sync.opslaan(), pc.sync.opslaan()]);

    // Het toestel dat als tweede opsloeg heeft samengevoegd; het andere ziet het bij de volgende controle.
    await gsm.sync.ververs();
    await pc.sync.ververs();
    for (const apparaat of [server.state, gsm.stand, pc.stand]) {
      const m = apparaat.rounds[0].matches;
      expect(m[0]).toMatchObject({ scoreA: 13, scoreB: 7 });
      expect(m[1]).toMatchObject({ scoreA: 13, scoreB: 2 });
    }
    expect(gsm.mislukt || pc.mislukt).toBe(false);
  });

  it("een toestel dat niets doet ziet de score van het andere vanzelf verschijnen", async () => {
    const server = new FakeServer(beginStand());
    const gsm = maakToestel(server);
    const pc = maakToestel(server);

    gsm.typScore(2, 13, 5);
    await gsm.sync.opslaan();
    expect(pc.score(2)).toBeNull();

    await pc.sync.ververs();
    expect(pc.score(2)).toBe("13-5");
    expect(pc.meldingen).toBe(1);
    // en dat leverde geen onnodige nieuwe versie op
    expect(server.versie).toBe(1);
  });

  it("een toestel met een nog niet opgeslagen score behoudt die wanneer het ververst", async () => {
    const server = new FakeServer(beginStand());
    const gsm = maakToestel(server);
    const pc = maakToestel(server);

    gsm.typScore(0, 13, 1);
    await gsm.sync.opslaan();
    pc.typScore(3, 13, 12); // nog niet opgeslagen
    await pc.sync.ververs();

    expect(pc.score(0)).toBe("13-1");
    expect(pc.score(3)).toBe("13-12");
    expect(server.state.rounds[0].matches[3]).toMatchObject({ scoreA: 13, scoreB: 12 }); // en meteen bewaard
    expect(server.state.rounds[0].matches[0]).toMatchObject({ scoreA: 13, scoreB: 1 });
  });

  it("drukte met 3 toestellen: elk eigen wedstrijden, steeds samengevoegd, nooit iets kwijt", async () => {
    const server = new FakeServer(beginStand());
    server.vertraging = 3;
    const toestellen = [maakToestel(server), maakToestel(server), maakToestel(server)];
    const werk = toestellen.map(async (t, k) => {
      const eigen = k === 0 ? [0, 1] : k === 1 ? [2] : [3];
      for (const i of eigen) {
        t.typScore(i, 13, i);
        await t.sync.opslaan();
        await tick(Math.random() * 6);
        await t.sync.ververs();
      }
    });
    await Promise.all(werk);
    for (let ronde = 0; ronde < 2; ronde++) for (const t of toestellen) await t.sync.ververs();
    for (const apparaat of [server.state, ...toestellen.map((t) => t.stand)]) {
      [0, 1, 2, 3].forEach((i) => expect(apparaat.rounds[0].matches[i]).toMatchObject({ scoreA: 13, scoreB: i }));
    }
  });

  it("typen tijdens het opslaan: de extra wijziging wordt daarna alsnog bewaard", async () => {
    const server = new FakeServer(beginStand());
    server.vertraging = 10;
    const gsm = maakToestel(server);
    gsm.typScore(0, 13, 1);
    const eerste = gsm.sync.opslaan();
    gsm.typScore(1, 13, 2); // tijdens de eerste opslag
    await gsm.sync.opslaan(); // vraagt een herhaling aan
    await eerste;
    expect(server.state.rounds[0].matches[0]).toMatchObject({ scoreA: 13, scoreB: 1 });
    expect(server.state.rounds[0].matches[1]).toMatchObject({ scoreA: 13, scoreB: 2 });
  });

  it("zonder versienummer (migratie nog niet uitgevoerd) blijft opslaan zoals voorheen en ververst niets", async () => {
    const server = new FakeServer(beginStand());
    const gsm = maakToestel(server);
    const oud = maakSync(gsm.stand, null, {
      slaOp: (s, v) => server.slaOp(s, v),
      haalStand: (v) => server.haalStand(v),
      lokaleStand: () => gsm.stand,
      zetLokaleStand: () => {},
      opslaanMislukt: () => {},
      samengevoegd: () => {},
    });
    gsm.typScore(0, 13, 9);
    await oud.opslaan();
    expect(server.state.rounds[0].matches[0]).toMatchObject({ scoreA: 13, scoreB: 9 });
    await oud.ververs(); // geen versie, dus geen controle en geen fout
    expect(server.versie).toBe(0);
  });

  it("meldt een mislukte opslag en blijft niet eindeloos herproberen", async () => {
    const server = new FakeServer(beginStand());
    const gsm = maakToestel(server);
    let pogingen = 0;
    const stuk = maakSync(gsm.stand, 0, {
      slaOp: async () => {
        pogingen++;
        return { succes: false, fout: "opslaan_mislukt" };
      },
      haalStand: (v) => server.haalStand(v),
      lokaleStand: () => gsm.stand,
      zetLokaleStand: () => {},
      opslaanMislukt: (m) => {
        gsm.mislukt = m;
      },
      samengevoegd: () => {},
    });
    gsm.typScore(0, 13, 3);
    await stuk.opslaan();
    expect(gsm.mislukt).toBe(true);
    expect(pogingen).toBe(1);
  });
});
