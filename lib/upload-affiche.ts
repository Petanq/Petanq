import { createClient } from "@/lib/supabase/client";

export async function uploadAffiche(file: File): Promise<string | null> {
  const supabase = createClient();
  const extensie = file.name.split(".").pop() ?? "jpg";
  const pad = `${crypto.randomUUID()}.${extensie}`;

  const { error } = await supabase.storage.from("affiches").upload(pad, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("Affiche uploaden mislukt:", error.message);
    return null;
  }

  const { data } = supabase.storage.from("affiches").getPublicUrl(pad);
  return data.publicUrl;
}
