import { BeheerNav } from "@/components/beheer/beheer-nav";
import { WachtOpGoedkeuring } from "@/components/beheer/wacht-op-goedkeuring";
import { ModeratorBezoekTeller } from "@/components/beheer/moderator-bezoek-teller";
import {
  getInBehandelingToernooien,
  getWachtendeClubs,
  getVerwijderAanvragenToernooien,
  getVerwijderAanvragenClubs,
} from "@/lib/data";
import { isModerator, isAdmin } from "@/lib/auth-helpers";

export default async function BeheerDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isModerator())) {
    return (
      <div className="mx-auto max-w-[1140px] px-6 py-8 lg:px-10">
        <WachtOpGoedkeuring />
      </div>
    );
  }

  const magAdminZien = await isAdmin();
  const [toernooien, clubs, verwijderAanvragenToernooien, verwijderAanvragenClubs] = await Promise.all([
    getInBehandelingToernooien(),
    getWachtendeClubs(),
    magAdminZien ? getVerwijderAanvragenToernooien() : Promise.resolve([]),
    magAdminZien ? getVerwijderAanvragenClubs() : Promise.resolve([]),
  ]);

  return (
    <div>
      <ModeratorBezoekTeller />
      <BeheerNav
        wachtendeToernooien={toernooien.length}
        wachtendeClubs={clubs.length}
        wachtendeVerwijderaanvragen={verwijderAanvragenToernooien.length + verwijderAanvragenClubs.length}
        isAdmin={magAdminZien}
      />
      <div className="mx-auto max-w-[1140px] px-6 py-8 lg:px-10">{children}</div>
    </div>
  );
}
