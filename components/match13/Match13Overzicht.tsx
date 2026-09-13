"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { nieuwMatch13Toernooi, bewerkMatch13Metadata, type Match13ToernooiRij } from "@/actions/match13";
import { Match13VerwijderKnop } from "@/components/match13/Match13VerwijderKnop";

export function Match13Overzicht({
  toernooien,
  admin,
}: {
  toernooien: Match13ToernooiRij[];
  admin: boolean;
}) {
  const { t, taal } = useTranslation();

  return (
    <div className="match13-lijst-pagina">
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

      {toernooien.length === 0 ? (
        <p className="match13-lijst-leeg">{t.match13.nogGeenToernooien}</p>
      ) : (
        <ul className="match13-lijst">
          {toernooien.map((tour) => (
            <Match13LijstRij key={tour.id} tour={tour} taal={taal} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Match13LijstRij({
  tour,
  taal,
}: {
  tour: Match13ToernooiRij;
  taal: string;
}) {
  const { t } = useTranslation();
  const [isTest, setIsTest] = useState(tour.is_test);
  const [afgewerkt, setAfgewerkt] = useState(tour.afgewerkt);
  const [organisator, setOrganisator] = useState(tour.organisator ?? "");

  async function opslaan(wijziging: { is_test?: boolean; afgewerkt?: boolean; organisator?: string }) {
    await bewerkMatch13Metadata(tour.id, wijziging);
  }

  return (
    <li className="match13-lijst-rij">
      <div className="match13-lijst-boven">
        <Link href={`/beheer/match13/${tour.id}`}>
          <div className="match13-lijst-naam-blok">
            <span className="match13-lijst-naam">{tour.naam || t.match13.naamloosToernooi}</span>
            {isTest && <span className="match13-badge match13-badge-test">{t.match13.lijstTest}</span>}
            {afgewerkt && (
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
            checked={isTest}
            onChange={(e) => {
              setIsTest(e.target.checked);
              void opslaan({ is_test: e.target.checked });
            }}
          />
          {t.match13.lijstMarkeerTest}
        </label>
        <label className="match13-lijst-checkbox">
          <input
            type="checkbox"
            checked={afgewerkt}
            onChange={(e) => {
              setAfgewerkt(e.target.checked);
              void opslaan({ afgewerkt: e.target.checked });
            }}
          />
          {t.match13.lijstMarkeerAfgewerkt}
        </label>
        <input
          type="text"
          className="match13-lijst-organisator"
          value={organisator}
          placeholder={t.match13.lijstOrganisatorPlaceholder}
          onChange={(e) => setOrganisator(e.target.value)}
          onBlur={() => {
            if (organisator !== (tour.organisator ?? "")) void opslaan({ organisator });
          }}
        />
      </div>
    </li>
  );
}
