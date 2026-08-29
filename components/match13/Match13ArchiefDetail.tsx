"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { FORMAT_LABELS } from "@/lib/match13/types";
import { computeStandings, computeMeleeStandings } from "@/lib/match13/standings";
import type { Match13ArchiefItem } from "@/actions/match13-archief";

export function Match13ArchiefDetail({ item }: { item: Match13ArchiefItem }) {
  const { t, taal } = useTranslation();
  const { data } = item;
  const isMeli = data.format === "meli";
  const isPoules = data.format === "poules";

  const standings = isPoules
    ? []
    : isMeli
    ? computeMeleeStandings(data.teams, data.rounds)
    : computeStandings(data.teams, data.rounds);

  const poules = new Map<string, typeof data.teams>();
  if (isPoules) {
    for (const team of data.teams) {
      const label = team.poule ?? "?";
      poules.set(label, [...(poules.get(label) ?? []), team]);
    }
  }

  return (
    <div className="match13-lijst-pagina">
      <div className="match13-lijst-head">
        <div>
          <nav className="match13-broodkruimel">
            <Link href="/beheer/match13/archief">{t.match13.archiefTerug}</Link>
          </nav>
          <h1>{item.club || t.match13.naamloosToernooi}</h1>
          <p style={{ margin: 0 }}>
            {FORMAT_LABELS[data.format]} ·{" "}
            {(item.reden === "gewist" ? t.match13.archiefRedenGewist : t.match13.archiefRedenVerwijderd) +
              " · " +
              t.match13.archiefGearchiveerd(
                new Date(item.gearchiveerd_op).toLocaleString(taal === "fr" ? "fr-BE" : "nl-BE")
              )}
          </p>
        </div>
      </div>

      {isPoules ? (
        <>
          <p className="hint">{t.match13.archiefGeenKlassementPoules}</p>
          {Array.from(poules.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([label, teams]) => (
              <div key={label} className="card" style={{ marginBottom: "1rem" }}>
                <h3 style={{ marginTop: 0 }}>{t.match13.pouleLabel(label)}</h3>
                <ul>
                  {teams.map((team) => (
                    <li key={team.id}>
                      {team.number}. {team.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </>
      ) : (
        <table className="archief-tabel">
          <thead>
            <tr>
              <th className="num">{t.match13.printRangKolom}</th>
              <th>{isMeli ? t.match13.spelerKolom : t.match13.teamKolom}</th>
              <th className="num">{t.match13.gespeeld}</th>
              <th className="num">{t.match13.overwinningen}</th>
              <th className="num">{t.match13.pntVoor}</th>
              <th className="num">{t.match13.pntTegen}</th>
              <th className="num">{t.match13.saldo}</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr key={row.teamId}>
                <td className="rank">{i + 1}</td>
                <td>
                  {row.number}. {row.name}
                </td>
                <td className="num">{row.gespeeld}</td>
                <td className="num">{row.overwinningen}</td>
                <td className="num">{row.puntenVoor}</td>
                <td className="num">{row.puntenTegen}</td>
                <td className="num">{row.saldo > 0 ? `+${row.saldo}` : row.saldo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
