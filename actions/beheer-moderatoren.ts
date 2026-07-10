"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Moderator } from "@/lib/types";
import { isModerator } from "@/lib/auth-helpers";

export type BeheerActieResultaat = { succes: true } | { succes: false; fout: string };

export async function moderatorBewerken(
  id: string,
  wijzigingen: Partial<Pick<Moderator, "naam" | "provincie">>
): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = createClient();
  const { error } = await supabase.from("moderatoren").update(wijzigingen).eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/moderatoren");
  return { succes: true };
}

export async function moderatorVerwijderen(id: string): Promise<BeheerActieResultaat> {
  if (!(await isModerator())) return { succes: false, fout: "niet_geautoriseerd" };

  const supabase = createClient();
  const { error } = await supabase.from("moderatoren").delete().eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/moderatoren");
  return { succes: true };
}
