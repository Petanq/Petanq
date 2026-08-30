import { getHuidigeModerator, getModeratorenMetStatus } from "@/lib/data";
import { haalMatch13ToegangPerGebruiker } from "@/actions/match13-toegang";
import { ModeratorManageList } from "@/components/beheer/moderator-manage-list";

export default async function BeheerModeratorenPagina() {
  const [moderatoren, huidige, match13Status] = await Promise.all([
    getModeratorenMetStatus(),
    getHuidigeModerator(),
    haalMatch13ToegangPerGebruiker(),
  ]);
  return (
    <ModeratorManageList
      moderatoren={moderatoren}
      huidigUserId={huidige?.user_id ?? null}
      isAdmin={huidige?.rol === "admin"}
      match13Status={match13Status}
    />
  );
}
