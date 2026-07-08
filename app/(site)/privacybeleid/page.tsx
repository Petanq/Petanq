import type { Metadata } from "next";
import { PrivacybeleidContent } from "@/components/privacybeleid-content";

export const metadata: Metadata = {
  title: "Privacybeleid",
  description: "Hoe PetanQ omgaat met je persoonsgegevens.",
};

export default function PrivacybeleidPagina() {
  return <PrivacybeleidContent />;
}
