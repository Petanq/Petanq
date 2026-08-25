"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { nieuwMatch13Toernooi, type Match13ToernooiRij } from "@/actions/match13";
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
            <li key={tour.id} className="match13-lijst-rij">
              <Link href={`/beheer/match13/${tour.id}`}>
                <span className="match13-lijst-naam">{tour.naam || t.match13.naamloosToernooi}</span>
                <span className="match13-lijst-datum">
                  {t.match13.bijgewerkt(new Date(tour.bijgewerkt_op).toLocaleString(taal === "fr" ? "fr-BE" : "nl-BE"))}
                </span>
              </Link>
              <Match13VerwijderKnop id={tour.id} naam={tour.naam} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
