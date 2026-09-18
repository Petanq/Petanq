import type { Metadata } from "next";
import { Suspense } from "react";
import { Match13IntroEnForm } from "@/components/match13-intro-en-form";

export const metadata: Metadata = {
  title: "Match13 — toernooidag-tool",
  description: "Loting, poules, knock-outpiramide, live zaalscherm en klassement — vraag toegang aan voor je club.",
};

export default function Match13Pagina() {
  return (
    <Suspense>
      <Match13IntroEnForm />
    </Suspense>
  );
}
