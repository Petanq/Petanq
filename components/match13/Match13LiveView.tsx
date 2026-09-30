"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "@/lib/language-context";
import { haalMatch13ToernooiVoorPubliek, type Match13LivePubliek } from "@/actions/match13";
import { pouleColor } from "@/lib/match13/types";
import type { Match, Team } from "@/lib/match13/types";
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
// zelf. Poules (met zijn piramide) is bewust nog niet gebouwd: dat is een
// aparte, grotere klus voor een volgende stap.
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
  const huidigeRonde = state.rounds.length > 0 ? state.rounds[state.rounds.length - 1] : null;
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
            borderRadius: 18,
            padding: "1.6rem 1.5rem",
            textAlign: "center",
            marginBottom: "1.6rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.6rem", marginBottom: "0.9rem" }}>
            <img className="mark" src="/images/logo-icon.png" alt="Match13" style={{ width: 36, height: 36 }} />
            <span className="wordmark">
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
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  background: "var(--warn)",
                  animation: "match13-live-ping 1.4s cubic-bezier(0,0,0.2,1) infinite",
                }}
              />
              <span style={{ position: "relative", width: "0.5rem", height: "0.5rem", borderRadius: 999, background: "var(--warn)" }} />
            </span>
            {t.match13.liveBadge}
          </span>
          <h1 style={{ margin: "0.6rem 0 0.1rem", fontWeight: 800, fontSize: "1.7rem" }}>
            {live.club || live.naam}
          </h1>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
            {t.match13.liveBijgewerktOm(bijgewerkt)}
          </p>
        </div>

        {state.format === "poules" ? (
          <p className="hint" style={{ textAlign: "center", padding: "2rem" }}>
            {t.match13.liveNogGeenPoulesWeergave}
          </p>
        ) : !huidigeRonde ? (
          <p className="hint" style={{ textAlign: "center", padding: "2rem" }}>
            {t.match13.liveNogNietBegonnen}
          </p>
        ) : (
          <>
            <h2 style={{ fontWeight: 800, color: "var(--ink)", marginBottom: "0.8rem" }}>
              {t.match13.liveRondeTitel(huidigeRonde.number)}
            </h2>
            <div
              className="court-grid"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gridAutoFlow: "row" }}
            >
              {[...huidigeRonde.matches]
                .sort((a, b) => a.court - b.court)
                .map((m, i) => {
                  const gespeeld = m.scoreA !== undefined && m.scoreB !== undefined;
                  return (
                    <div key={i} className="court-card" style={{ "--plein-accent": pouleColor(m.court - 1) } as CSSProperties}>
                      <div className="court-label">{t.match13.liveePleinKort(m.court)}</div>
                      <div className="match-row">
                        <span>{zijdeNaam(state.teams, m, "A")}</span>
                        <span
                          style={{
                            flex: "0 0 auto",
                            fontVariantNumeric: "tabular-nums",
                            color: gespeeld ? "var(--ink)" : "var(--ink-muted)",
                            fontSize: gespeeld ? "1.55rem" : "0.85rem",
                            fontWeight: gespeeld ? 800 : 600,
                            textTransform: gespeeld ? "none" : "uppercase",
                            letterSpacing: gespeeld ? "normal" : "0.03em",
                          }}
                        >
                          {gespeeld ? `${m.scoreA} – ${m.scoreB}` : t.match13.liveNogTeSpelen}
                        </span>
                        <span style={{ textAlign: "right" }}>{zijdeNaam(state.teams, m, "B")}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
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
