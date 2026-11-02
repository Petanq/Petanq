"use server";

import { isAdmin } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import type { AppState } from "@/lib/match13/state";
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
}

function maakSamenvatting(data: AppState | null) {
  if (!data) return { format: null, aantalTeams: 0, gespeeld: 0, winnaar: null };
  const teams = data.teams ?? [];
  const rondes = data.rounds ?? [];
  let gespeeld = 0;
  for (const ronde of rondes) {
    for (const m of ronde.matches) if (m.scoreA !== undefined && m.scoreB !== undefined) gespeeld++;
  }
  let winnaar: string | null = null;
  if (gespeeld > 0 && data.format !== "poules") {
    const stand = data.format === "meli" ? computeMeleeStandings(teams, rondes) : computeStandings(teams, rondes);
    winnaar = stand[0]?.name?.trim() || null;
  }
  return { format: data.format ?? null, aantalTeams: teams.length, gespeeld, winnaar };
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
