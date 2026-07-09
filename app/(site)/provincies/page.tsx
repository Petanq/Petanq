import type { Metadata } from "next";
import { getActieveClubs } from "@/lib/data";
import { ProvinciesContent } from "@/components/provincies-content";

export const metadata: Metadata = {
  title: "Provincies",
  description: "Klik op een provincie op de kaart van België om de petanqueclubs daar te bekijken.",
};

export default async function ProvinciesPagina() {
  const clubs = await getActieveClubs();
  const aantalPerProvincie: Record<string, number> = {};
  for (const club of clubs) {
    aantalPerProvincie[club.provincie] = (aantalPerProvincie[club.provincie] ?? 0) + 1;
  }

  return <ProvinciesContent aantalPerProvincie={aantalPerProvincie} />;
}
