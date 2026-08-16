import { createClient } from "@/lib/supabase/server";

// Expliciete controle in de server actions zelf, als vangnet bovenop de RLS-
// policies in de databank (die dezelfde is_moderator()-functie gebruiken).
export async function isModerator(): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("is_moderator");
  if (error) return false;
  return data === true;
}

export async function isAdmin(): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return data === true;
}

export async function huidigeModeratorNaam(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("moderatoren").select("naam").eq("user_id", user.id).single();
  return data?.naam ?? user.email ?? null;
}
