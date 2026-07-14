import {
  getInBehandelingToernooien,
  getBezoekStatistieken,
  getToernooiStatistieken,
  getAlleGoedgekeurdeToernooienVoorBeheer,
} from "@/lib/data";
import { isAdmin } from "@/lib/auth-helpers";
import { PendingList } from "@/components/beheer/pending-list";
import { StatistiekenPaneel } from "@/components/beheer/statistieken-paneel";

export default async function BeheerDashboardPagina() {
  const [toernooien, bezoekStatistieken, toernooiStatistieken, goedgekeurdeToernooien, magAdminZien] =
    await Promise.all([
      getInBehandelingToernooien(),
      getBezoekStatistieken(),
      getToernooiStatistieken(),
      getAlleGoedgekeurdeToernooienVoorBeheer(),
      isAdmin(),
    ]);
  return (
    <>
      <StatistiekenPaneel bezoeken={bezoekStatistieken} toernooien={toernooiStatistieken} isAdmin={magAdminZien} />
      <PendingList toernooien={toernooien} goedgekeurdeToernooien={goedgekeurdeToernooien} />
    </>
  );
}
