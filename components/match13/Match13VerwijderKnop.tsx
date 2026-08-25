"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { verwijderMatch13Toernooi } from "@/actions/match13";

export function Match13VerwijderKnop({ id, naam }: { id: string; naam: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [bezig, setBezig] = useState(false);

  async function verwijderen() {
    if (!window.confirm(t.match13.verwijderBevestiging(naam || t.match13.naamloosToernooi))) {
      return;
    }
    setBezig(true);
    await verwijderMatch13Toernooi(id);
    setBezig(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      className="match13-lijst-verwijder"
      onClick={verwijderen}
      disabled={bezig}
      aria-label={`${naam || t.match13.naamloosToernooi} — ${t.match13.verwijder}`}
    >
      {bezig ? "..." : t.match13.verwijder}
    </button>
  );
}
