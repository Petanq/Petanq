import { redirect } from "next/navigation";
import { BeheerNav } from "@/components/beheer/beheer-nav";
import { WachtOpGoedkeuring } from "@/components/beheer/wacht-op-goedkeuring";
import { ModeratorBezoekTeller } from "@/components/beheer/moderator-bezoek-teller";
import {
  getInBehandelingToernooien,
  getWachtendeClubs,
  getVerwijderAanvragenToernooien,
  getVerwijderAanvragenClubs,
} from "@/lib/data";
import { isModerator, isAdmin, heeftMatch13Toegang } from "@/lib/auth-helpers";

export default async function BeheerDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isModerator())) {
    // Geen moderator, maar wel een pilootclub met Match13-toegang? Die heeft
    // hier niets te zoeken (dit is het echte moderatorpaneel) — stuur meteen
    // door naar het enige waar ze wél bij mogen.
    if (await heeftMatch13Toegang()) redirect("/beheer/match13");
    return (
      <div className="mx-auto max-w-[1140px] px-6 py-8 lg:px-10">
        <WachtOpGoedkeuring />
      </div>
    );
  }

  const magAdminZien = await isAdmin();
  const [toernooien, clubs, verwijderAanvragenToernooien, verwijderAanvragenClubs, magMatch13Zien] = await Promise.all([
    getInBehandelingToernooien(),
    getWachtendeClubs(),
    magAdminZien ? getVerwijderAanvragenToernooien() : Promise.resolve([]),
    magAdminZien ? getVerwijderAanvragenClubs() : Promise.resolve([]),
    heeftMatch13Toegang(),
  ]);

  return (
    <div>
      <ModeratorBezoekTeller />
      <BeheerNav
        wachtendeToernooien={toernooien.length}
        wachtendeClubs={clubs.length}
        wachtendeVerwijderaanvragen={verwijderAanvragenToernooien.length + verwijderAanvragenClubs.length}
        isAdmin={magAdminZien}
        heeftMatch13Toegang={magMatch13Zien}
      />
      <div className="mx-auto max-w-[1140px] px-6 py-8 lg:px-10">{children}</div>
    </div>
  );
}
