import { getAlleClubsVoorBeheer } from "@/lib/data";
import { ClubManageList } from "@/components/beheer/club-manage-list";

export default async function BeheerClubsPagina() {
  const clubs = await getAlleClubsVoorBeheer();
  return <ClubManageList clubs={clubs} />;
}
