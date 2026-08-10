import { getAlleGoedgekeurdeToernooienVoorBeheer } from "@/lib/data";
import { TournamentManageList } from "@/components/beheer/tournament-manage-list";

export default async function BeheerSchiftingenPagina() {
  const alleToernooien = await getAlleGoedgekeurdeToernooienVoorBeheer();
  const toernooien = alleToernooien.filter((tn) => tn.kwalificatiedata && tn.kwalificatiedata.length > 0);
  return <TournamentManageList toernooien={toernooien} />;
}
