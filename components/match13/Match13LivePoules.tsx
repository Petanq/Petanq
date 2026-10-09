"use client";

import type { ReactNode } from "react";
import { useTranslation } from "@/lib/language-context";
import type { AppState } from "@/lib/match13/state";
import { pouleColor } from "@/lib/match13/types";
import {
  knockoutRanking,
  poulesOf,
  poulesRestRanking,
  usesBarrageBracket,
  winnerLoserOf,
  type KnockoutRankGroep,
} from "@/lib/match13/poules";
import {
  BracketColumns,
  BracketDonkerBlok,
  PiramideKop,
  PouleQualifiersBadge,
  PouleStandingsTable,
  PouleTeamsRij,
  roundRobinStandings,
} from "./BracketWeergave";

// Alleen-lezen weergave van een Poules-toernooi voor de publieke live-pagina:
// de poule-schema's, de knock-outpiramide (en eventueel Piramide B) en het
// eindklassement. Hergebruikt exact dezelfde onderdelen en berekeningen als
// het Klassement-tabblad in de app (BracketWeergave.tsx), zodat wie
// meekijkt hetzelfde ziet als de tafel — alleen zonder knoppen of invoer.
export function Match13LivePoules({ state }: { state: AppState }) {
  const { t } = useTranslation();
  const { teams, pouleBracket, knockoutBracket } = state;
  const knockoutBracketB = state.knockoutBracketB ?? [];

  const numNameOf = (id: string | null): ReactNode => {
    const team = teams.find((x) => x.id === id);
    if (!team) return "?";
    return (
      <>
        <span className="num-gold">{team.number}.</span> {team.name}
      </>
    );
  };

  const pouleTeamsByLabel = poulesOf(teams);
  const pouleLabelsSorted = Array.from(pouleTeamsByLabel.keys()).sort((a, b) => a.localeCompare(b));

  const knockoutStarted = knockoutBracket.length > 0;
  const finalMatch = knockoutBracket[knockoutBracket.length - 1];
  const champion = knockoutStarted && finalMatch ? winnerLoserOf(knockoutBracket, finalMatch.id, "winner") : null;
  const finalMatchB = knockoutBracketB[knockoutBracketB.length - 1];
  const championB =
    knockoutBracketB.length > 0 && finalMatchB ? winnerLoserOf(knockoutBracketB, finalMatchB.id, "winner") : null;

  const eindklassementA = knockoutStarted ? knockoutRanking(knockoutBracket) : [];
  const eindklassementB =
    knockoutBracketB.length > 0
      ? knockoutRanking(knockoutBracketB, (eindklassementA[eindklassementA.length - 1]?.tot ?? 0) + 1)
      : [];
  const eindklassementPiramides = [...eindklassementA, ...eindklassementB];
  const eindklassementRest = poulesRestRanking(
    teams,
    pouleBracket,
    new Set(eindklassementPiramides.flatMap((g) => g.teamIds)),
    (eindklassementPiramides[eindklassementPiramides.length - 1]?.tot ?? 0) + 1
  );
  const eindklassement: KnockoutRankGroep[] = [...eindklassementPiramides, ...eindklassementRest];

  return (
    <div>
      {champion && (
        <div className="finish-banner">
          {t.match13.kampioenLabel} {numNameOf(champion)}!
        </div>
      )}

      <h2 style={{ fontWeight: 800, color: "var(--ink)", margin: "0.8rem 0" }}>{t.match13.poulesHeader}</h2>
      {pouleLabelsSorted.map((label, pi) => {
        const pouleTeams = pouleTeamsByLabel.get(label)!;
        const accent = pouleColor(pi);
        const pouleMatches = pouleBracket.filter((m) => m.poule === label);
        return (
          <BracketDonkerBlok key={label} style={{ marginBottom: "1.8rem" }}>
            <h4 style={{ margin: "0 0 0.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="poule-dot" style={{ background: accent }} />
              {t.match13.pouleLabel(label)}
            </h4>
            <PouleTeamsRij teams={pouleTeams} numNameOf={numNameOf} />
            <div
              className="poule-bracket-rij"
              style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}
            >
              <BracketColumns matches={pouleMatches} numNameOf={numNameOf} simpleWinLoss showConnectors accent={accent} />
              {usesBarrageBracket(pouleTeams.length) && (
                <PouleQualifiersBadge matches={pouleMatches} numNameOf={numNameOf} accent={accent} />
              )}
            </div>
            {!usesBarrageBracket(pouleTeams.length) && (
              <PouleStandingsTable rows={roundRobinStandings(pouleTeams, pouleMatches)} />
            )}
          </BracketDonkerBlok>
        );
      })}

      {knockoutStarted && (
        <BracketDonkerBlok style={{ marginBottom: "1.8rem" }}>
          <PiramideKop label={t.match13.knockoutHeader} />
          <BracketColumns matches={knockoutBracket} numNameOf={numNameOf} showConnectors />
        </BracketDonkerBlok>
      )}

      {knockoutBracketB.length > 0 && (
        <BracketDonkerBlok style={{ marginBottom: "1.8rem" }}>
          <PiramideKop label={t.match13.piramideB} />
          {championB && (
            <div className="finish-banner">
              {t.match13.kampioenPiramideBLabel} {numNameOf(championB)}!
            </div>
          )}
          <BracketColumns matches={knockoutBracketB} numNameOf={numNameOf} showConnectors />
        </BracketDonkerBlok>
      )}

      {eindklassement.length > 0 && (
        <>
          <h2 style={{ fontWeight: 800, color: "var(--ink)", margin: "0.8rem 0" }}>{t.match13.eindklassementHeader}</h2>
          <div className="tabel-scroll">
            <table className="standings">
              <thead>
                <tr>
                  <th className="num">{t.match13.plaatsKolom}</th>
                  <th>{t.match13.teamKolom}</th>
                </tr>
              </thead>
              <tbody>
                {eindklassement.map((groep) => (
                  <tr key={groep.vanaf}>
                    <td className="num">{groep.vanaf === groep.tot ? groep.vanaf : `${groep.vanaf}-${groep.tot}`}</td>
                    <td>
                      {groep.teamIds.length === 0
                        ? "?"
                        : groep.teamIds.map((id, i) => (
                            <span key={id}>
                              {i > 0 && ", "}
                              {numNameOf(id)}
                            </span>
                          ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
