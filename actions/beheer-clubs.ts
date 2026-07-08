"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { clubSchema } from "@/lib/validations";
import { Club } from "@/lib/types";

export type BeheerActieResultaat = { succes: true } | { succes: false; fout: string };

export async function clubToevoegen(input: unknown): Promise<BeheerActieResultaat> {
  const parsed = clubSchema.safeParse(input);
  if (!parsed.success) return { succes: false, fout: "ongeldige_invoer" };

  const supabase = createClient();
  const { error } = await supabase.from("clubs").insert({
    naam: parsed.data.naam,
    gemeente: parsed.data.gemeente,
    provincie: parsed.data.provincie,
    adres: parsed.data.adres || null,
    website: parsed.data.website || null,
    contact_email: parsed.data.contact_email || null,
    actief: true,
  });

  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/clubs");
  revalidatePath("/clubs");
  return { succes: true };
}

export async function clubBewerken(
  id: string,
  wijzigingen: Partial<
    Pick<Club, "naam" | "gemeente" | "provincie" | "adres" | "website" | "contact_email">
  >
): Promise<BeheerActieResultaat> {
  const supabase = createClient();
  const { error } = await supabase.from("clubs").update(wijzigingen).eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/clubs");
  revalidatePath("/clubs");
  return { succes: true };
}

export async function clubActiefZetten(id: string, actief: boolean): Promise<BeheerActieResultaat> {
  const supabase = createClient();
  const { error } = await supabase.from("clubs").update({ actief }).eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/clubs");
  revalidatePath("/clubs");
  return { succes: true };
}

export async function clubVerwijderen(id: string): Promise<BeheerActieResultaat> {
  const supabase = createClient();
  const { error } = await supabase.from("clubs").delete().eq("id", id);
  if (error) return { succes: false, fout: "server_fout" };
  revalidatePath("/beheer/clubs");
  revalidatePath("/clubs");
  return { succes: true };
}
