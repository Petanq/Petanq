import { createClient } from "@/lib/supabase/server";
import type { ClubUren } from "@/lib/club-beheer/uren";
import { brusselsVandaag, heeftIngevuldeUren } from "@/lib/club-beheer/uren";
import type { ClubBeheerData } from "@/components/club-beheer/ClubBeheerContext";

// Publiek: de openingsuren die clubs zelf beheren en hun melding voor vandaag.
// Mislukt dit (bv. migratie 0066 nog niet uitgevoerd), dan blijven de clubkaartjes gewoon zoals ze waren.
export async function getClubBeheerData(): Promise<ClubBeheerData> {
  const leeg: ClubBeheerData = { uren: {}, vandaag: {} };
  try {
    const supabase = await createClient();
    const [urenRes, vandaagRes] = await Promise.all([
      supabase.from("club_uren").select("club_id, uren"),
      supabase.from("club_vandaag").select("club_id, soort, reden, datum"),
    ]);

    const data: ClubBeheerData = { uren: {}, vandaag: {} };
    if (!urenRes.error) {
      for (const rij of urenRes.data ?? []) {
        const uren = rij.uren as ClubUren;
        if (heeftIngevuldeUren(uren)) data.uren[rij.club_id as string] = uren;
      }
    }
    if (!vandaagRes.error) {
      const vandaag = brusselsVandaag();
      for (const rij of vandaagRes.data ?? []) {
        if (rij.datum === vandaag) {
          data.vandaag[rij.club_id as string] = { soort: rij.soort as "dicht" | "extra", reden: (rij.reden as string) ?? "" };
        }
      }
    }
    return data;
  } catch {
    return leeg;
  }
}
