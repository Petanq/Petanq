import type { Metadata } from "next";
import ClubsPagina from "@/app/(site)/clubs/page";
import { talenAlternatief } from "@/lib/seo-talen";

const TITEL = "Clubs de pétanque en Belgique";
const BESCHRIJVING = "Tous les clubs de pétanque en Flandre, en Wallonie et à Bruxelles, par province.";

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHRIJVING,
  alternates: talenAlternatief("/fr/clubs", "/clubs", "/fr/clubs"),
  openGraph: { title: TITEL, description: BESCHRIJVING, locale: "fr_BE", alternateLocale: "nl_BE", type: "website", siteName: "Petanque13" },
};

export default ClubsPagina;
