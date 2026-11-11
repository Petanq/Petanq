import type { Metadata } from "next";
import { GebruiksvoorwaardenContent } from "@/components/gebruiksvoorwaarden-content";

export const metadata: Metadata = {
  title: "Gebruiksvoorwaarden",
  description: "Wat je met de gegevens van Petanque13 wel en niet mag doen.",
  alternates: { canonical: "/gebruiksvoorwaarden" },
};

export default function GebruiksvoorwaardenPagina() {
  return <GebruiksvoorwaardenContent />;
}
