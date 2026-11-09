import type { Metadata } from "next";
import HomePage from "@/app/(site)/page";
import { talenAlternatief } from "@/lib/seo-talen";

const TITEL = "Petanque13 – Le calendrier des tournois de pétanque en Belgique";
const BESCHRIJVING =
  "Tous les tournois de pétanque en Flandre, en Wallonie et à Bruxelles au même endroit. Vérifié par des bénévoles.";

export const metadata: Metadata = {
  title: { absolute: TITEL },
  description: BESCHRIJVING,
  alternates: talenAlternatief("/fr", "/", "/fr"),
  openGraph: { title: TITEL, description: BESCHRIJVING, locale: "fr_BE", alternateLocale: "nl_BE", type: "website", siteName: "Petanque13" },
  twitter: { card: "summary_large_image", title: TITEL, description: BESCHRIJVING },
};

export default HomePage;
