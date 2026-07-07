import type { Metadata } from "next";
import { TournamentForm } from "@/components/tournament-form";

export const metadata: Metadata = {
  title: "Toernooi toevoegen",
  description: "Meld je petanquetoernooi aan bij PetanQ, de centrale kalender voor België.",
};

export default function ToernooiToevoegenPagina() {
  return <TournamentForm />;
}
