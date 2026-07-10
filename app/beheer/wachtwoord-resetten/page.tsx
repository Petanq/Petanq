import type { Metadata } from "next";
import { WachtwoordResettenForm } from "@/components/beheer/wachtwoord-resetten-form";

export const metadata: Metadata = {
  title: "Beheer — Wachtwoord resetten",
  robots: { index: false, follow: false },
};

export default function WachtwoordResettenPagina() {
  return <WachtwoordResettenForm />;
}
