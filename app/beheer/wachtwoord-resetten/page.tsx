import type { Metadata } from "next";
import { Suspense } from "react";
import { WachtwoordResettenForm } from "@/components/beheer/wachtwoord-resetten-form";

export const metadata: Metadata = {
  title: "Beheer — Wachtwoord resetten",
  robots: { index: false, follow: false },
};

export default function WachtwoordResettenPagina() {
  return (
    <Suspense>
      <WachtwoordResettenForm />
    </Suspense>
  );
}
