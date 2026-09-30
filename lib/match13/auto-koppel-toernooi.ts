import { createServiceRoleClient } from "@/lib/supabase/server";
import { defaultAppState } from "@/lib/match13/state";

// Voor pilootclubs (clubs met actieve Match13-toegang): zodra zo'n club een
// toernooi indient/toegevoegd krijgt op Petanque13.be, staat er meteen een
// gekoppeld, leeg Match13-toernooi klaar — zo moeten ze het niet dubbel
// intikken. "Live delen" staat bewust nog uit: de club kiest zelf, per
// toernooi, of ze dat ene toernooi ook effectief live willen delen. Voor elke
// andere (niet-pilot) club verandert er niets — best-effort, mag een
// tornooi-inzending nooit laten mislukken.
export async function maakGekoppeldMatch13ToernooiVoorPilootclub(toernooi: {
  id: string;
  club_id: string | null;
  naam_nl: string;
  datum: string;
}): Promise<void> {
  if (!toernooi.club_id) return;

  try {
    const serviceClient = createServiceRoleClient();
    const { data: piloot } = await serviceClient
      .from("match13_gebruikers")
      .select("user_id, club")
      .eq("club_id", toernooi.club_id)
      .eq("actief", true)
      .limit(1)
      .maybeSingle();
    if (!piloot) return;

    const { error } = await serviceClient.from("match13_toernooien").insert({
      aangemaakt_door: piloot.user_id,
      naam: toernooi.naam_nl,
      club: piloot.club,
      geplande_datum: toernooi.datum,
      toernooi_id: toernooi.id,
      data: defaultAppState(),
    });
    if (error) console.error("Automatisch gekoppeld Match13-toernooi aanmaken mislukt:", error.message);
  } catch (fout) {
    console.error("Automatisch gekoppeld Match13-toernooi aanmaken mislukt:", fout);
  }
}
