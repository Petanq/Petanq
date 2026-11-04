"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { dienVoorstelIn, wisVandaag, zetVandaag, type MijnClub } from "@/actions/club-beheer";
import { heeftIngevuldeUren, leegUren, type ClubGegevens, type ClubUren } from "@/lib/club-beheer/uren";
import { ClubUrenKnop } from "@/components/club-beheer/ClubUrenKnop";
import { UrenBewerker } from "@/components/club-beheer/UrenBewerker";
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

function kopieerUren(uren: ClubUren): ClubUren {
  return JSON.parse(JSON.stringify(uren)) as ClubUren;
}

export function MijnClubFormulier({ club }: { club: MijnClub }) {
  const { t, taal } = useTranslation();
  const c = t.clubBeheer;

  // Wacht er al een voorstel, dan tonen we dat (zodat de club ziet wat ze indiende).
  const [gegevens, setGegevens] = useState<ClubGegevens>({ ...club.gegevens, ...(club.wachtend?.gegevens ?? {}) });
  const [uren, setUren] = useState<ClubUren>(() => kopieerUren(club.wachtend?.uren ?? club.uren ?? leegUren()));
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState<{ soort: "ok" | "fout"; tekst: string } | null>(null);
  const [wachtend, setWachtend] = useState(!!club.wachtend);

  const [vandaag, setVandaag] = useState(club.vandaag);
  const [vandaagReden, setVandaagReden] = useState(club.vandaag?.reden ?? "");
  const [vandaagBezig, setVandaagBezig] = useState(false);

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

          <UrenBewerker uren={uren} onChange={setUren} />

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
