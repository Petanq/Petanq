"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

// TIJDELIJK, enkel lokaal: laat de homepage en de clubs-pagina in een paar
// achtergronden zien om te vergelijken. In productie wordt dit component niet
// eens gebruikt (zie app/(site)/layout.tsx).
const VARIANTEN = [
  { id: "licht", label: "Licht" },
  { id: "donker", label: "Donker" },
  { id: "foto", label: "Foto" },
  { id: "goud", label: "Goud" },
] as const;

const SLEUTEL = "p13-proef-bg";

export function AchtergrondProef({ children }: { children: ReactNode }) {
  const pad = usePathname();
  const [actief, setActief] = useState<string>("licht");

  useEffect(() => {
    try {
      setActief(localStorage.getItem(SLEUTEL) ?? "licht");
    } catch {}
  }, []);

  function kies(id: string) {
    setActief(id);
    try {
      localStorage.setItem(SLEUTEL, id);
    } catch {}
  }

  // Match13 en Boulenciel hebben hun eigen (al donkere) opmaak.
  const doetMee = !pad.startsWith("/match13") && !pad.startsWith("/boules");
  const variant = doetMee ? actief : "licht";

  useEffect(() => {
    document.body.dataset.proef = variant;
    return () => {
      delete document.body.dataset.proef;
    };
  }, [variant]);

  return (
    <main className="flex-1">
      {children}
      {doetMee && (
        <div className="fixed bottom-3 left-1/2 z-[500] flex -translate-x-1/2 gap-1 rounded-full bg-black/85 p-1 shadow-lg">
          {VARIANTEN.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => kies(v.id)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[0.72rem] font-bold ${
                actief === v.id ? "bg-geel text-donker" : "text-white/80"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
