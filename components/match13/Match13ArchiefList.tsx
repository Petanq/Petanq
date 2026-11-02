"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import type { Match13ArchiefLijstRij } from "@/actions/match13-archief";
import { FORMAT_LABELS } from "@/lib/match13/types";
import type { Format } from "@/lib/match13/types";
import { Match13Inklap } from "@/components/match13/Match13Inklap";
import { Match13TerugKnop } from "@/components/match13/Match13TerugKnop";

type ArchiefFilter = "alle" | "eindstand" | "zonder" | "gewist" | "verwijderd";

function maandSleutel(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function Match13ArchiefList({ items }: { items: Match13ArchiefLijstRij[] }) {
  const { t, taal } = useTranslation();
  const locale = taal === "fr" ? "fr-BE" : "nl-BE";
  const [zoek, setZoek] = useState("");
  const [filter, setFilter] = useState<ArchiefFilter>("alle");

  const heeftEindstand = (r: Match13ArchiefLijstRij) => r.gespeeld > 0;
  const zoekSchoon = zoek.trim().toLowerCase();
  const zichtbaar = items.filter((r) => {
    if (filter === "eindstand" && !heeftEindstand(r)) return false;
    if (filter === "zonder" && heeftEindstand(r)) return false;
    if (filter === "gewist" && r.reden !== "gewist") return false;
    if (filter === "verwijderd" && r.reden === "gewist") return false;
    if (!zoekSchoon) return true;
    return (r.club ?? "").toLowerCase().includes(zoekSchoon) || (r.winnaar ?? "").toLowerCase().includes(zoekSchoon);
  });

  const huidigeMaand = maandSleutel(new Date().toISOString());
  const metEindstand = items.filter(heeftEindstand).length;
  const dezeMaand = items.filter((r) => maandSleutel(r.gearchiveerd_op) === huidigeMaand).length;

  // Per maand groeperen (de lijst komt al nieuwste eerst binnen).
  const groepen: { sleutel: string; label: string; rijen: Match13ArchiefLijstRij[] }[] = [];
  for (const rij of zichtbaar) {
    const sleutel = maandSleutel(rij.gearchiveerd_op);
    let groep = groepen.find((g) => g.sleutel === sleutel);
    if (!groep) {
      const maand = new Date(rij.gearchiveerd_op).toLocaleDateString(locale, { month: "long", year: "numeric" });
      groep = { sleutel, label: maand.charAt(0).toUpperCase() + maand.slice(1), rijen: [] };
      groepen.push(groep);
    }
    groep.rijen.push(rij);
  }
  const forceerOpen = zoekSchoon !== "" || filter !== "alle";

  const filters: [ArchiefFilter, string][] = [
    ["alle", t.match13.filterAlle],
    ["eindstand", t.match13.archiefFilterEindstand],
    ["zonder", t.match13.archiefFilterZonder],
    ["verwijderd", t.match13.archiefRedenVerwijderd],
    ["gewist", t.match13.archiefRedenGewist],
  ];

  return (
    <div className="match13-lijst-pagina">
      <Match13TerugKnop href="/beheer/match13" />
      <header className="match13-hero">
        <nav className="match13-broodkruimel">
          <Link href="/beheer/match13">
            ← Match<span className="m13-gold">13</span>
          </Link>
        </nav>
        <h1>{t.match13.archiefTitel}</h1>
        <p>{t.match13.archiefUitleg}</p>
      </header>

      {items.length === 0 ? (
        <p className="match13-lijst-leeg">{t.match13.archiefLeeg}</p>
      ) : (
        <>
          <div className="match13-stats">
            <div className="match13-stat">
              <b>{items.length}</b>
              <span>{t.match13.archiefStatTotaal}</span>
            </div>
            <div className="match13-stat">
              <b>{metEindstand}</b>
              <span>{t.match13.archiefStatEindstand}</span>
            </div>
            <div className="match13-stat">
              <b>{dezeMaand}</b>
              <span>{t.match13.archiefStatMaand}</span>
            </div>
          </div>

          <div className="match13-zoek-kotje">
            <input
              type="search"
              value={zoek}
              onChange={(e) => setZoek(e.target.value)}
              placeholder={t.match13.archiefZoekPlaceholder}
              className="match13-toegang-zoekveld"
            />
            <div className="match13-lijst-filters">
              {filters.map(([sleutel, label]) => (
                <button
                  key={sleutel}
                  type="button"
                  className={"match13-lijst-filter" + (filter === sleutel ? " actief" : "")}
                  onClick={() => setFilter(sleutel)}
                >
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {groepen.length === 0 ? (
            <p className="match13-lijst-leeg">{t.match13.archiefGeenResultaten}</p>
          ) : (
            groepen.map((groep, i) => (
              <Match13Inklap
                key={groep.sleutel}
                titel={`${groep.label} (${groep.rijen.length})`}
                icoon="kalender"
                defaultOpen={i === 0}
                forceOpen={forceerOpen}
              >
                <ul className="archief-kaarten">
                  {groep.rijen.map((item) => {
                    const datum = new Date(item.gearchiveerd_op);
                    const formaat = item.format && item.format in FORMAT_LABELS ? FORMAT_LABELS[item.format as Format] : null;
                    return (
                      <li key={item.id}>
                        <div className="archief-kaart">
                          <span className={"archief-icoon" + (item.winnaar ? " met-winnaar" : "")} aria-hidden="true">
                            {item.winnaar ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M7 4h10v4a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 13v4M8 21h8M10 17h4" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="5" rx="1" />
                                <path d="M5 9v10h14V9M10 13h4" />
                              </svg>
                            )}
                          </span>
                          <span className="archief-info">
                            <span className="archief-naam">{item.club || t.match13.naamloosToernooi}</span>
                            <span className="archief-badges">
                              {formaat && <span className="match13-badge match13-badge-formaat">{formaat}</span>}
                              {item.aantalTeams > 0 && (
                                <span className="match13-badge match13-badge-formaat">
                                  {t.match13.archiefAantalTeams(item.aantalTeams)}
                                </span>
                              )}
                              {item.gespeeld > 0 && (
                                <span className="match13-badge match13-badge-formaat">
                                  {t.match13.archiefAantalWedstrijden(item.gespeeld)}
                                </span>
                              )}
                            </span>
                            <span className={"archief-winnaar" + (item.winnaar ? "" : " leeg")}>
                              {item.winnaar ? (
                                <>
                                  {t.match13.archiefWinnaar}: <strong>{item.winnaar}</strong>
                                </>
                              ) : (
                                t.match13.archiefGeenWedstrijden
                              )}
                            </span>
                          </span>
                          <span className="archief-rechts">
                            <span className="archief-datum" suppressHydrationWarning>
                              {datum.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className="archief-uur" suppressHydrationWarning>
                              {datum.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span
                              className={
                                "match13-badge " + (item.reden === "gewist" ? "match13-badge-test" : "match13-badge-geenclub")
                              }
                            >
                              {item.reden === "gewist" ? t.match13.archiefRedenGewist : t.match13.archiefRedenVerwijderd}
                            </span>
                          </span>
                          {/* de knop is een "stretched link": heel het kaartje blijft klikbaar */}
                          <Link href={`/beheer/match13/archief/${item.id}`} className="archief-knop">
                            {t.match13.archiefBekijk}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M9 6l6 6-6 6" />
                            </svg>
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Match13Inklap>
            ))
          )}
        </>
      )}
    </div>
  );
}
