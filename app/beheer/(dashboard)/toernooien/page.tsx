import { getAlleGoedgekeurdeToernooienVoorBeheer } from "@/lib/data";
import { isAdmin } from "@/lib/auth-helpers";
import { TournamentManageList } from "@/components/beheer/tournament-manage-list";

export default async function BeheerToernooienPagina() {
  const [toernooien, magAdmin] = await Promise.all([getAlleGoedgekeurdeToernooienVoorBeheer(), isAdmin()]);
  return <TournamentManageList toernooien={toernooien} isAdmin={magAdmin} />;
}
