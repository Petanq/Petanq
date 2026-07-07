import { getAlleGoedgekeurdeToernooienVoorBeheer } from "@/lib/data";
import { TournamentManageList } from "@/components/beheer/tournament-manage-list";

export default async function BeheerToernooienPagina() {
  const toernooien = await getAlleGoedgekeurdeToernooienVoorBeheer();
  return <TournamentManageList toernooien={toernooien} />;
}
