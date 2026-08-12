import { getAlleGoedgekeurdeToernooienVoorBeheer } from "@/lib/data";
import { isAdmin } from "@/lib/auth-helpers";
import { TournamentManageList } from "@/components/beheer/tournament-manage-list";

export default async function BeheerSchiftingenPagina() {
  const [alleToernooien, magAdmin] = await Promise.all([getAlleGoedgekeurdeToernooienVoorBeheer(), isAdmin()]);
  const toernooien = alleToernooien.filter((tn) => tn.kwalificatiedata && tn.kwalificatiedata.length > 0);
  return <TournamentManageList toernooien={toernooien} isAdmin={magAdmin} />;
}
