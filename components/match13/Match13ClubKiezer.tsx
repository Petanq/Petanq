"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/language-context";
import type { EchteClub } from "@/actions/match13-toegang";

// Vervangt een vrij tekstveld door een echte, klikbare dropdown met de
// bestaande clubdirectory — een <datalist> bleek niet duidelijk genoeg als
// klikbare lijst. "Staat de club er niet bij" valt terug op vrije tekst,
// voor een club die nog niet op de website staat.
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
  const [handmatig, setHandmatig] = useState(
    () => value.trim() !== "" && !echteClubs.some((c) => c.naam === value)
  );

  if (handmatig) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={t.match13.naamClubPlaceholder} />
        {echteClubs.length > 0 && (
          <button type="button" className="link-btn" style={{ alignSelf: "flex-start" }} onClick={() => setHandmatig(false)}>
            {t.match13.kiesUitLijst}
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t.match13.kiesClubPlaceholder}</option>
        {echteClubs.map((c) => {
          const aantal = aantalPerNaam.get(c.naam.toLowerCase().trim()) ?? 0;
          return (
            <option key={c.id} value={c.naam}>
              {c.naam} ({c.gemeente}){aantal > 0 ? ` — ${t.match13.aantalUitgenodigd(aantal)}` : ""}
            </option>
          );
        })}
      </select>
      <button type="button" className="link-btn" style={{ alignSelf: "flex-start" }} onClick={() => setHandmatig(true)}>
        {t.match13.clubNietInLijst}
      </button>
    </div>
  );
}
