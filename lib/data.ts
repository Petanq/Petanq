import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
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

export type ModeratorMetStatus = Moderator & { bevestigd: boolean };

export async function getModeratorenMetStatus(): Promise<ModeratorMetStatus[]> {
  const moderatoren = await getModeratoren();
  // "Actief" betekent hier: heeft effectief zelf een wachtwoord ingesteld en kan
  // dus echt inloggen — niet enkel dat de uitnodigingslink ooit werd geopend.
  return moderatoren.map((mod) => ({ ...mod, bevestigd: mod.wachtwoord_ingesteld }));
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

export type BezoekStatistieken = { totaal: number; dezeMaand: number };

export async function getBezoekStatistieken(): Promise<BezoekStatistieken> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("site_bezoeken").select("dag, aantal");

  if (error || !data) {
    console.error("Kon bezoekstatistieken niet ophalen:", error?.message);
    return { totaal: 0, dezeMaand: 0 };
  }

  const huidigeMaand = new Date().toISOString().slice(0, 7);
  const totaal = data.reduce((som: number, rij: { dag: string; aantal: number }) => som + rij.aantal, 0);
  const dezeMaand = data
    .filter((rij: { dag: string; aantal: number }) => rij.dag.startsWith(huidigeMaand))
    .reduce((som: number, rij: { dag: string; aantal: number }) => som + rij.aantal, 0);

  return { totaal, dezeMaand };
}

export type BezoekPerProvincie = { provincie: string; aantal: number };

export async function getBezoekenPerProvincie(): Promise<BezoekPerProvincie[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("bezoeken_provincie").select("provincie, aantal");

  if (error || !data) {
    console.error("Kon bezoeken per provincie niet ophalen:", error?.message);
    return [];
  }

  const totalen = new Map<string, number>();
  for (const rij of data as { provincie: string; aantal: number }[]) {
    totalen.set(rij.provincie, (totalen.get(rij.provincie) ?? 0) + rij.aantal);
  }

  return Array.from(totalen.entries())
    .map(([provincie, aantal]) => ({ provincie, aantal }))
    .sort((a, b) => b.aantal - a.aantal);
}

export async function getPaginaBezoekTotaal(pad: string): Promise<number> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("pagina_bezoeken").select("aantal").eq("pad", pad);

  if (error || !data) {
    console.error("Kon paginabezoeken niet ophalen:", error?.message);
    return 0;
  }

  return data.reduce((som: number, rij: { aantal: number }) => som + rij.aantal, 0);
}

export type ToernooiStatistieken = {
  totaalGoedgekeurd: number;
  aanvragenDezeMaand: number;
  goedgekeurdDezeMaand: number;
  geweigerdDezeMaand: number;
  actieveClubs: number;
  perModerator: { naam: string; aantal: number }[];
};

export async function getToernooiStatistieken(): Promise<ToernooiStatistieken> {
  const supabase = createServiceRoleClient();
  const maandStart = new Date();
  maandStart.setDate(1);
  maandStart.setHours(0, 0, 0, 0);
  const maandStartIso = maandStart.toISOString();

  const [totaalRes, aanvragenRes, goedgekeurdRes, geweigerdRes, clubsRes, perModeratorRes, moderatorenRes] =
    await Promise.all([
      supabase.from("toernooien").select("id", { count: "exact", head: true }).eq("status", "goedgekeurd"),
      supabase.from("toernooien").select("id", { count: "exact", head: true }).gte("aangemaakt_op", maandStartIso),
      supabase
        .from("toernooien")
        .select("id", { count: "exact", head: true })
        .eq("status", "goedgekeurd")
        .gte("goedgekeurd_op", maandStartIso),
      supabase
        .from("toernooien")
        .select("id", { count: "exact", head: true })
        .eq("status", "geweigerd")
        .gte("goedgekeurd_op", maandStartIso),
      supabase.from("clubs").select("id", { count: "exact", head: true }).eq("actief", true),
      supabase.from("toernooien").select("goedgekeurd_door").eq("status", "goedgekeurd").not("goedgekeurd_door", "is", null),
      supabase.from("moderatoren").select("naam"),
    ]);

  // Start met alle vrijwilligers op 0, zodat ook wie nog niets goedkeurde
  // gewoon in de lijst verschijnt in plaats van stilzwijgend te ontbreken.
  const tellingen = new Map<string, number>();
  for (const mod of moderatorenRes.data ?? []) {
    tellingen.set((mod as { naam: string }).naam, 0);
  }
  for (const rij of perModeratorRes.data ?? []) {
    const naam = (rij as { goedgekeurd_door: string }).goedgekeurd_door;
    tellingen.set(naam, (tellingen.get(naam) ?? 0) + 1);
  }
  const perModerator = Array.from(tellingen.entries())
    .map(([naam, aantal]) => ({ naam, aantal }))
    .sort((a, b) => b.aantal - a.aantal);

  return {
    totaalGoedgekeurd: totaalRes.count ?? 0,
    aanvragenDezeMaand: aanvragenRes.count ?? 0,
    goedgekeurdDezeMaand: goedgekeurdRes.count ?? 0,
    geweigerdDezeMaand: geweigerdRes.count ?? 0,
    actieveClubs: clubsRes.count ?? 0,
    perModerator,
  };
}

export async function getAantalActieveModeratoren(): Promise<number> {
  const supabase = createServiceRoleClient();
  const { count, error } = await supabase
    .from("moderatoren")
    .select("id", { count: "exact", head: true })
    .eq("goedgekeurd", true);

  if (error) {
    console.error("Kon aantal moderatoren niet ophalen:", error.message);
    return 0;
  }
  return count ?? 0;
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
