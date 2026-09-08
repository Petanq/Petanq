import {
  getInBehandelingToernooien,
  getBezoekStatistieken,
  getBezoekenPerProvincie,
  getBezoekenPerDag,
  getPaginaBezoekTotaal,
  getToernooiStatistieken,
  getAlleGoedgekeurdeToernooienVoorBeheer,
  getHuidigeModerator,
} from "@/lib/data";
import { isAdmin } from "@/lib/auth-helpers";
import { heeftToegangTotProvincie } from "@/lib/moderator-toegang";
import { PendingList } from "@/components/beheer/pending-list";
import { StatistiekenPaneel } from "@/components/beheer/statistieken-paneel";
import { VrijwilligerWelkom } from "@/components/beheer/vrijwilliger-welkom";

export default async function BeheerDashboardPagina() {
  const [
    toernooien,
    bezoekStatistieken,
    bezoekenPerProvincie,
    bezoekenPerDag,
    reizenPaginaBezoeken,
    toernooiStatistieken,
    goedgekeurdeToernooien,
    magAdminZien,
    huidigeModerator,
  ] = await Promise.all([
    getInBehandelingToernooien(),
    getBezoekStatistieken(),
    getBezoekenPerProvincie(),
    getBezoekenPerDag(14),
    getPaginaBezoekTotaal("/petanque-reizen"),
    getToernooiStatistieken(),
    getAlleGoedgekeurdeToernooienVoorBeheer(),
    isAdmin(),
    getHuidigeModerator(),
  ]);

  // Een gewone moderator ziet enkel toernooien uit zijn eigen provincie, tenzij
  // een admin hem toegang tot zijn hele regio (Vlaanderen, of Wallonië incl.
  // Brussel) of tot heel België gaf — zo keurt altijd de juiste persoon voor
  // de juiste regio goed.
  const toegangsniveau = magAdminZien ? "heel_belgie" : huidigeModerator?.toegangsniveau ?? "eigen_provincie";
  const zichtbareToernooien = toernooien.filter((tn) =>
    heeftToegangTotProvincie(toegangsniveau, huidigeModerator?.provincie ?? null, tn.provincie)
  );

  const eigenAantal = huidigeModerator
    ? toernooiStatistieken.perModerator.find((mod) => mod.naam === huidigeModerator.naam)?.aantal ?? 0
    : 0;

  return (
    <>
      {/* Enkel voor gewone vrijwilligers, niet voor de admin zelf. */}
      {huidigeModerator && !magAdminZien && (
        <VrijwilligerWelkom
          naam={huidigeModerator.naam}
          aangemaaktOp={huidigeModerator.aangemaakt_op}
          eigenAantal={eigenAantal}
          teamAantalDezeMaand={toernooiStatistieken.goedgekeurdDezeMaand}
        />
      )}
      <StatistiekenPaneel
        bezoeken={bezoekStatistieken}
        bezoekenPerProvincie={bezoekenPerProvincie}
        bezoekenPerDag={bezoekenPerDag}
        reizenPaginaBezoeken={reizenPaginaBezoeken}
        toernooien={toernooiStatistieken}
        isAdmin={magAdminZien}
      />
      <PendingList toernooien={zichtbareToernooien} goedgekeurdeToernooien={goedgekeurdeToernooien} />
    </>
  );
}
