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

  // Een gewone moderator ziet enkel toernooien binnen het toegangsgebied dat
  // een admin hem rechtstreeks gaf (een specifieke provincie, zijn regio, of
  // heel België) — zo keurt altijd de juiste persoon voor het juiste gebied
  // goed. Zonder gekende moderator-rij (zou niet mogen voorkomen voor een
  // ingelogde moderator) toont niets, uit voorzorg.
  const zichtbareToernooien =
    magAdminZien || huidigeModerator
      ? toernooien.filter((tn) =>
          magAdminZien ? true : heeftToegangTotProvincie(huidigeModerator!.toegang_scope, tn.provincie)
        )
      : [];

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
