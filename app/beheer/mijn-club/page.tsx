import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth-helpers";
import { getActieveClubs } from "@/lib/data";
import { haalMijnClub, haalMijnClubId } from "@/actions/club-beheer";
import { MijnClubPagina } from "@/components/club-beheer/MijnClubPagina";

export const metadata: Metadata = {
  title: "Mijn club",
  robots: { index: false, follow: false },
};

export default async function MijnClubRoute({ searchParams }: { searchParams: Promise<{ club?: string }> }) {
  const { club: gekozen } = await searchParams;
  const admin = await isAdmin();
  const clubId = await haalMijnClubId(gekozen);

  // De admin kiest eerst een club; een club zonder koppeling krijgt een uitleg.
  if (!clubId) {
    const clubs = admin ? (await getActieveClubs()).map((c) => ({ id: c.id, naam: c.naam, gemeente: c.gemeente })) : undefined;
    return <MijnClubPagina club={null} clubs={clubs} isAdmin={admin} />;
  }

  const club = await haalMijnClub(clubId);
  return <MijnClubPagina club={club} isAdmin={admin} />;
}
