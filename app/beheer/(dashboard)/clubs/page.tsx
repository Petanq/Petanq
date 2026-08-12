import { getAlleClubsVoorBeheer } from "@/lib/data";
import { isAdmin } from "@/lib/auth-helpers";
import { ClubManageList } from "@/components/beheer/club-manage-list";

export default async function BeheerClubsPagina() {
  const [clubs, magAdmin] = await Promise.all([getAlleClubsVoorBeheer(), isAdmin()]);
  return <ClubManageList clubs={clubs} isAdmin={magAdmin} />;
}
