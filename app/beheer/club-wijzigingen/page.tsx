import type { Metadata } from "next";
import { haalTeKeuren } from "@/actions/club-beheer";
import { ClubWijzigingenLijst } from "@/components/club-beheer/ClubWijzigingenLijst";

export const metadata: Metadata = {
  title: "Wijzigingen van clubs",
  robots: { index: false, follow: false },
};

export default async function ClubWijzigingenPagina() {
  const items = await haalTeKeuren();
  return <ClubWijzigingenLijst items={items} />;
}
