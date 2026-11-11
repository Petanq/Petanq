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
    <div className="flex gap-0.5 overflow-hidden rounded-lg bg-white/10" role="group" aria-label="Taal / Langue">
      <button
        onClick={() => kies("nl")}
        lang="nl"
        className={`flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-2 max-[359px]:px-1.5 font-body text-[0.75rem] font-bold transition-colors sm:px-3 sm:text-[0.8rem] ${
          taal === "nl" ? "bg-geel text-donker shadow" : "text-white/70 hover:text-white"
        }`}
        aria-pressed={taal === "nl"}
      >
        🇳🇱 NL
      </button>
      <button
        onClick={() => kies("fr")}
        lang="fr"
        className={`flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-2 max-[359px]:px-1.5 font-body text-[0.75rem] font-bold transition-colors sm:px-3 sm:text-[0.8rem] ${
          taal === "fr" ? "bg-geel text-donker shadow" : "text-white/70 hover:text-white"
        }`}
        aria-pressed={taal === "fr"}
      >
        🇫🇷 FR
      </button>
    </div>
  );
}
