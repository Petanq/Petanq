import {
  getInBehandelingToernooien,
  getBezoekStatistieken,
  getAlleGoedgekeurdeToernooienVoorBeheer,
} from "@/lib/data";
import { PendingList } from "@/components/beheer/pending-list";
import { BezoekStatistiekenKaarten } from "@/components/beheer/bezoek-statistieken";

export default async function BeheerDashboardPagina() {
  const [toernooien, statistieken, goedgekeurdeToernooien] = await Promise.all([
    getInBehandelingToernooien(),
    getBezoekStatistieken(),
    getAlleGoedgekeurdeToernooienVoorBeheer(),
  ]);
  return (
    <>
      <BezoekStatistiekenKaarten statistieken={statistieken} />
      <PendingList toernooien={toernooien} goedgekeurdeToernooien={goedgekeurdeToernooien} />
    </>
  );
}
