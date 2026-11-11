"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";

// Terug-knop onder het logo op elke pagina behalve de homepage (alleen op gsm). De layout
// blijft staan tussen pagina's door, dus de teller hieronder weet of de
// bezoeker al binnen de site genavigeerd heeft: dan gaat "terug" naar de
// vorige pagina, anders (rechtstreeks binnengekomen via een link of
// Messenger) naar de homepage i.p.v. de site uit.
export function TerugKnop() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const aantalPaginas = useRef(0);

  useEffect(() => {
    aantalPaginas.current += 1;
  }, [pathname]);

  const startPad = pathname.startsWith("/fr") ? "/fr" : "/";
  if (pathname === "/" || pathname === "/fr") return null;

  function terug() {
    if (aantalPaginas.current > 1) router.back();
    else router.push(startPad);
  }

  return (
    // Enkel op gsm: op pc heeft de browser zelf een terug-knop.
    <div className="border-b border-rand bg-white md:hidden">
      <div className="mx-auto max-w-[1140px] px-4 lg:px-10">
        <button
          type="button"
          onClick={terug}
          className="-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 min-h-[44px] text-[0.9rem] font-bold text-blauw transition-colors hover:text-blauw-2 active:bg-black/5"
        >
          <span aria-hidden className="text-xl leading-none">
            ‹
          </span>
          {t.nav.terug}
        </button>
      </div>
    </div>
  );
}
