import { getInBehandelingToernooien, getBezoekStatistieken } from "@/lib/data";
import { PendingList } from "@/components/beheer/pending-list";
import { BezoekStatistiekenKaarten } from "@/components/beheer/bezoek-statistieken";

export default async function BeheerDashboardPagina() {
  const [toernooien, statistieken] = await Promise.all([
    getInBehandelingToernooien(),
    getBezoekStatistieken(),
  ]);
  return (
    <>
      <BezoekStatistiekenKaarten statistieken={statistieken} />
      <PendingList toernooien={toernooien} />
    </>
  );
}
