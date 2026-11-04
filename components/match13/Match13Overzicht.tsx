"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import {
  nieuwMatch13Toernooi,
  bewerkMatch13Metadata,
  type Match13ToernooiRij,
  type EigenToernooiOptie,
} from "@/actions/match13";
import { Match13Inklap, type InklapIcoon } from "@/components/match13/Match13Inklap";
import { markeerNieuweClubAfgehandeld, type NieuweClubMelding } from "@/actions/match13-clubs";
import { Match13VerwijderKnop } from "@/components/match13/Match13VerwijderKnop";
import { siteUrl } from "@/lib/site-url";
import { FORMAT_LABELS } from "@/lib/match13/types";
import { isGeldigeOrganisator, splitsOrganisator, voegOrganisatorSamen } from "@/lib/match13/organisator";
import type { Format } from "@/lib/match13/types";
import { CLUBS_MOGEN_ZELF_BEHEREN } from "@/lib/club-beheer/instellingen";

type Wijziging = {
  is_test?: boolean;
  afgewerkt?: boolean;
  organisator?: string;
  geplande_datum?: string | null;
  live_delen?: boolean;
  toernooi_id?: string | null;
};

// "YYYY-MM-DD" in de lokale tijdzone (niet toISOString: die geeft UTC, wat
// rond middernacht een dag kan verschuiven t.o.v. de geplande_datum die de
// gebruiker letterlijk zo intikte).
function vandaagLokaal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function Match13Overzicht({
  toernooien,
  admin,
  koppelOpties,
  nieuweClubs = [],
  teKeuren = 0,
}: {
  toernooien: Match13ToernooiRij[];
  admin: boolean;
  koppelOpties: EigenToernooiOptie[];
  nieuweClubs?: NieuweClubMelding[];
  teKeuren?: number;
}) {
  const { t, taal } = useTranslation();
  const fout = useSearchParams().get("fout");
  // Lokale kopie zodat een wijziging (bv. "afgewerkt" aanvinken) de indeling
  // meteen doet verschuiven, zonder te wachten op een volledige pagina-herlaad.
  const [rows, setRows] = useState(toernooien);
  const [meldingen, setMeldingen] = useState(nieuweClubs);

  function clubAfhandelen(id: string) {
    setMeldingen((prev) => prev.filter((m) => m.id !== id));
    void markeerNieuweClubAfgehandeld(id);
  }

  function wijzigRij(id: string, wijziging: Wijziging) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...wijziging } : r)));
    void bewerkMatch13Metadata(id, wijziging);
  }

  const vandaag = vandaagLokaal();
  const gepland = rows
    .filter((r) => !r.afgewerkt && !!r.geplande_datum && r.geplande_datum > vandaag)
    .sort((a, b) => (a.geplande_datum ?? "").localeCompare(b.geplande_datum ?? ""));
  const lopend = rows.filter((r) => !r.afgewerkt && !(!!r.geplande_datum && r.geplande_datum > vandaag));
  const afgewerkt = rows.filter((r) => r.afgewerkt);

  return (
    <div className="match13-lijst-pagina">
      {fout === "aanmaken_mislukt" && (
        <p className="match13-fout-banner">{t.match13.nieuwToernooiMislukt}</p>
      )}
      <header className="match13-hero">
        {admin && (
          <nav className="match13-broodkruimel">
            <Link href="/beheer">← {t.match13.beheerWoord}</Link>
            <span>/</span>
            <span className="huidig">
              Match<span className="m13-gold">13</span>
            </span>
          </nav>
        )}
        <h1>
          {t.match13.heroTitelEen}
          <em>{t.match13.heroTitelTwee}</em>
        </h1>
        <p>{t.match13.kiesOfStartNieuw}</p>
      </header>

      <div className="match13-tegels">
        <Link href={admin ? "/beheer" : "/"} className="match13-tegel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          <span className="match13-tegel-titel">{t.match13.terugKnop}</span>
          <span className="match13-tegel-pijl" aria-hidden="true">›</span>
        </Link>
        {admin && (
          <Link href="/beheer/match13/toegang" className="match13-tegel">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="8" r="3.2" />
              <path d="M5.5 19c0-3.4 2.9-5.6 6.5-5.6s6.5 2.2 6.5 5.6z" />
              <circle cx="5" cy="9.5" r="2.2" />
              <circle cx="19" cy="9.5" r="2.2" />
            </svg>
            <span className="match13-tegel-titel">{t.match13.toegangBeherenLink.replace(" →", "")}</span>
            <span className="match13-tegel-pijl" aria-hidden="true">›</span>
          </Link>
        )}
        {admin && (
          <Link href="/beheer/match13/archief" className="match13-tegel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="5" rx="1" />
              <path d="M5 9v10h14V9M10 13h4" />
            </svg>
            <span className="match13-tegel-titel">{t.match13.archiefLink.replace(" →", "")}</span>
            <span className="match13-tegel-pijl" aria-hidden="true">›</span>
          </Link>
        )}
        {(admin || CLUBS_MOGEN_ZELF_BEHEREN) && (
        <Link href="/beheer/mijn-club" className="match13-tegel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 20V10l8-6 8 6v10M9 20v-6h6v6" />
          </svg>
          <span className="match13-tegel-titel">{t.clubBeheer.titel}</span>
          <span className="match13-tegel-pijl" aria-hidden="true">›</span>
        </Link>
        )}
        {admin && (
          <Link href="/beheer/club-wijzigingen" className="match13-tegel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
            <span className="match13-tegel-titel">{t.clubBeheer.keurTegel}</span>
            {teKeuren > 0 && <span className="match13-tegel-teller">{teKeuren}</span>}
            <span className="match13-tegel-pijl" aria-hidden="true">›</span>
          </Link>
        )}
        <form action={nieuwMatch13Toernooi} className="match13-tegel-form">
          <button type="submit" className="match13-tegel match13-tegel-hoofd">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 7v10M7 12h10" stroke="#1a1a1a" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            <span className="match13-tegel-titel">{t.match13.nieuwToernooi.replace("+ ", "")}</span>
            <span className="match13-tegel-pijl" aria-hidden="true">›</span>
          </button>
        </form>
      </div>

      {admin && meldingen.length > 0 && (
        <Match13Inklap titel={t.match13.nieuweClubsTitel(meldingen.length)} icoon="wacht" defaultOpen>
          <ul className="match13-lijst">
            {meldingen.map((m) => (
              <li key={m.id} className="match13-lijst-rij nieuwe-club-rij">
                <div className="nieuwe-club-info">
                  <span className="match13-lijst-naam">{m.naam}</span>
                  <span className="match13-lijst-club">{m.gemeente}</span>
                  <span className="match13-lijst-datum">{new Date(m.aangemaakt_op).toLocaleDateString(taal === "fr" ? "fr-BE" : "nl-BE")}</span>
                </div>
                <div className="nieuwe-club-acties">
                  {m.toernooi_id && (
                    <Link href={`/beheer/match13/${m.toernooi_id}`} className="match13-actie-knop">
                      {t.match13.nieuweClubBekijk}
                    </Link>
                  )}
                  <button type="button" className="match13-actie-knop" onClick={() => clubAfhandelen(m.id)}>
                    {t.match13.nieuweClubAfgehandeld}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Match13Inklap>
      )}

      {rows.length === 0 ? (
        <p className="match13-lijst-leeg">{t.match13.nogGeenToernooien}</p>
      ) : (
        <>
          {gepland.length > 0 && (
            <Match13Sectie titel={t.match13.sectieGepland(gepland.length)} icoon="kalender">
              {gepland.map((tour) => (
                <Match13LijstRij key={tour.id} tour={tour} taal={taal} onWijzig={wijzigRij} koppelOpties={koppelOpties} />
              ))}
            </Match13Sectie>
          )}

          <Match13Sectie titel={t.match13.sectieLopend(lopend.length)} icoon="lopend">
            {lopend.length === 0 ? (
              <p className="match13-lijst-leeg">{t.match13.geenLopendeToernooien}</p>
            ) : (
              lopend.map((tour) => <Match13LijstRij key={tour.id} tour={tour} taal={taal} onWijzig={wijzigRij} koppelOpties={koppelOpties} />)
            )}
          </Match13Sectie>

          {afgewerkt.length > 0 && (
            <Match13Sectie titel={t.match13.sectieAfgewerkt(afgewerkt.length)} icoon="klaar">
              {afgewerkt.map((tour) => (
                <Match13LijstRij key={tour.id} tour={tour} taal={taal} onWijzig={wijzigRij} koppelOpties={koppelOpties} />
              ))}
            </Match13Sectie>
          )}
        </>
      )}
    </div>
  );
}

function Match13Sectie({ titel, icoon, children }: { titel: string; icoon: InklapIcoon; children: ReactNode }) {
  return (
    <Match13Inklap titel={titel} icoon={icoon}>
      <ul className="match13-lijst">{children}</ul>
    </Match13Inklap>
  );
}

function Match13LijstRij({
  tour,
  taal,
  onWijzig,
  koppelOpties,
}: {
  tour: Match13ToernooiRij;
  taal: string;
  onWijzig: (id: string, wijziging: Wijziging) => void;
  koppelOpties: EigenToernooiOptie[];
}) {
  const { t } = useTranslation();
  const [orgVoornaam, setOrgVoornaam] = useState(() => splitsOrganisator(tour.organisator).voornaam);
  const [orgNaam, setOrgNaam] = useState(() => splitsOrganisator(tour.organisator).naam);
  const [organisatorFout, setOrganisatorFout] = useState(false);
  const [geplandeDatum, setGeplandeDatum] = useState(tour.geplande_datum ?? "");
  const publiekeLink = `${siteUrl()}/live/match13/${tour.id}`;

  return (
    <li className="match13-lijst-rij">
      <div className="match13-lijst-boven">
        <Link href={`/beheer/match13/${tour.id}`}>
          <div className="match13-lijst-naam-blok">
            <span className="match13-lijst-naam">{tour.naam || t.match13.naamloosToernooi}</span>
            {tour.speltype && tour.speltype in FORMAT_LABELS && (
              <span className="match13-badge match13-badge-formaat">{FORMAT_LABELS[tour.speltype as Format]}</span>
            )}
            {tour.is_test && <span className="match13-badge match13-badge-test">{t.match13.lijstTest}</span>}
            {tour.afgewerkt && (
              <span className="match13-badge match13-badge-afgewerkt">{t.match13.lijstAfgewerkt}</span>
            )}
            {!tour.club && <span className="match13-badge match13-badge-geenclub">{t.match13.lijstGeenClub}</span>}
            {!isGeldigeOrganisator(tour.organisator) && (
              <span className="match13-badge match13-badge-geenclub">{t.match13.lijstGeenOrganisator}</span>
            )}
          </div>
          <span className="match13-lijst-datum">
            {t.match13.bijgewerkt(new Date(tour.bijgewerkt_op).toLocaleString(taal === "fr" ? "fr-BE" : "nl-BE"))}
          </span>
        </Link>
        <Match13VerwijderKnop id={tour.id} naam={tour.naam} />
      </div>
      <div className="match13-lijst-meta">
        {tour.club && <span className="match13-lijst-club">{tour.club}</span>}
        <label className="match13-lijst-checkbox">
          <input
            type="checkbox"
            checked={tour.is_test}
            onChange={(e) => onWijzig(tour.id, { is_test: e.target.checked })}
          />
          {t.match13.lijstMarkeerTest}
        </label>
        <label className="match13-lijst-checkbox">
          <input
            type="checkbox"
            checked={tour.afgewerkt}
            onChange={(e) => onWijzig(tour.id, { afgewerkt: e.target.checked })}
          />
          {t.match13.lijstMarkeerAfgewerkt}
        </label>
        <label className="match13-lijst-datum-veld">
          {t.match13.geplandeDatumLabel}
          <input
            type="date"
            value={geplandeDatum}
            onChange={(e) => setGeplandeDatum(e.target.value)}
            onBlur={() => {
              if (geplandeDatum !== (tour.geplande_datum ?? "")) {
                onWijzig(tour.id, { geplande_datum: geplandeDatum || null });
              }
            }}
          />
        </label>
        <div
          className="organisator-velden organisator-velden-rij"
          onBlur={(e) => {
            // pas controleren/bewaren als de focus uit beide velden is
            if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
            const samen = voegOrganisatorSamen(orgVoornaam, orgNaam);
            // Verplicht: voornaam én naam. Een ongeldige invoer wordt niet bewaard.
            if (!isGeldigeOrganisator(samen)) {
              setOrganisatorFout(true);
              const oud = splitsOrganisator(tour.organisator);
              setOrgVoornaam(oud.voornaam);
              setOrgNaam(oud.naam);
              return;
            }
            const oudeWaarde = voegOrganisatorSamen(...(Object.values(splitsOrganisator(tour.organisator)) as [string, string]));
            if (samen !== oudeWaarde) onWijzig(tour.id, { organisator: samen });
          }}
        >
          <input
            type="text"
            className="match13-lijst-organisator"
            value={orgVoornaam}
            placeholder={t.match13.organisatorVoornaam}
            aria-label={t.match13.organisatorVoornaam}
            autoComplete="given-name"
            style={organisatorFout ? { borderColor: "var(--warn)" } : undefined}
            onChange={(e) => {
              setOrgVoornaam(e.target.value);
              setOrganisatorFout(false);
            }}
          />
          <input
            type="text"
            className="match13-lijst-organisator"
            value={orgNaam}
            placeholder={t.match13.organisatorNaam}
            aria-label={t.match13.organisatorNaam}
            autoComplete="family-name"
            style={organisatorFout ? { borderColor: "var(--warn)" } : undefined}
            onChange={(e) => {
              setOrgNaam(e.target.value);
              setOrganisatorFout(false);
            }}
          />
        </div>
        {organisatorFout && <span className="match13-lijst-hint">{t.match13.organisatorOngeldig}</span>}
      </div>
      <div className="match13-lijst-meta">
        <label className="match13-lijst-checkbox">
          <input
            type="checkbox"
            checked={tour.live_delen}
            onChange={(e) => onWijzig(tour.id, { live_delen: e.target.checked })}
          />
          {t.match13.liveDelenLabel}
        </label>
        {tour.live_delen && !tour.toernooi_id && (
          <select
            className="match13-lijst-organisator"
            defaultValue=""
            onChange={(e) => e.target.value && onWijzig(tour.id, { toernooi_id: e.target.value })}
          >
            <option value="" disabled>
              {t.match13.liveKoppelPlaceholder}
            </option>
            {koppelOpties.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.clubnaam ? `${opt.clubnaam} — ${opt.naam_nl} — ${opt.datum}` : `${opt.naam_nl} — ${opt.datum}`}
              </option>
            ))}
          </select>
        )}
        {tour.live_delen && tour.toernooi_id && (
          <span className="match13-lijst-datum">
            {t.match13.liveLinkLabel} <code>{publiekeLink}</code>
          </span>
        )}
      </div>
      {tour.live_delen && <p className="match13-lijst-hint">{t.match13.liveDelenHint}</p>}
    </li>
  );
}
