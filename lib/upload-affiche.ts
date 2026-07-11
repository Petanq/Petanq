import { uploadNaarStorage } from "@/lib/upload-bestand";
import { verwerkAfficheAfbeelding } from "@/lib/verwerk-affiche-afbeelding";

export async function uploadAffiche(file: File): Promise<string | null> {
  const verwerkt = await verwerkAfficheAfbeelding(file);
  return uploadNaarStorage("affiches", verwerkt);
}
