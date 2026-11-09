import type { Metadata } from "next";
import { talenAlternatief } from "@/lib/seo-talen";
import { getGoedgekeurdeToernooien, getActieveClubs, getAantalActieveModeratoren } from "@/lib/data";
import { isToekomstig } from "@/lib/datum";
import { Hero } from "@/components/hero";
import { PartnerBalk } from "@/components/partner-balk";
import { MobielKalenderPoort, MobielKalenderProvider } from "@/components/mobiel-kalender";
import { TournamentBrowser } from "@/components/tournament-browser";
import { haalLiveGedeeldeToernooiIds } from "@/actions/match13";

export const metadata: Metadata = {
  alternates: talenAlternatief("/", "/", "/fr"),
};

export default async function HomePage() {
  const [toernooien, clubs, aantalControleurs, liveToernooiIds] = await Promise.all([
    getGoedgekeurdeToernooien(),
    getActieveClubs(),
    getAantalActieveModeratoren(),
    haalLiveGedeeldeToernooiIds(),
  ]);

  const toekomstig = toernooien.filter((tn) => isToekomstig(tn.datum));

  return (
    <MobielKalenderProvider>
      <Hero
        aantalToernooien={toernooien.length}
        aantalClubs={clubs.length}
        aantalControleurs={aantalControleurs}
      />
      <PartnerBalk />
      <MobielKalenderPoort>
        <TournamentBrowser toernooien={toekomstig} clubs={clubs} liveToernooiIds={liveToernooiIds} />
      </MobielKalenderPoort>
    </MobielKalenderProvider>
  );
}
