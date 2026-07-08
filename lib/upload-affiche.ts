import { uploadNaarStorage } from "@/lib/upload-bestand";

export function uploadAffiche(file: File): Promise<string | null> {
  return uploadNaarStorage("affiches", file);
}
