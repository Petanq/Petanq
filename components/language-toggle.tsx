"use client";

import { usePathname, useRouter } from "next/navigation";
import { OPSLAG_SLEUTEL, useTranslation } from "@/lib/language-context";
import type { Taal } from "@/lib/i18n";

// Pagina's die een eigen Franse versie hebben: NL-adres <-> FR-adres.
const NAAR_FR: Record<string, string> = { "/": "/fr", "/clubs": "/fr/clubs" };
const NAAR_NL: Record<string, string> = { "/fr": "/", "/fr/clubs": "/clubs" };

export function LanguageToggle() {
  const { taal, setTaal } = useTranslation();
  const pad = usePathname();
  const router = useRouter();

  function kies(nieuw: Taal) {
    if (nieuw === taal) return;
    const doel = nieuw === "fr" ? NAAR_FR[pad] : NAAR_NL[pad];
    if (doel) {
      try {
        window.localStorage.setItem(OPSLAG_SLEUTEL, nieuw);
      } catch {}
      router.push(doel);
      return;
    }
    setTaal(nieuw);
  }

  return (
    <div className="flex gap-0.5 rounded-lg bg-white/10 p-[3px]">
      <button
        onClick={() => kies("nl")}
        className={`rounded-md px-2 py-1 font-body text-[0.75rem] font-bold transition-colors sm:px-3 sm:text-[0.8rem] ${
          taal === "nl" ? "bg-geel text-donker shadow" : "text-white/50 hover:text-white/80"
        }`}
        aria-pressed={taal === "nl"}
      >
        🇳🇱 NL
      </button>
      <button
        onClick={() => kies("fr")}
        className={`rounded-md px-2 py-1 font-body text-[0.75rem] font-bold transition-colors sm:px-3 sm:text-[0.8rem] ${
          taal === "fr" ? "bg-geel text-donker shadow" : "text-white/50 hover:text-white/80"
        }`}
        aria-pressed={taal === "fr"}
      >
        🇫🇷 FR
      </button>
    </div>
  );
}
