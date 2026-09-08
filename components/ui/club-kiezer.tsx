"use client";

import { useEffect, useRef, useState } from "react";
import { Club } from "@/lib/types";

// Zoek-en-kies-veld voor een bestaande club, i.p.v. een vrij tekstveld waar
// dezelfde club telkens weer anders gespeld kan worden ("PC De Evers" / "PK
// De Evers" / "pc de evers"). Bewust een eigen tekstveld + zelfgestylede
// suggestielijst i.p.v. een native <select> — dat laat op een gsm/tablet niet
// toe om te typen/filteren (zelfde afweging als Match13ClubKiezer).
export function ClubKiezer({
  waarde,
  onWaardeChange,
  onClubGekozen,
  clubs,
  fout,
  placeholder,
}: {
  waarde: string;
  onWaardeChange: (v: string) => void;
  onClubGekozen: (club: Club) => void;
  clubs: Club[];
  fout?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickBuiten(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickBuiten);
    return () => document.removeEventListener("mousedown", onClickBuiten);
  }, []);

  const zoekterm = waarde.trim().toLowerCase();
  const suggesties = (
    zoekterm
      ? clubs.filter((c) => c.naam.toLowerCase().includes(zoekterm) || c.gemeente.toLowerCase().includes(zoekterm))
      : clubs
  ).slice(0, 30);

  return (
    <div className="relative" ref={wrapRef}>
      <input
        value={waarde}
        onChange={(e) => {
          onWaardeChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={`veld-input ${fout ?? ""}`}
      />
      {open && suggesties.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-md border border-rand bg-white shadow-lg">
          {suggesties.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => {
                onClubGekozen(c);
                setOpen(false);
              }}
              className="flex w-full flex-col items-start gap-0.5 border-b border-rand px-3 py-2.5 text-left last:border-b-0 hover:bg-licht active:bg-licht"
            >
              <span className="text-sm font-semibold text-donker">{c.naam}</span>
              <span className="text-xs text-grijs">{c.gemeente}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
