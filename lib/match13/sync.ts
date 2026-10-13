import type { AppState } from "./state";
import { gelijk, voegSamen } from "./samenvoegen";

// Opslag- en synchronisatielogica van één toestel, los van React zodat ze met
// een nagebootste server getest kan worden (zie sync.test.ts).
//
// Een toestel onthoudt de stand + het versienummer waarvan het vertrok
// (`basis`/`versie`). Opslaan lukt enkel als die versie op de server nog
// dezelfde is; anders voegt het toestel zijn wijzigingen samen met die van het
// andere toestel en slaat het het samengevoegde resultaat op.

export type OpslagUitkomst =
  | { succes: true; versie: number | null }
  | { succes: false; fout: "conflict"; versie: number; state: AppState }
  | { succes: false; fout: "niet_geautoriseerd" | "opslaan_mislukt" };

export type StandUitkomst = { gewijzigd: false } | { gewijzigd: true; versie: number; state: AppState };

export interface SyncAfhankelijkheden {
  /** Slaat op bij de server, met de versie waarvan we vertrokken (null = zonder versiecontrole). */
  slaOp(state: AppState, verwachteVersie: number | null): Promise<OpslagUitkomst>;
  /** Vraagt de server of er een nieuwere versie dan `bekend` is. */
  haalStand(bekendeVersie: number): Promise<StandUitkomst>;
  /** De huidige lokale stand (inclusief wijzigingen die nog niet opgeslagen zijn). */
  lokaleStand(): AppState;
  /** Vervangt de lokale stand (na samenvoegen). */
  zetLokaleStand(state: AppState): void;
  /** Opslaan gelukt (false) of mislukt (true). */
  opslaanMislukt(mislukt: boolean): void;
  /** Er zijn wijzigingen van een ander toestel verwerkt. */
  samengevoegd(): void;
}

export function maakSync(beginStand: AppState, beginVersie: number | null, deps: SyncAfhankelijkheden) {
  let basis = beginStand;
  let versie = beginVersie;
  let bezig = false;
  let opnieuw = false;

  // Neemt een nieuwere serverstand over en voegt er de eigen, nog niet
  // opgeslagen wijzigingen bij. Geeft terug of er daarna nog iets op te slaan valt.
  function pasServerStandToe(serverState: AppState, serverVersie: number): boolean {
    const lokaal = deps.lokaleStand();
    const samen = voegSamen(basis, lokaal, serverState) as AppState;
    basis = serverState;
    versie = serverVersie;
    if (!gelijk(samen, lokaal)) {
      deps.zetLokaleStand(samen);
      deps.samengevoegd();
    }
    return !gelijk(samen, serverState);
  }

  async function opslaan(): Promise<void> {
    if (bezig) {
      opnieuw = true;
      return;
    }
    bezig = true;
    try {
      do {
        opnieuw = false;
        const teBewaren = deps.lokaleStand();
        const vertrekVersie = versie;
        if (vertrekVersie !== null && gelijk(teBewaren, basis)) break; // niets nieuws om op te slaan
        let uitkomst: OpslagUitkomst;
        try {
          uitkomst = await deps.slaOp(teBewaren, vertrekVersie);
        } catch {
          deps.opslaanMislukt(true);
          break;
        }
        if (uitkomst.succes) {
          deps.opslaanMislukt(false);
          basis = teBewaren;
          versie = uitkomst.versie;
        } else if (uitkomst.fout === "conflict") {
          if (pasServerStandToe(uitkomst.state, uitkomst.versie)) opnieuw = true;
        } else {
          deps.opslaanMislukt(true);
          break;
        }
      } while (opnieuw);
    } finally {
      bezig = false;
    }
  }

  /** Eén controle op wijzigingen van een ander toestel; slaat zo nodig het samengevoegde resultaat op. */
  async function ververs(): Promise<void> {
    const bekend = versie;
    if (bezig || bekend === null) return;
    try {
      const nieuw = await deps.haalStand(bekend);
      if (!nieuw.gewijzigd) return;
      // Ondertussen zelf opgeslagen of al ververst? Dan is dit antwoord verouderd.
      if (bezig || versie !== bekend) return;
      if (pasServerStandToe(nieuw.state, nieuw.versie)) await opslaan();
    } catch {
      // Tijdelijk geen verbinding: volgende ronde opnieuw proberen.
    }
  }

  return {
    opslaan,
    ververs,
    get versie() {
      return versie;
    },
    get basis() {
      return basis;
    },
  };
}
