"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { dienVoorstelIn, wisVandaag, zetVandaag, type MijnClub } from "@/actions/club-beheer";
import {
  DAG_NAMEN_FR,
  DAG_NAMEN_NL,
  MAX_AFWIJKINGEN,
  MAX_AFWIJKING_TEKST,
  MAX_NOTITIE,
  brusselsVandaag,
  heeftIngevuldeUren,
  leegUren,
  seizoenVoor,
  type Afwijking,
  type ClubGegevens,
  type ClubUren,
  type DagSoort,
  type DagUren,
  type Seizoen,
} from "@/lib/club-beheer/uren";
import { ClubUrenKnop } from "@/components/club-beheer/ClubUrenKnop";
import "./club-beheer.css";

const LIJN = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Ico({ children }: { children: React.ReactNode }) {
  return (
    <span className="cb-ico">
      <svg viewBox="0 0 24 24" aria-hidden="true" {...LIJN}>
        {children}
      </svg>
    </span>
  );
}

const SOORTEN: DagSoort[] = ["open", "competitie", "leden", "tornooi"];

function kopieerUren(uren: ClubUren): ClubUren {
  return JSON.parse(JSON.stringify(uren)) as ClubUren;
}

export function MijnClubFormulier({ club }: { club: MijnClub }) {
  const { t, taal } = useTranslation();
  const c = t.clubBeheer;
  const dagNamen = taal === "fr" ? DAG_NAMEN_FR : DAG_NAMEN_NL;

  // Wacht er al een voorstel, dan tonen we dat (zodat de club ziet wat ze indiende).
  const [gegevens, setGegevens] = useState<ClubGegevens>({ ...club.gegevens, ...(club.wachtend?.gegevens ?? {}) });
  const [uren, setUren] = useState<ClubUren>(() => kopieerUren(club.wachtend?.uren ?? club.uren ?? leegUren()));
  const [seizoen, setSeizoen] = useState<Seizoen>(() => seizoenVoor(brusselsVandaag()));
  const nuSeizoen = seizoenVoor(brusselsVandaag());
  const [uitgeklapt, setUitgeklapt] = useState<Set<string>>(new Set());
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState<{ soort: "ok" | "fout"; tekst: string } | null>(null);
  const [wachtend, setWachtend] = useState(!!club.wachtend);

  const [vandaag, setVandaag] = useState(club.vandaag);
  const [vandaagReden, setVandaagReden] = useState(club.vandaag?.reden ?? "");
  const [vandaagBezig, setVandaagBezig] = useState(false);

  function zetDag(i: number, wijziging: Partial<DagUren>) {
    setUren((u) => ({ ...u, [seizoen]: u[seizoen].map((d, j) => (j === i ? { ...d, ...wijziging } : d)) }));
  }

  function gelijkAanVorige(i: number) {
    setUren((u) => ({ ...u, [seizoen]: u[seizoen].map((d, j) => (j === i ? { ...u[seizoen][i - 1] } : d)) }));
  }

  function weekdagenGelijk() {
    setUren((u) => ({ ...u, [seizoen]: u[seizoen].map((d, j) => (j < 5 ? { ...u[seizoen][1] } : d)) }));
  }

  function kopieerNaarAnder() {
    const ander: Seizoen = seizoen === "zomer" ? "winter" : "zomer";
    setUren((u) => ({ ...u, [ander]: u[seizoen].map((d) => ({ ...d })) }));
    setMelding({ soort: "ok", tekst: c.kopieerGedaan(ander === "zomer" ? c.zomer : c.winter) });
  }

  function zetAfwijking(i: number, wijziging: Partial<Afwijking>) {
    setUren((u) => ({ ...u, afwijkingen: u.afwijkingen.map((a, j) => (j === i ? { ...a, ...wijziging } : a)) }));
  }

  async function bewaar() {
    setBezig(true);
    setMelding(null);
    const resultaat = await dienVoorstelIn(club.id, { gegevens, uren });
    setBezig(false);
    if (!resultaat.succes) {
      setMelding({ soort: "fout", tekst: resultaat.fout === "nog_niet_beschikbaar" ? c.nogNietBeschikbaar : c.fout });
      return;
    }
    if (resultaat.status === "online") setMelding({ soort: "ok", tekst: c.opgeslagenOnline });
    else if (resultaat.status === "wachtend") {
      setWachtend(true);
      setMelding({ soort: "ok", tekst: c.opgeslagenWachtend });
    } else setMelding({ soort: "ok", tekst: c.geenWijziging });
    if (resultaat.status !== "wachtend") setWachtend(false);
  }

  async function kiesVandaag(soort: "dicht" | "extra") {
    setVandaagBezig(true);
    const resultaat = await zetVandaag(club.id, soort, vandaagReden);
    setVandaagBezig(false);
    if (resultaat.succes) setVandaag({ soort, reden: vandaagReden });
    else setMelding({ soort: "fout", tekst: resultaat.fout === "nog_niet_beschikbaar" ? c.nogNietBeschikbaar : c.fout });
  }

  async function bewaarReden() {
    if (!vandaag || vandaagReden === vandaag.reden) return;
    const resultaat = await zetVandaag(club.id, vandaag.soort, vandaagReden);
    if (resultaat.succes) setVandaag({ ...vandaag, reden: vandaagReden });
  }

  async function ongedaan() {
    setVandaagBezig(true);
    await wisVandaag(club.id);
    setVandaagBezig(false);
    setVandaag(null);
    setVandaagReden("");
  }

  const soortLabel: Record<DagSoort, string> = {
    open: c.soortOpen,
    competitie: c.soortCompetitie,
    leden: c.soortLeden,
    tornooi: c.soortTornooi,
  };

  return (
    <div className="cb-scope">
      <div className={"cb-status" + (wachtend ? " wacht" : "")}>
        <Ico>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </Ico>
        <span>{wachtend ? c.wachtMelding : club.vertrouwd ? c.statusVertrouwd : c.statusNakijken}</span>
      </div>

      <div className="cb-twee">
        <div>
          <section className="cb-paneel">
            <h2>
              <Ico>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </Ico>
              {c.vandaagTitel}
            </h2>
            {!vandaag ? (
              <div className="cb-vandaag-paneel">
                <button type="button" className="cb-groot dicht" disabled={vandaagBezig} onClick={() => kiesVandaag("dicht")}>
                  <b>{c.vandaagDicht}</b>
                  <span>{c.vandaagDichtUitleg}</span>
                </button>
                <button type="button" className="cb-groot extra" disabled={vandaagBezig} onClick={() => kiesVandaag("extra")}>
                  <b>{c.vandaagExtra}</b>
                  <span>{c.vandaagExtraUitleg}</span>
                </button>
              </div>
            ) : (
              <>
                <div className={"cb-vandaag-actief" + (vandaag.soort === "extra" ? " extra" : "")}>
                  <div>
                    <b>{vandaag.soort === "dicht" ? c.vandaagDicht : c.vandaagExtra}</b>
                    <span>{c.vandaagStaatOnline}</span>
                  </div>
                  <button type="button" className="cb-knop rand" disabled={vandaagBezig} onClick={ongedaan}>
                    {c.vandaagOngedaan}
                  </button>
                </div>
                <div className="cb-veld" style={{ marginTop: "0.7rem" }}>
                  <label htmlFor="cb-reden">{c.vandaagRedenLabel}</label>
                  <input
                    id="cb-reden"
                    type="text"
                    maxLength={60}
                    value={vandaagReden}
                    placeholder={c.vandaagRedenPlaceholder}
                    onChange={(e) => setVandaagReden(e.target.value)}
                    onBlur={bewaarReden}
                  />
                </div>
              </>
            )}
          </section>

          <section className="cb-paneel">
            <h2>
              <Ico>
                <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </Ico>
              {c.gegevensTitel}
            </h2>
            <div className="cb-veld">
              <label htmlFor="cb-adres">{c.adres}</label>
              <input id="cb-adres" type="text" autoComplete="street-address" value={gegevens.adres} onChange={(e) => setGegevens({ ...gegevens, adres: e.target.value })} />
            </div>
            <div className="cb-rij2">
              <div className="cb-veld">
                <label htmlFor="cb-mail">{c.email}</label>
                <input id="cb-mail" type="email" autoComplete="email" value={gegevens.contact_email} onChange={(e) => setGegevens({ ...gegevens, contact_email: e.target.value })} />
              </div>
              <div className="cb-veld">
                <label htmlFor="cb-tel">{c.telefoon}</label>
                <input id="cb-tel" type="tel" autoComplete="tel" placeholder={c.telefoonPlaceholder} value={gegevens.telefoon} onChange={(e) => setGegevens({ ...gegevens, telefoon: e.target.value })} />
              </div>
            </div>
            <div className="cb-veld">
              <label htmlFor="cb-web">{c.website}</label>
              <input id="cb-web" type="text" inputMode="url" placeholder="https://" value={gegevens.website} onChange={(e) => setGegevens({ ...gegevens, website: e.target.value })} />
            </div>
          </section>

          <section className="cb-paneel">
            <h2>
              <Ico>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </Ico>
              {c.urenTitel}
            </h2>
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
          </section>

          <section className="cb-paneel">
            <h2>
              <Ico>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </Ico>
              {c.afwijkingTitel}
            </h2>
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
                <button type="button" className="cb-mini" onClick={() => setUren((u) => ({ ...u, afwijkingen: u.afwijkingen.filter((_, j) => j !== i) }))}>
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
                  setUren((u) => ({ ...u, afwijkingen: [...u.afwijkingen, { van: dag, tot: dag, tekst: "" }] }));
                }}
              >
                {c.afwijkingToevoegen}
              </button>
            )}
          </section>

          <div>
            <button type="button" className="cb-knop" disabled={bezig} onClick={bewaar}>
              {bezig ? c.bezig : c.opslaan}
            </button>
            {melding && (
              <p className={"cb-melding " + melding.soort} role="status">
                {melding.tekst}
              </p>
            )}
          </div>
        </div>

        <aside className="cb-sticky">
          <p className="cb-voorbeeld-titel">{c.voorbeeldTitel}</p>
          <div className="cb-kaart">
            <div className="cb-kaart-rij">
              <div className="cb-logo" />
              <div className="cb-kaart-info">
                <div className="cb-kaart-naam">{club.naam}</div>
                <div className="cb-kaart-regel">📍 {gegevens.adres || club.gemeente}</div>
                {gegevens.contact_email && <div className="cb-kaart-regel">✉️ {gegevens.contact_email}</div>}
                {gegevens.telefoon && <div className="cb-kaart-regel">📞 {gegevens.telefoon}</div>}
                <ClubUrenKnop uren={heeftIngevuldeUren(uren) ? uren : null} vandaag={vandaag} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
