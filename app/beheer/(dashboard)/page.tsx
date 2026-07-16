import {
  getInBehandelingToernooien,
  getBezoekStatistieken,
  getBezoekenPerProvincie,
  getPaginaBezoekTotaal,
  getToernooiStatistieken,
  getAlleGoedgekeurdeToernooienVoorBeheer,
  getHuidigeModerator,
} from "@/lib/data";
import { isAdmin } from "@/lib/auth-helpers";
import { PendingList } from "@/components/beheer/pending-list";
import { StatistiekenPaneel } from "@/components/beheer/statistieken-paneel";

export default async function BeheerDashboardPagina() {
  const [
    toernooien,
    bezoekStatistieken,
    bezoekenPerProvincie,
    reizenPaginaBezoeken,
    toernooiStatistieken,
    goedgekeurdeToernooien,
    magAdminZien,
    huidigeModerator,
  ] = await Promise.all([
    getInBehandelingToernooien(),
    getBezoekStatistieken(),
    getBezoekenPerProvincie(),
    getPaginaBezoekTotaal("/petanque-reizen"),
    getToernooiStatistieken(),
    getAlleGoedgekeurdeToernooienVoorBeheer(),
    isAdmin(),
    getHuidigeModerator(),
  ]);

  // Een gewone moderator ziet enkel toernooien uit zijn eigen provincie, tenzij
  // een admin hem toegang tot heel België gaf — zo keurt altijd de juiste
  // persoon voor de juiste regio goed.
  const magHeelBelgieZien = magAdminZien || huidigeModerator?.mag_heel_belgie === true;
  const zichtbareToernooien = magHeelBelgieZien
    ? toernooien
    : toernooien.filter((tn) => tn.provincie === huidigeModerator?.provincie);

  return (
    <>
      <StatistiekenPaneel
        bezoeken={bezoekStatistieken}
        bezoekenPerProvincie={bezoekenPerProvincie}
        reizenPaginaBezoeken={reizenPaginaBezoeken}
        toernooien={toernooiStatistieken}
        isAdmin={magAdminZien}
      />
      <PendingList toernooien={zichtbareToernooien} goedgekeurdeToernooien={goedgekeurdeToernooien} />
    </>
  );
}
