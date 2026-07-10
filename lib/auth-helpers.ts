import { createClient } from "@/lib/supabase/server";

// Expliciete controle in de server actions zelf, als vangnet bovenop de RLS-
// policies in de databank (die dezelfde is_moderator()-functie gebruiken).
export async function isModerator(): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("is_moderator");
  if (error) return false;
  return data === true;
}
