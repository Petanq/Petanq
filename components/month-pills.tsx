"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { maandVolledig, parseDatum } from "@/lib/datum";

// Eén knop met de gekozen maand ("November 2026" of "Alles") die openklapt tot
// een lijstje waarin je een maand kiest. Vervangt de lange rij maandknoppen,
// die op gsm zijwaarts moest schuiven.
export function MonthPills({
  maandSleutels,
  actieveMaand,
  setActieveMaand,
}: {
  maandSleutels: string[];
  actieveMaand: string | null;
  setActieveMaand: (m: string | null) => void;
}) {
  const { t, taal } = useTranslation();
  const [open, setOpen] = useState(false);
  const houder = useRef<HTMLDivElement>(null);
  const [verschuiving, setVerschuiving] = useState(0);

  // Houd het lijstje binnen het scherm, waar de knop ook staat (links, midden of rechts).
  useLayoutEffect(() => {
    if (!open || !houder.current) return;
    const breedte = Math.min(336, window.innerWidth - 48);
    const rect = houder.current.getBoundingClientRect();
    const links = Math.min(Math.max(rect.right - breedte, 12), window.innerWidth - breedte - 12);
    setVerschuiving(links - rect.left);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function buiten(e: MouseEvent | TouchEvent) {
      if (houder.current && !houder.current.contains(e.target as Node)) setOpen(false);
    }
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", buiten);
    document.addEventListener("touchstart", buiten);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", buiten);
      document.removeEventListener("touchstart", buiten);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  // Meerdere jaren in dezelfde lijst (bv. oude testdata naast lopende toernooien)
  // geven anders identiek ogende opties zoals twee keer "Juli" zonder onderscheid.
  // In het lijstje staat het jaar altijd erbij; dat is korter dan raden.
  function label(sleutel: string): string {
    const maandIndex = parseDatum(`${sleutel}-01`).getMonth();
    return `${maandVolledig(maandIndex, taal)} ${sleutel.slice(0, 4)}`;
  }

  function kies(m: string | null) {
    setActieveMaand(m);
    setOpen(false);
  }

  const optie = (actief: boolean) =>
    `whitespace-nowrap rounded-lg border-[1.5px] px-3 py-2 text-left text-[0.8rem] font-semibold transition-colors active:scale-[0.98] ${
      actief
        ? "border-geel bg-geel text-[#1f1f1f]"
        : "border-[#e3cb87] bg-white text-grijs hover:border-geel hover:bg-[#fdf3d9] hover:text-[#b8860b]"
    }`;

  return (
    <div ref={houder} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-2 rounded-full border-[1.5px] px-3.5 py-1.5 text-[0.8rem] font-semibold transition-all active:scale-95 ${
          actieveMaand
            ? "border-geel bg-geel text-[#1f1f1f] shadow-sm"
            : "border-[#e3cb87] bg-white text-grijs hover:border-geel hover:bg-[#fdf3d9] hover:text-[#b8860b]"
        }`}
      >
        <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
        <span className="whitespace-nowrap">{actieveMaand ? label(actieveMaand) : t.lijst.alle}</span>
        <svg
          viewBox="0 0 24 24"
          width={14}
          height={14}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          style={{ left: verschuiving }}
          className="absolute top-full z-30 mt-2 grid max-h-[22rem] w-[min(21rem,calc(100vw-3rem))] grid-cols-2 gap-1.5 overflow-y-auto rounded-xl border-[1.5px] border-[#e3cb87] bg-white p-2 shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
        >
          <button
            type="button"
            role="option"
            aria-selected={actieveMaand === null}
            onClick={() => kies(null)}
            className={`col-span-2 ${optie(actieveMaand === null)}`}
          >
            {t.lijst.alle}
          </button>
          {maandSleutels.map((sleutel) => (
            <button
              key={sleutel}
              type="button"
              role="option"
              aria-selected={actieveMaand === sleutel}
              onClick={() => kies(sleutel)}
              className={optie(actieveMaand === sleutel)}
            >
              {label(sleutel)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
