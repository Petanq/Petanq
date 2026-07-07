import type { Metadata } from "next";
import { Suspense } from "react";
import { ClubForm } from "@/components/club-form";

export const metadata: Metadata = {
  title: "Club voorstellen",
  description: "Stel een petanqueclub voor die nog niet in de lijst staat.",
};

export default function ClubToevoegenPagina() {
  return (
    <Suspense>
      <ClubForm />
    </Suspense>
  );
}
