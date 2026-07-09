import { createClient } from "@/lib/supabase/server";
import { Club, Moderator, Toernooi } from "@/lib/types";

export async function getGoedgekeurdeToernooien(): Promise<Toernooi[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("toernooien")
    .select("*")
    .eq("status", "goedgekeurd")
    .order("datum", { ascending: true })
    .order("uur", { ascending: true });

  if (error) {
    console.error("Kon toernooien niet ophalen:", error.message);
    return [];
  }
  return data as Toernooi[];
}

export async function getToernooiById(id: string): Promise<Toernooi | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("toernooien")
    .select("*")
    .eq("id", id)
    .eq("status", "goedgekeurd")
    .single();

  if (error) return null;
  return data as Toernooi;
}

export async function getInBehandelingToernooien(): Promise<Toernooi[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("toernooien")
    .select("*")
    .eq("status", "in_behandeling")
    .order("aangemaakt_op", { ascending: true });

  if (error) {
    console.error("Kon toernooien in behandeling niet ophalen:", error.message);
    return [];
  }
  return data as Toernooi[];
}

export async function getAlleGoedgekeurdeToernooienVoorBeheer(): Promise<Toernooi[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("toernooien")
    .select("*")
    .eq("status", "goedgekeurd")
    .order("datum", { ascending: false });

  if (error) {
    console.error("Kon toernooien niet ophalen:", error.message);
    return [];
  }
  return data as Toernooi[];
}

export async function getAlleClubsVoorBeheer(): Promise<Club[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("clubs").select("*").order("naam", { ascending: true });

  if (error) {
    console.error("Kon clubs niet ophalen:", error.message);
    return [];
  }
  return data as Club[];
}

export async function getWachtendeClubs(): Promise<Club[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("actief", false)
    .order("aangemaakt_op", { ascending: true });

  if (error) {
    console.error("Kon wachtende clubs niet ophalen:", error.message);
    return [];
  }
  return data as Club[];
}

export async function getModeratoren(): Promise<Moderator[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("moderatoren").select("*").order("naam", { ascending: true });

  if (error) {
    console.error("Kon moderatoren niet ophalen:", error.message);
    return [];
  }
  return data as Moderator[];
}

export async function getHuidigeModerator(): Promise<Moderator | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("moderatoren").select("*").eq("user_id", user.id).single();
  return (data as Moderator) ?? null;
}

export async function getActieveClubs(): Promise<Club[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("actief", true)
    .order("naam", { ascending: true });

  if (error) {
    console.error("Kon clubs niet ophalen:", error.message);
    return [];
  }
  return data as Club[];
}
