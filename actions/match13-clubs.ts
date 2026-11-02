"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isAdmin, heeftMatch13Toegang } from "@/lib/auth-helpers";

export interface ClubHit {
  id: string;
  naam: string;
  gemeente: string;
  adres: string | null;
}

export interface NieuweClubMelding {
  id: string;
  toernooi_id: string | null;
  naam: string;
  gemeente: string;
  aangemaakt_op: string;
}

async function magMatch13Gebruiken(): Promise<boolean> {
  return (await isAdmin()) || (await heeftMatch13Toegang());
}

// Ontbrekende tabel (migratie 0063 nog niet uitgevoerd): Postgres 42P01 / PostgREST-schemacache.
function tabelOntbreekt(error: { code?: string; message?: string }): boolean {
  return error.code === "42P01" || error.code === "PGRST205" || /match13_nieuwe_clubs/i.test(error.message ?? "");
}

// Zoeken in de Petanque13-clublijst terwijl je in Opzet de clubnaam intikt. Enkel
// publieke clubgegevens (naam, gemeente, adres) komen terug.
export async function zoekClubsVoorMatch13(zoek: string): Promise<ClubHit[]> {
  if (!(await magMatch13Gebruiken())) return [];
  const q = zoek.replace(/[%,()*\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  if (q.length < 2) return [];

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("id, naam, gemeente, adres")
    .is("verwijderd_op", null)
    .or(`naam.ilike.%${q}%,gemeente.ilike.%${q}%`)
    .order("naam")
    .limit(8);
  if (error || !data) return [];
  return data as ClubHit[];
}

export type NieuweClubResultaat = { succes: true } | { succes: false; fout: string };

// Een nieuwe club (niet in de lijst) wordt gemeld aan de admin. Per toernooi staat er
// maximaal één openstaande melding; een tweede keer vervangt de eerste.
export async function meldNieuweClub(invoer: {
  toernooiId: string;
  naam: string;
  gemeente: string;
}): Promise<NieuweClubResultaat> {
  if (!(await magMatch13Gebruiken())) return { succes: false, fout: "niet_geautoriseerd" };
  const naam = invoer.naam.trim().slice(0, 120);
  const gemeente = invoer.gemeente.trim().slice(0, 80);
  if (naam.length < 2 || gemeente.length < 2) return { succes: false, fout: "ongeldig" };

  const supabase = createServiceRoleClient();
  const { error: wisFout } = await supabase
    .from("match13_nieuwe_clubs")
    .delete()
    .eq("toernooi_id", invoer.toernooiId)
    .eq("afgehandeld", false);
  if (wisFout) return tabelOntbreekt(wisFout) ? { succes: true } : { succes: false, fout: "opslaan_mislukt" };

  const { error } = await supabase
    .from("match13_nieuwe_clubs")
    .insert({ toernooi_id: invoer.toernooiId, naam, gemeente });
  if (error) return tabelOntbreekt(error) ? { succes: true } : { succes: false, fout: "opslaan_mislukt" };
  revalidatePath("/beheer/match13");
  return { succes: true };
}

// Kiest de gebruiker later toch een bestaande club (of "geen petanqueclub"), dan vervalt de melding.
export async function wisNieuweClubMelding(toernooiId: string): Promise<void> {
  if (!(await magMatch13Gebruiken())) return;
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("match13_nieuwe_clubs")
    .delete()
    .eq("toernooi_id", toernooiId)
    .eq("afgehandeld", false);
  if (error && !tabelOntbreekt(error)) console.error("Melding nieuwe club wissen mislukt:", error.message);
  revalidatePath("/beheer/match13");
}

// ---- Admin ----

export async function haalNieuweClubs(): Promise<NieuweClubMelding[]> {
  if (!(await isAdmin())) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_nieuwe_clubs")
    .select("id, toernooi_id, naam, gemeente, aangemaakt_op")
    .eq("afgehandeld", false)
    .order("aangemaakt_op", { ascending: false });
  if (error || !data) return [];
  return data as NieuweClubMelding[];
}

export async function telNieuweClubs(): Promise<number> {
  if (!(await isAdmin())) return 0;
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("match13_nieuwe_clubs")
    .select("id", { count: "exact", head: true })
    .eq("afgehandeld", false);
  if (error) return 0;
  return count ?? 0;
}

export async function markeerNieuweClubAfgehandeld(id: string): Promise<NieuweClubResultaat> {
  if (!(await isAdmin())) return { succes: false, fout: "niet_geautoriseerd" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("match13_nieuwe_clubs")
    .update({ afgehandeld: true, afgehandeld_op: new Date().toISOString() })
    .eq("id", id);
  if (error) return { succes: false, fout: "opslaan_mislukt" };
  revalidatePath("/beheer/match13");
  revalidatePath("/beheer");
  return { succes: true };
}
