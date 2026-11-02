"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/language-context";

// Duidelijke "← Terug"-knop die enkel op de gsm verschijnt (op groter scherm
// volstaan de broodkruimel en de tegel bovenaan). Stijl: .match13-gsm-terug.
export function Match13TerugKnop({ href }: { href: string }) {
  const { t } = useTranslation();
  return (
    <Link href={href} className="match13-gsm-terug">
      ← {t.match13.terugKnop}
    </Link>
  );
}
