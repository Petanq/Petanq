import { getGoedgekeurdeToernooien, getActieveClubs } from "@/lib/data";
import { isToekomstig } from "@/lib/datum";
import { Hero } from "@/components/hero";
import { TournamentBrowser } from "@/components/tournament-browser";

export default async function HomePage() {
  const [toernooien, clubs] = await Promise.all([getGoedgekeurdeToernooien(), getActieveClubs()]);

  const toekomstig = toernooien.filter((tn) => isToekomstig(tn.datum));
  const previewToernooien = toekomstig.slice(0, 4);

  return (
    <>
      <Hero
        previewToernooien={previewToernooien}
        aantalToernooien={toernooien.length}
        aantalClubs={clubs.length}
      />
      <TournamentBrowser toernooien={toekomstig} />
    </>
  );
}
