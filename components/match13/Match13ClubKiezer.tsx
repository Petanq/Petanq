"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import type { EchteClub } from "@/actions/match13-toegang";

// Een eigen zoekveld i.p.v. een native <select>/<datalist> — die twee bleken
// allebei niet goed genoeg: een <datalist> was niet duidelijk klikbaar, en
// een <select> laat op een gsm niet toe om te typen/filteren, en de
// opengeklapte lijst gebruikt altijd een systeemachtergrond (wit-op-wit-risico
// als de tekstkleur van de context overgeërfd wordt). Dit is gewoon een
// tekstveld — vrij typen werkt dus altijd — met een eigen, volledig
// zelf-gestylede suggestielijst eronder die live filtert.
export function Match13ClubKiezer({
  value,
  onChange,
  echteClubs,
  aantalPerNaam = new Map(),
}: {
  value: string;
  onChange: (v: string) => void;
  echteClubs: EchteClub[];
  aantalPerNaam?: Map<string, number>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickBuiten(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickBuiten);
    return () => document.removeEventListener("mousedown", onClickBuiten);
  }, []);

  const zoekterm = value.trim().toLowerCase();
  const suggesties = (
    zoekterm
      ? echteClubs.filter(
          (c) => c.naam.toLowerCase().includes(zoekterm) || c.gemeente.toLowerCase().includes(zoekterm)
        )
      : echteClubs
  ).slice(0, 30);

  return (
    <div className="match13-club-kiezer" ref={wrapRef}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={t.match13.naamClubPlaceholder}
        autoComplete="off"
      />
      {open && suggesties.length > 0 && (
        <div className="match13-club-suggesties">
          {suggesties.map((c) => {
            const aantal = aantalPerNaam.get(c.naam.toLowerCase().trim()) ?? 0;
            return (
              <button
                type="button"
                key={c.id}
                className="match13-club-suggestie"
                onClick={() => {
                  onChange(c.naam);
                  setOpen(false);
                }}
              >
                <span>{c.naam}</span>
                <span className="hint">
                  {c.gemeente}
                  {aantal > 0 ? ` — ${t.match13.aantalUitgenodigd(aantal)}` : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
