"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { haalMatch13ToernooiVoorPubliek, type Match13LivePubliek } from "@/actions/match13";
import type { Match, Team } from "@/lib/match13/types";

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
// huidige ronde toont. Poules (met zijn piramide) is bewust nog niet
// gebouwd: dat is een aparte, grotere klus voor een volgende stap.
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
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-lg font-semibold text-grijs">{t.match13.liveNietMeerBeschikbaar}</p>
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
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 rounded-2xl bg-donker px-6 py-8 text-center text-white">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-geel">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rood" />
          {t.match13.liveBadge}
        </span>
        <h1 className="mt-3 font-titel text-2xl tracking-wide sm:text-3xl">{live.club || live.naam}</h1>
        <p className="mt-1 text-xs font-semibold text-white/50">{t.match13.liveBijgewerktOm(bijgewerkt)}</p>
      </div>

      {state.format === "poules" ? (
        <p className="rounded-xl border-[1.5px] border-rand bg-white p-6 text-center text-sm text-grijs">
          {t.match13.liveNogGeenPoulesWeergave}
        </p>
      ) : !huidigeRonde ? (
        <p className="rounded-xl border-[1.5px] border-rand bg-white p-6 text-center text-sm text-grijs">
          {t.match13.liveNogNietBegonnen}
        </p>
      ) : (
        <section>
          <h2 className="mb-3 font-titel text-lg text-donker">{t.match13.liveRondeTitel(huidigeRonde.number)}</h2>
          <ul className="flex flex-col gap-2">
            {[...huidigeRonde.matches]
              .sort((a, b) => a.court - b.court)
              .map((m, i) => {
                const gespeeld = m.scoreA !== undefined && m.scoreB !== undefined;
                return (
                  <li
                    key={i}
                    className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-3 rounded-xl border-[1.5px] border-rand bg-white p-3"
                  >
                    <span className="rounded-full bg-donker px-2.5 py-1 text-center text-xs font-bold text-geel">
                      {t.match13.liveePleinKort(m.court)}
                    </span>
                    <span className="truncate text-sm font-semibold text-donker">
                      {zijdeNaam(state.teams, m, "A")}
                    </span>
                    <span
                      className={`whitespace-nowrap text-center text-sm font-bold ${
                        gespeeld ? "text-donker" : "text-grijs"
                      }`}
                    >
                      {gespeeld ? `${m.scoreA} – ${m.scoreB}` : t.match13.liveNogTeSpelen}
                    </span>
                    <span className="truncate text-right text-sm font-semibold text-donker">
                      {zijdeNaam(state.teams, m, "B")}
                    </span>
                  </li>
                );
              })}
          </ul>
        </section>
      )}
    </div>
  );
}
