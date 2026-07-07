import type { Metadata } from "next";
import { getActieveClubs } from "@/lib/data";
import { ClubsBrowser } from "@/components/clubs-browser";

export const metadata: Metadata = {
  title: "Clubs",
  description: "Alle petanqueclubs in Vlaanderen, Wallonië en Brussel, per provincie.",
};

export default async function ClubsPagina() {
  const clubs = await getActieveClubs();
  return <ClubsBrowser clubs={clubs} />;
}
