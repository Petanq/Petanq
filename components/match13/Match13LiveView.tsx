"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "@/lib/language-context";
import { haalMatch13ToernooiVoorPubliek, type Match13LivePubliek } from "@/actions/match13";
import { pouleColor } from "@/lib/match13/types";
import type { Match, Team } from "@/lib/match13/types";
import { computeMeleeStandings, computeStandings } from "@/lib/match13/standings";
import { Match13LivePoules } from "./Match13LivePoules";
import "./match13.css";

const VERVERS_INTERVAL_MS = 10_000;

function zijdeNaam(teams: Team[], m: Match, kant: "A" | "B"): string {
  const spelerIds = kant === "A" ? m.playersA : m.playersB;
  if (spelerIds) {
    return spelerIds.map((id) => teams.find((t) => t.id === id)?.name ?? "?").join(" & ");
  }
  const teamId = kant === "A" ? m.teamA : m.teamB;
  if (!teamId) return "—";
  const naam = teams.find((t) => t.id === teamId)?.name ?? "?";
  const alleenNaam = kant === "A" ? m.alleenNaamA : m.alleenNaamB;
  return alleenNaam ? `${naam} (${alleenNaam})` : naam;
}

// Live-weergave is bewust alleen-lezen en herbruikt geen enkele bewerk-state
// uit Match13App.tsx (geen risico dat een bezoeker per ongeluk iets zou
// kunnen wijzigen) — dit is een eigen, veel kleinere renderer die enkel de
// huidige ronde toont. De kaartjes hergebruiken wel dezelfde
// .court-card/.court-label/.match-row-klassen (en pleinkleuren) als het
// echte Zaalscherm, zodat wie meekijkt hetzelfde beeld ziet als de tafel
// zelf. Een Poules-toernooi krijgt zijn eigen weergave (Match13LivePoules).
export function Match13LiveView({ id, initieel }: { id: string; initieel: Match13LivePubliek }) {
  const { t, taal } = useTranslation();
  const [live, setLive] = useState(initieel);
  const [verdwenen, setVerdwenen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const vers = await haalMatch13ToernooiVoorPubliek(id);
      if (!vers) {
        setVerdwenen(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      setLive(vers);
    }, VERVERS_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  if (verdwenen) {
    return (
      <div className="match13-scope">
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <p className="text-lg font-semibold text-grijs">{t.match13.liveNietMeerBeschikbaar}</p>
        </div>
      </div>
    );
  }

  const { state } = live;
  // Nieuwste ronde eerst — dat is wat een meekijkende bezoeker het vaakst
  // wil zien, terwijl de vorige rondes gewoon eronder blijven staan i.p.v.
  // te verdwijnen zodra een nieuwe ronde start.
  const rondesNieuwsteEerst = [...state.rounds].reverse();
  // Zelfde berekening als het klassement-tabblad in de app zelf, zodat de
  // eindstand hier nooit afwijkt van wat de tafel ziet.
  const klassement =
    state.format === "meli"
      ? computeMeleeStandings(state.teams, state.rounds)
      : computeStandings(state.teams, state.rounds);
  const bijgewerkt = new Date(live.bijgewerktOp).toLocaleTimeString(taal === "fr" ? "fr-BE" : "nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="match13-scope">
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
        <div
          style={{
            background: "var(--header-bg)",
            color: "var(--header-ink)",
            border: "1.5px solid var(--accent)",
            boxShadow: "0 4px 18px rgba(0,0,0,0.35)",
            borderRadius: 18,
            padding: "1.8rem 1.5rem",
            textAlign: "center",
            marginBottom: "1.6rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.7rem", marginBottom: "1rem" }}>
            <img
              className="mark"
              src="/images/logo-icon.png"
              alt="Match13"
              style={{
                width: 44,
                height: 44,
                filter: "drop-shadow(0 0 6px rgba(244,196,48,0.55))",
              }}
            />
            <span className="wordmark" style={{ fontSize: "1.7rem" }}>
              Match<span className="m13-gold">13</span>
            </span>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(255,255,255,0.1)",
              color: "var(--accent)",
              borderRadius: 999,
              padding: "0.3rem 0.8rem",
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <span style={{ position: "relative", display: "inline-flex", width: "0.5rem", height: "0.5rem" }}>
              {!live.afgewerkt && (
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 999,
                    background: "var(--warn)",
                    animation: "match13-live-ping 1.4s cubic-bezier(0,0,0.2,1) infinite",
                  }}
                />
              )}
              <span
                style={{
                  position: "relative",
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: 999,
                  background: live.afgewerkt ? "var(--accent)" : "var(--warn)",
                }}
              />
            </span>
            {live.afgewerkt ? t.match13.liveEindstand : t.match13.liveBadge}
          </span>
          <h1 style={{ margin: "0.6rem 0 0.1rem", fontWeight: 800, fontSize: "1.7rem" }}>
            {live.club || live.naam}
          </h1>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
            {t.match13.liveBijgewerktOm(bijgewerkt)}
          </p>
        </div>

        {state.format === "poules" ? (
          state.pouleBracket.length === 0 ? (
            <p className="hint" style={{ textAlign: "center", padding: "2rem" }}>
              {t.match13.liveNogNietBegonnen}
            </p>
          ) : (
            <Match13LivePoules state={state} />
          )
        ) : rondesNieuwsteEerst.length === 0 ? (
          <p className="hint" style={{ textAlign: "center", padding: "2rem" }}>
            {t.match13.liveNogNietBegonnen}
          </p>
        ) : (
          rondesNieuwsteEerst.map((ronde) => (
            <div key={ronde.number} style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontWeight: 800, color: "var(--ink)", marginBottom: "0.8rem" }}>
                {t.match13.liveRondeTitel(ronde.number)}
              </h2>
              <div
                className="court-grid"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gridAutoFlow: "row" }}
              >
                {[...ronde.matches]
                  .sort((a, b) => a.court - b.court)
                  .map((m, i) => {
                    const gespeeld = m.scoreA !== undefined && m.scoreB !== undefined;
                    const naamStijl: CSSProperties = {
                      flex: 1,
                      minWidth: 0,
                      fontSize: "1.3rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    };
                    return (
                      <div key={i} className="court-card" style={{ "--plein-accent": pouleColor(m.court - 1) } as CSSProperties}>
                        <div className="court-label">{t.match13.liveePleinKort(m.court)}</div>
                        <div className="match-row">
                          <span style={naamStijl}>{zijdeNaam(state.teams, m, "A")}</span>
                          <span
                            style={
                              gespeeld
                                ? {
                                    flex: "0 0 auto",
                                    fontVariantNumeric: "tabular-nums",
                                    color: "var(--accent-ink)",
                                    fontSize: "1.4rem",
                                    fontWeight: 800,
                                    border: "1.5px solid var(--accent)",
                                    background: "color-mix(in srgb, var(--accent) 15%, white)",
                                    borderRadius: 10,
                                    padding: "0.15rem 0.6rem",
                                  }
                                : {
                                    flex: "0 0 auto",
                                    fontVariantNumeric: "tabular-nums",
                                    color: "var(--ink-muted)",
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                  }
                            }
                          >
                            {gespeeld ? `${m.scoreA} – ${m.scoreB}` : t.match13.liveNogTeSpelen}
                          </span>
                          <span style={{ ...naamStijl, textAlign: "right" }}>{zijdeNaam(state.teams, m, "B")}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))
        )}

        {state.format !== "poules" && rondesNieuwsteEerst.length > 0 && klassement.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h2 style={{ fontWeight: 800, color: "var(--ink)", marginBottom: "0.8rem" }}>
              {t.match13.klassementTitel}
            </h2>
            <div className="tabel-scroll">
              <table className="standings">
                <thead>
                  <tr>
                    <th></th>
                    <th>{state.format === "meli" ? t.match13.spelerKolom : t.match13.teamKolom}</th>
                    <th className="num">{t.match13.gespeeld}</th>
                    <th className="num">{t.match13.overwinningen}</th>
                    <th className="num">{t.match13.pntVoor}</th>
                    <th className="num">{t.match13.pntTegen}</th>
                    <th className="num">{t.match13.saldo}</th>
                  </tr>
                </thead>
                <tbody>
                  {klassement.map((row, i) => (
                    <tr key={row.teamId}>
                      <td>{i + 1}</td>
                      <td>{row.name}</td>
                      <td className="num">{row.gespeeld}</td>
                      <td className="num">{row.overwinningen}</td>
                      <td className="num">{row.puntenVoor}</td>
                      <td className="num">{row.puntenTegen}</td>
                      <td className="num">{row.saldo > 0 ? `+${row.saldo}` : row.saldo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <footer className="app-footer" style={{ marginTop: "2.5rem" }}>
          <div className="app-footer-inner">
            <img src="/images/logo-icon.png" alt="Petanque13" />
            <span className="footer-gold">
              {t.match13.gemaaktDoor}{" "}
              <a href="https://petanque13.be" target="_blank" rel="noopener noreferrer">
                petanque13.be
              </a>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
