"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import type { Match13ArchiefRij } from "@/actions/match13-archief";

export function Match13ArchiefList({ items }: { items: Match13ArchiefRij[] }) {
  const { t, taal } = useTranslation();

  return (
    <div className="match13-lijst-pagina">
      <div className="match13-lijst-head">
        <div>
          <nav className="match13-broodkruimel">
            <Link href="/beheer/match13">
              ← Match<span className="m13-gold">13</span>
            </Link>
          </nav>
          <h1>{t.match13.archiefTitel}</h1>
          <p style={{ margin: 0 }}>{t.match13.archiefUitleg}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="match13-lijst-leeg">{t.match13.archiefLeeg}</p>
      ) : (
        <ul className="match13-lijst">
          {items.map((item) => (
            <li key={item.id} className="match13-lijst-rij">
              <Link href={`/beheer/match13/archief/${item.id}`}>
                <span className="match13-lijst-naam">{item.club || t.match13.naamloosToernooi}</span>
                <span className="match13-lijst-datum">
                  {(item.reden === "gewist" ? t.match13.archiefRedenGewist : t.match13.archiefRedenVerwijderd) +
                    " · " +
                    t.match13.archiefGearchiveerd(
                      new Date(item.gearchiveerd_op).toLocaleString(taal === "fr" ? "fr-BE" : "nl-BE")
                    )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
