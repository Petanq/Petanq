import type { Metadata } from "next";
import { getActieveClubs } from "@/lib/data";
import { getClubBeheerData } from "@/lib/club-beheer/data";
import { ClubBeheerProvider } from "@/components/club-beheer/ClubBeheerContext";
import { ClubsBrowser } from "@/components/clubs-browser";

export const metadata: Metadata = {
  title: "Clubs",
  description: "Alle petanqueclubs in Vlaanderen, Wallonië en Brussel, per provincie.",
};

export default async function ClubsPagina() {
  const [clubs, beheerData] = await Promise.all([getActieveClubs(), getClubBeheerData()]);
  return (
    <ClubBeheerProvider data={beheerData}>
      <ClubsBrowser clubs={clubs} />
    </ClubBeheerProvider>
  );
}
