import { getGoedgekeurdeToernooien, getActieveClubs, getAantalActieveModeratoren } from "@/lib/data";
import { isToekomstig } from "@/lib/datum";
import { Hero } from "@/components/hero";
import { TournamentBrowser } from "@/components/tournament-browser";

export default async function HomePage() {
  const [toernooien, clubs, aantalControleurs] = await Promise.all([
    getGoedgekeurdeToernooien(),
    getActieveClubs(),
    getAantalActieveModeratoren(),
  ]);

  const toekomstig = toernooien.filter((tn) => isToekomstig(tn.datum));

  return (
    <>
      <Hero aantalToernooien={toernooien.length} aantalClubs={clubs.length} aantalControleurs={aantalControleurs} />
      <TournamentBrowser toernooien={toekomstig} clubs={clubs} />
    </>
  );
}
