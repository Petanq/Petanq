import type { Metadata } from "next";
import { WachtwoordVergetenForm } from "@/components/beheer/wachtwoord-vergeten-form";

export const metadata: Metadata = {
  title: "Beheer — Wachtwoord vergeten",
  robots: { index: false, follow: false },
};

export default function WachtwoordVergetenPagina() {
  return <WachtwoordVergetenForm />;
}
