import type { Metadata } from "next";
import { LoginForm } from "@/components/beheer/login-form";

export const metadata: Metadata = {
  title: "Beheer — Inloggen",
  robots: { index: false, follow: false },
};

export default async function BeheerLoginPagina({
  searchParams,
}: {
  searchParams: Promise<{ link?: string; volgende?: string }>;
}) {
  const { link, volgende } = await searchParams;
  return <LoginForm linkVerlopen={link === "verlopen"} naInloggen={volgende === "match13" ? "/beheer/match13" : "/beheer"} />;
}
