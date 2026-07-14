import {
  getInBehandelingToernooien,
  getBezoekStatistieken,
  getToernooiStatistieken,
  getAlleGoedgekeurdeToernooienVoorBeheer,
} from "@/lib/data";
import { PendingList } from "@/components/beheer/pending-list";
import { StatistiekenPaneel } from "@/components/beheer/statistieken-paneel";

export default async function BeheerDashboardPagina() {
  const [toernooien, bezoekStatistieken, toernooiStatistieken, goedgekeurdeToernooien] = await Promise.all([
    getInBehandelingToernooien(),
    getBezoekStatistieken(),
    getToernooiStatistieken(),
    getAlleGoedgekeurdeToernooienVoorBeheer(),
  ]);
  return (
    <>
      <StatistiekenPaneel bezoeken={bezoekStatistieken} toernooien={toernooiStatistieken} />
      <PendingList toernooien={toernooien} goedgekeurdeToernooien={goedgekeurdeToernooien} />
    </>
  );
}
