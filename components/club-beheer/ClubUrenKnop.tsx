"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/language-context";
import {
  DAG_NAMEN_FR,
  DAG_NAMEN_NL,
  actieveAfwijkingen,
  brusselsVandaag,
  dagVoorDatum,
  formatDagUren,
  seizoenVoor,
  weekdagIndex,
  type ClubUren,
  type DagSoort,
} from "@/lib/club-beheer/uren";
import "./club-beheer.css";

export interface VandaagMelding {
  soort: "dicht" | "extra";
  reden: string;
}

function dagenVooruit(isoDatum: string, dagen: number): string {
  const [j, m, d] = isoDatum.split("-").map(Number);
  return new Date(Date.UTC(j, m - 1, d + dagen)).toISOString().slice(0, 10);
}

// De uren-knop op een clubkaartje: toont wat er vandaag geldt, klapt open naar de hele week
// (van het seizoen dat nu loopt), met tijdelijke afwijkingen en een eventuele melding voor vandaag.
// Bewust zonder "nu open/dicht"-bolletje: dat zou fout kunnen zijn als de uren niet precies kloppen.
export function ClubUrenKnop({ uren, vandaag }: { uren: ClubUren | null; vandaag?: VandaagMelding | null }) {
  const { t, taal } = useTranslation();
  const [open, setOpen] = useState(false);
  const c = t.clubBeheer;

  const melding = vandaag ? (
    <div className={"cb-vandaag-tag" + (vandaag.soort === "extra" ? " extra" : "")}>
      {vandaag.soort === "dicht" ? c.kaartVandaagDicht : c.kaartVandaagExtra}
      {vandaag.reden ? ` · ${vandaag.reden}` : ""}
    </div>
  ) : null;

  if (!uren) return melding ? <div className="cb-uren-wrap">{melding}</div> : null;

  const vandaagIso = brusselsVandaag();
  const seizoen = seizoenVoor(vandaagIso);
  const dagIndex = weekdagIndex(vandaagIso);
  const vandaagDag = dagVoorDatum(uren, vandaagIso);
  const dagNamen = taal === "fr" ? DAG_NAMEN_FR : DAG_NAMEN_NL;
  const afwijkingen = [
    ...actieveAfwijkingen(uren, vandaagIso),
    ...uren.afwijkingen.filter((a) => a.van > vandaagIso && a.van <= dagenVooruit(vandaagIso, 30)),
  ];

  const soortLabel: Record<DagSoort, string> = {
    open: c.soortOpen,
    competitie: c.soortCompetitie,
    leden: c.soortLeden,
    tornooi: c.soortTornooi,
  };
  const datumTekst = (iso: string) =>
    new Date(iso + "T12:00:00").toLocaleDateString(taal === "fr" ? "fr-BE" : "nl-BE", { day: "numeric", month: "long" });

  return (
    <div className="cb-uren-wrap">
      {melding}
      <button type="button" className="cb-uren-knop" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <svg className="cb-klok" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        <span suppressHydrationWarning>
          {c.kaartVandaag}: {formatDagUren(vandaagDag, c.gesloten)}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="cb-uren-lijst">
          <dl>
            {uren[seizoen].map((d, i) => (
              <div key={i} style={{ display: "contents" }}>
                <dt className={i === dagIndex ? "vandaag" : undefined}>{dagNamen[i]}</dt>
                <dd>
                  {formatDagUren(d, c.gesloten)}
                  {d.open && d.soort !== "open" && <span className={"cb-tag " + d.soort}>{soortLabel[d.soort]}</span>}
                  {d.open && d.notitie ? ` · ${d.notitie}` : ""}
                </dd>
              </div>
            ))}
          </dl>
          {afwijkingen.map((a, i) => (
            <div key={i} className="cb-afwijking">
              <b>{c.kaartTijdelijkAnders}</b>
              {datumTekst(a.van)} – {datumTekst(a.tot)}: {a.tekst}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
