import { getHuidigeModerator, getModeratoren } from "@/lib/data";
import { ModeratorManageList } from "@/components/beheer/moderator-manage-list";

export default async function BeheerModeratorenPagina() {
  const [moderatoren, huidige] = await Promise.all([getModeratoren(), getHuidigeModerator()]);
  return (
    <ModeratorManageList
      moderatoren={moderatoren}
      huidigUserId={huidige?.user_id ?? null}
      isAdmin={huidige?.rol === "admin"}
    />
  );
}
