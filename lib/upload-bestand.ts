import { createClient } from "@/lib/supabase/client";

export async function uploadNaarStorage(bucket: string, file: File): Promise<string | null> {
  const supabase = createClient();
  const extensie = file.name.split(".").pop() ?? "jpg";
  const pad = `${crypto.randomUUID()}.${extensie}`;

  const { error } = await supabase.storage.from(bucket).upload(pad, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error(`Bestand uploaden naar ${bucket} mislukt:`, error.message);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(pad);
  return data.publicUrl;
}
