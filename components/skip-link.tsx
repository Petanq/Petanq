"use client";

import { useTranslation } from "@/lib/language-context";

// Eerste tab-stop op elke pagina: laat toetsenbord- en schermlezergebruikers de balk bovenaan overslaan.
// Onzichtbaar tot hij focus krijgt.
export function SkipLink() {
  const { t } = useTranslation();
  return (
    <a
      href="#inhoud"
      className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[1000] focus:rounded-lg focus:bg-geel focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-[#1f1f1f] focus:shadow-lg"
    >
      {t.nav.naarInhoud}
    </a>
  );
}
