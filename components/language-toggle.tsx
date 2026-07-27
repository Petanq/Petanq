"use client";

import { useTranslation } from "@/lib/language-context";

export function LanguageToggle() {
  const { taal, setTaal } = useTranslation();

  return (
    <div className="flex gap-0.5 rounded-lg bg-white/10 p-[3px]">
      <button
        onClick={() => setTaal("nl")}
        className={`rounded-md px-2 py-1 font-body text-[0.75rem] font-bold transition-colors sm:px-3 sm:text-[0.8rem] ${
          taal === "nl" ? "bg-geel text-donker shadow" : "text-white/50 hover:text-white/80"
        }`}
        aria-pressed={taal === "nl"}
      >
        🇳🇱 NL
      </button>
      <button
        onClick={() => setTaal("fr")}
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
