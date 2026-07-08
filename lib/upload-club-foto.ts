import { uploadNaarStorage } from "@/lib/upload-bestand";

export function uploadClubFoto(file: File): Promise<string | null> {
  return uploadNaarStorage("club-fotos", file);
}
