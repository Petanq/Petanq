"use client";

import { useState, type ReactNode } from "react";
import { useTranslation } from "@/lib/language-context";
import {
  DAG_NAMEN_FR,
  DAG_NAMEN_NL,
  MAX_AFWIJKINGEN,
  MAX_AFWIJKING_TEKST,
  MAX_NOTITIE,
  brusselsVandaag,
  seizoenVoor,
  type Afwijking,
  type ClubUren,
  type DagSoort,
  type DagUren,
  type Seizoen,
} from "@/lib/club-beheer/uren";
import "./club-beheer.css";

const LIJN = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const SOORTEN: DagSoort[] = ["open", "competitie", "leden", "tornooi"];

export function Ico({ children }: { children: ReactNode }) {
  return (
    <span className="cb-ico">
      <svg viewBox="0 0 24 24" aria-hidden="true" {...LIJN}>
        {children}
      </svg>
    </span>
  );
}

// Een blok met kop: een eigen kader op de pagina "Mijn club", of een gewone kop binnen een ander formulier (compact).
function Blok({ titel, icoon, compact, children }: { titel: string; icoon: ReactNode; compact: boolean; children: ReactNode }) {
  if (compact) {
    return (
      <div style={{ marginTop: "1.2rem" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.6rem", margin: "0 0 0.7rem", fontSize: "0.95rem", fontWeight: 800 }}>
          {icoon}
          {titel}
        </h3>
        {children}
      </div>
    );
  }
  return (
    <section className="cb-paneel">
      <h2>
        {icoon}
        {titel}
      </h2>
      {children}
    </section>
  );
}

// De openingsuren (zomer/winter, per dag, met soort en opmerking) en de tijdelijke afwijkingen.
// Gebruikt op "Mijn club" en in het formulier "Club bewerken" van de admin.
export function UrenBewerker({
  uren,
  onChange,
  compact = false,
}: {
  uren: ClubUren;
  onChange: (uren: ClubUren) => void;
  compact?: boolean;
}) {
  const { t, taal } = useTranslation();
  const c = t.clubBeheer;
  const dagNamen = taal === "fr" ? DAG_NAMEN_FR : DAG_NAMEN_NL;
  const nuSeizoen = seizoenVoor(brusselsVandaag());
  const [seizoen, setSeizoen] = useState<Seizoen>(nuSeizoen);
  const [uitgeklapt, setUitgeklapt] = useState<Set<string>>(new Set());
  const [info, setInfo] = useState<string | null>(null);

  function zetWeek(s: Seizoen, week: DagUren[]) {
    onChange({ ...uren, [s]: week });
  }

  function zetDag(i: number, wijziging: Partial<DagUren>) {
    zetWeek(seizoen, uren[seizoen].map((d, j) => (j === i ? { ...d, ...wijziging } : d)));
  }

  function gelijkAanVorige(i: number) {
    zetWeek(seizoen, uren[seizoen].map((d, j) => (j === i ? { ...uren[seizoen][i - 1] } : d)));
  }

  function weekdagenGelijk() {
    zetWeek(seizoen, uren[seizoen].map((d, j) => (j < 5 ? { ...uren[seizoen][1] } : d)));
  }

  function kopieerNaarAnder() {
    const ander: Seizoen = seizoen === "zomer" ? "winter" : "zomer";
    zetWeek(ander, uren[seizoen].map((d) => ({ ...d })));
    setInfo(c.kopieerGedaan(ander === "zomer" ? c.zomer : c.winter));
  }

  function zetAfwijking(i: number, wijziging: Partial<Afwijking>) {
    onChange({ ...uren, afwijkingen: uren.afwijkingen.map((a, j) => (j === i ? { ...a, ...wijziging } : a)) });
  }

  const soortLabel: Record<DagSoort, string> = {
    open: c.soortOpen,
    competitie: c.soortCompetitie,
    leden: c.soortLeden,
    tornooi: c.soortTornooi,
  };

  return (
    <div className="cb-scope">
      <Blok
        compact={compact}
        titel={c.urenTitel}
        icoon={
          <Ico>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </Ico>
        }
      >
        <div className="cb-tabs" role="tablist">
          {(["zomer", "winter"] as Seizoen[]).map((s) => (
            <button key={s} type="button" role="tab" className="cb-tab" aria-selected={seizoen === s} onClick={() => setSeizoen(s)}>
              {s === "zomer" ? c.zomer : c.winter}
              {nuSeizoen === s && <span className="cb-nuactief">{c.nuActief}</span>}
            </button>
          ))}
        </div>
        <p className="cb-uitleg">{seizoen === "zomer" ? c.zomerUitleg : c.winterUitleg}</p>
        <div className="cb-hulp">
          <button type="button" className="cb-mini" onClick={kopieerNaarAnder}>
            {c.kopieerNaarAnder}
          </button>
          <button type="button" className="cb-mini" onClick={weekdagenGelijk}>
            {c.weekdagenZelfde}
          </button>
        </div>
        {info && <p className="cb-melding ok">{info}</p>}
        <div>
          {uren[seizoen].map((d, i) => {
            const sleutel = `${seizoen}-${i}`;
            const extra = uitgeklapt.has(sleutel) || d.soort !== "open" || d.notitie !== "";
            return (
              <div className="cb-dag" key={sleutel}>
                <b>{dagNamen[i]}</b>
                <label className="cb-schakel">
                  <input type="checkbox" checked={d.open} aria-label={`${dagNamen[i]}: ${c.openLabel}`} onChange={(e) => zetDag(i, { open: e.target.checked })} />
                  <span />
                </label>
                <div className={"cb-derde" + (d.open ? "" : " uit")}>
                  <div className="cb-tijden">
                    <input type="time" value={d.van} aria-label={`${dagNamen[i]}: ${c.openLabel}`} onChange={(e) => zetDag(i, { van: e.target.value })} />
                    <span>{c.totWoord}</span>
                    <input type="time" value={d.tot} aria-label={`${dagNamen[i]}: ${c.totWoord}`} onChange={(e) => zetDag(i, { tot: e.target.value })} />
                  </div>
                  {d.open && extra && (
                    <div className="cb-notitie">
                      <select value={d.soort} aria-label={c.meerOpties} onChange={(e) => zetDag(i, { soort: e.target.value as DagSoort })}>
                        {SOORTEN.map((s) => (
                          <option key={s} value={s}>
                            {soortLabel[s]}
                          </option>
                        ))}
                      </select>
                      <input type="text" maxLength={MAX_NOTITIE} placeholder={c.notitiePlaceholder} aria-label={c.notitiePlaceholder} value={d.notitie} onChange={(e) => zetDag(i, { notitie: e.target.value })} />
                    </div>
                  )}
                  {d.open && !extra && (
                    <button type="button" className="cb-mini" style={{ alignSelf: "flex-start" }} onClick={() => setUitgeklapt(new Set(uitgeklapt).add(sleutel))}>
                      {c.meerOpties}
                    </button>
                  )}
                  {i > 0 && (
                    <button type="button" className="cb-mini" style={{ alignSelf: "flex-start" }} onClick={() => gelijkAanVorige(i)}>
                      {c.zelfdeAls(dagNamen[i - 1].toLowerCase())}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Blok>

      <Blok
        compact={compact}
        titel={c.afwijkingTitel}
        icoon={
          <Ico>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </Ico>
        }
      >
        <p className="cb-uitleg">{c.afwijkingUitleg}</p>
        {uren.afwijkingen.map((a, i) => (
          <div className="cb-afw-rij" key={i}>
            <div className="cb-veld" style={{ marginBottom: 0 }}>
              <label htmlFor={`cb-av-${i}`}>{c.afwijkingVan}</label>
              <input id={`cb-av-${i}`} type="date" value={a.van} onChange={(e) => zetAfwijking(i, { van: e.target.value })} />
            </div>
            <div className="cb-veld" style={{ marginBottom: 0 }}>
              <label htmlFor={`cb-at-${i}`}>{c.afwijkingTot}</label>
              <input id={`cb-at-${i}`} type="date" value={a.tot} onChange={(e) => zetAfwijking(i, { tot: e.target.value })} />
            </div>
            <div className="cb-veld cb-afw-tekst" style={{ marginBottom: 0 }}>
              <label htmlFor={`cb-ax-${i}`}>{c.afwijkingTekst}</label>
              <input id={`cb-ax-${i}`} type="text" maxLength={MAX_AFWIJKING_TEKST} placeholder={c.afwijkingTekstPlaceholder} value={a.tekst} onChange={(e) => zetAfwijking(i, { tekst: e.target.value })} />
            </div>
            <button type="button" className="cb-mini" onClick={() => onChange({ ...uren, afwijkingen: uren.afwijkingen.filter((_, j) => j !== i) })}>
              {c.afwijkingVerwijder}
            </button>
          </div>
        ))}
        {uren.afwijkingen.length < MAX_AFWIJKINGEN && (
          <button
            type="button"
            className="cb-knop rand"
            onClick={() => {
              const dag = brusselsVandaag();
              onChange({ ...uren, afwijkingen: [...uren.afwijkingen, { van: dag, tot: dag, tekst: "" }] });
            }}
          >
            {c.afwijkingToevoegen}
          </button>
        )}
      </Blok>
    </div>
  );
}
