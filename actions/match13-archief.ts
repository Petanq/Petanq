"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import type { AppState } from "@/lib/match13/state";
import type { Match13ArchiefMeta } from "@/actions/match13";
import { computeStandings, computeMeleeStandings } from "@/lib/match13/standings";

export interface Match13ArchiefRij {
  id: string;
  club: string;
  reden: string;
  gearchiveerd_op: string;
}

export interface Match13ArchiefItem extends Match13ArchiefRij {
  data: AppState;
}

// Rij in de archieflijst: de bewaarde gegevens plus een korte samenvatting, zodat
// de lijst meteen laat zien welke toernooien echt gespeeld zijn (en wie won).
export interface Match13ArchiefLijstRij extends Match13ArchiefRij {
  format: string | null;
  aantalTeams: number;
  gespeeld: number;
  winnaar: string | null;
  // ISO-tijdstip van de laatst ingevoerde score (de dag waarop het toernooi gespeeld is);
  // null als er nooit een wedstrijd gespeeld werd.
  gespeeldOp: string | null;
}

function maakSamenvatting(data: AppState | null) {
  if (!data) return { format: null, aantalTeams: 0, gespeeld: 0, winnaar: null, gespeeldOp: null };
  const teams = data.teams ?? [];
  const rondes = data.rounds ?? [];
  let gespeeld = 0;
  let laatsteScore = 0;
  let laatsteStart = 0;
  for (const ronde of rondes) {
    laatsteStart = Math.max(laatsteStart, ronde.startedAt ?? 0);
    for (const m of ronde.matches) {
      if (m.scoreA !== undefined && m.scoreB !== undefined) {
        gespeeld++;
        laatsteScore = Math.max(laatsteScore, m.finishedAt ?? 0);
      }
    }
  }
  // Oudere toernooien hebben soms geen tijdstip bij de score: dan telt de start van de laatste ronde.
  const speeltijd = gespeeld > 0 ? laatsteScore || laatsteStart : 0;
  const gespeeldOp = speeltijd > 0 ? new Date(speeltijd).toISOString() : null;
  let winnaar: string | null = null;
  if (gespeeld > 0 && data.format !== "poules") {
    const stand = data.format === "meli" ? computeMeleeStandings(teams, rondes) : computeStandings(teams, rondes);
    winnaar = stand[0]?.name?.trim() || null;
  }
  return { format: data.format ?? null, aantalTeams: teams.length, gespeeld, winnaar, gespeeldOp };
}

export async function haalMatch13Archief(): Promise<Match13ArchiefLijstRij[]> {
  if (!(await isAdmin())) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_archief")
    .select("id, club, reden, gearchiveerd_op, data")
    .order("gearchiveerd_op", { ascending: false });

  if (error) {
    console.error("Kon Match13-archief niet ophalen:", error.message);
    return [];
  }
  return (data as (Match13ArchiefRij & { data: AppState | null })[]).map(({ data: blob, ...rij }) => ({
    ...rij,
    ...maakSamenvatting(blob),
  }));
}

// Zet een gearchiveerd toernooi terug in de gewone lijst (als nieuwe rij; het archief
// zelf blijft ongemoeid). De club, datum en organisator komen uit `meta` (sinds migratie
// 0065); oudere archiefrijen hebben dat niet — dan staat het toernooi zonder club terug
// en ziet enkel de admin het tot de club erbij gezet wordt.
export async function herstelMatch13Archief(
  id: string
): Promise<{ succes: true; toernooiId: string; zonderClub: boolean } | { succes: false; fout: string }> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { succes: false, fout: "niet_geautoriseerd" };

  let { data: rij, error } = await supabase
    .from("match13_archief")
    .select("club, data, meta")
    .eq("id", id)
    .single();
  if (error && /meta/i.test(error.message)) {
    const oud = await supabase.from("match13_archief").select("club, data").eq("id", id).single();
    rij = oud.data ? { ...oud.data, meta: null } : null;
    error = oud.error;
  }
  if (error || !rij) return { succes: false, fout: "niet_gevonden" };

  const state = rij.data as AppState;
  const meta = (rij.meta ?? null) as Partial<Match13ArchiefMeta> | null;
  const { data: nieuw, error: insertFout } = await supabase
    .from("match13_toernooien")
    .insert({
      aangemaakt_door: user.id,
      naam: meta?.naam || state.clubName || rij.club || "Hersteld toernooi",
      club: meta?.club ?? "",
      geplande_datum: meta?.geplande_datum ?? null,
      organisator: meta?.organisator ?? null,
      afgewerkt: meta?.afgewerkt ?? false,
      is_test: meta?.is_test ?? false,
      data: state,
    })
    .select("id")
    .single();
  if (insertFout || !nieuw) {
    console.error("Herstellen uit Match13-archief mislukt:", id, insertFout?.message);
    return { succes: false, fout: "herstellen_mislukt" };
  }

  revalidatePath("/beheer/match13");
  return { succes: true, toernooiId: nieuw.id as string, zonderClub: !meta?.club };
}

export async function haalMatch13ArchiefItem(id: string): Promise<Match13ArchiefItem | null> {
  if (!(await isAdmin())) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_archief")
    .select("id, club, reden, gearchiveerd_op, data")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Kon Match13-archiefitem niet ophalen:", id, error.message);
    return null;
  }
  return data as Match13ArchiefItem;
}
