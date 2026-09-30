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
import { Match13VerwijderKnop } from "@/components/match13/Match13VerwijderKnop";
import { siteUrl } from "@/lib/site-url";

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
}: {
  toernooien: Match13ToernooiRij[];
  admin: boolean;
  koppelOpties: EigenToernooiOptie[];
}) {
  const { t, taal } = useTranslation();
  const fout = useSearchParams().get("fout");
  // Lokale kopie zodat een wijziging (bv. "afgewerkt" aanvinken) de indeling
  // meteen doet verschuiven, zonder te wachten op een volledige pagina-herlaad.
  const [rows, setRows] = useState(toernooien);

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
      <div className="match13-lijst-head">
        <div>
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
            Match<span className="m13-gold">13</span>
          </h1>
          <p style={{ margin: 0 }}>{t.match13.kiesOfStartNieuw}</p>
        </div>
        <div className="match13-lijst-head-knoppen">
          {admin && (
            <Link href="/beheer/match13/toegang" className="match13-toegang-knop">
              {t.match13.toegangBeherenLink}
            </Link>
          )}
          {admin && (
            <Link href="/beheer/match13/archief" className="match13-toegang-knop">
              {t.match13.archiefLink}
            </Link>
          )}
          <form action={nieuwMatch13Toernooi}>
            <button type="submit" className="match13-nieuw-knop">
              {t.match13.nieuwToernooi}
            </button>
          </form>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="match13-lijst-leeg">{t.match13.nogGeenToernooien}</p>
      ) : (
        <>
          {gepland.length > 0 && (
            <Match13Sectie titel={t.match13.sectieGepland(gepland.length)}>
              {gepland.map((tour) => (
                <Match13LijstRij key={tour.id} tour={tour} taal={taal} onWijzig={wijzigRij} koppelOpties={koppelOpties} />
              ))}
            </Match13Sectie>
          )}

          <Match13Sectie titel={t.match13.sectieLopend(lopend.length)}>
            {lopend.length === 0 ? (
              <p className="match13-lijst-leeg">{t.match13.geenLopendeToernooien}</p>
            ) : (
              lopend.map((tour) => <Match13LijstRij key={tour.id} tour={tour} taal={taal} onWijzig={wijzigRij} koppelOpties={koppelOpties} />)
            )}
          </Match13Sectie>

          {afgewerkt.length > 0 && (
            <details className="match13-lijst-sectie-inklapbaar">
              <summary>{t.match13.sectieAfgewerkt(afgewerkt.length)}</summary>
              <ul className="match13-lijst">
                {afgewerkt.map((tour) => (
                  <Match13LijstRij key={tour.id} tour={tour} taal={taal} onWijzig={wijzigRij} koppelOpties={koppelOpties} />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}

function Match13Sectie({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <details className="match13-lijst-sectie-inklapbaar">
      <summary>{titel}</summary>
      <ul className="match13-lijst">{children}</ul>
    </details>
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
  const [organisator, setOrganisator] = useState(tour.organisator ?? "");
  const [geplandeDatum, setGeplandeDatum] = useState(tour.geplande_datum ?? "");
  const publiekeLink = `${siteUrl()}/live/match13/${tour.id}`;

  return (
    <li className="match13-lijst-rij">
      <div className="match13-lijst-boven">
        <Link href={`/beheer/match13/${tour.id}`}>
          <div className="match13-lijst-naam-blok">
            <span className="match13-lijst-naam">{tour.naam || t.match13.naamloosToernooi}</span>
            {tour.is_test && <span className="match13-badge match13-badge-test">{t.match13.lijstTest}</span>}
            {tour.afgewerkt && (
              <span className="match13-badge match13-badge-afgewerkt">{t.match13.lijstAfgewerkt}</span>
            )}
            {!tour.club && <span className="match13-badge match13-badge-geenclub">{t.match13.lijstGeenClub}</span>}
            {!organisator && (
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
        <input
          type="text"
          className="match13-lijst-organisator"
          value={organisator}
          placeholder={t.match13.lijstOrganisatorPlaceholder}
          onChange={(e) => setOrganisator(e.target.value)}
          onBlur={() => {
            if (organisator !== (tour.organisator ?? "")) onWijzig(tour.id, { organisator });
          }}
        />
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
