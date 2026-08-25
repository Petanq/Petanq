"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin, heeftMatch13Toegang } from "@/lib/auth-helpers";
import { defaultAppState, type AppState } from "@/lib/match13/state";

export type Match13ActieResultaat = { succes: true } | { succes: false; fout: string };

export interface Match13ToernooiRij {
  id: string;
  naam: string;
  aangemaakt_op: string;
  bijgewerkt_op: string;
}

// Admin ziet alles; een pilootgebruiker mag enkel Match13 gebruiken (nooit de
// rest van het beheerpaneel) — welke rijen ze precies te zien krijgen wordt
// daarna nog eens afgedwongen door de RLS-policy op match13_toernooien zelf.
async function magMatch13Gebruiken(): Promise<boolean> {
  return (await isAdmin()) || (await heeftMatch13Toegang());
}

export async function haalMatch13Toernooien(): Promise<Match13ToernooiRij[]> {
  if (!(await magMatch13Gebruiken())) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_toernooien")
    .select("id, naam, aangemaakt_op, bijgewerkt_op")
    .order("bijgewerkt_op", { ascending: false });

  if (error) {
    console.error("Kon Match13-toernooien niet ophalen:", error.message);
    return [];
  }
  return data as Match13ToernooiRij[];
}

export async function haalMatch13Toernooi(id: string): Promise<AppState | null> {
  if (!(await magMatch13Gebruiken())) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match13_toernooien")
    .select("data")
    .eq("id", id)
    .single();

  if (error) return null;
  return data.data as AppState;
}

// Redirect gebeurt hier zelf (in plaats van het resultaat terug te geven aan
// de aanroeper) zodat de "Nieuw toernooi"-knop meteen naar het nieuwe
// toernooi springt, zoals bij de bestaande beheer-acties met formuliertjes.
export async function nieuwMatch13Toernooi(): Promise<void> {
  if (!(await magMatch13Gebruiken())) redirect("/beheer");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/beheer");

  const { data, error } = await supabase
    .from("match13_toernooien")
    .insert({ aangemaakt_door: user.id, data: defaultAppState() })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Kon nieuw Match13-toernooi niet aanmaken:", error?.message);
    redirect("/beheer/match13");
  }
  redirect(`/beheer/match13/${data.id}`);
}

export async function slaMatch13OpAsync(id: string, state: AppState): Promise<Match13ActieResultaat> {
  if (!(await magMatch13Gebruiken())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("match13_toernooien")
    .update({ data: state, naam: state.clubName || "Nieuw toernooi", bijgewerkt_op: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Kon Match13-toernooi niet opslaan:", error.message);
    return { succes: false, fout: "opslaan_mislukt" };
  }
  return { succes: true };
}

export async function verwijderMatch13Toernooi(id: string): Promise<Match13ActieResultaat> {
  if (!(await magMatch13Gebruiken())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = await createClient();
  const { error } = await supabase.from("match13_toernooien").delete().eq("id", id);

  if (error) return { succes: false, fout: "verwijderen_mislukt" };
  revalidatePath("/beheer/match13");
  return { succes: true };
}
