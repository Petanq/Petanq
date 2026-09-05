"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import "./match13.css";
import { useTranslation } from "@/lib/language-context";
import type { Format, Match, Role, Round, Team } from "@/lib/match13/types";
import { FORMAT_LABELS, FORMAT_TEAM_SIZE, SPEL_LETTERS, SEXTET_SPLIT } from "@/lib/match13/types";
import {
  assignKwartetRoles,
  assignSextetRoles,
  buildCourtHistory,
  buildMeleeHistory,
  buildOpponentHistory,
  generateMeleeRound,
  generateRankedRound,
  generateRound,
} from "@/lib/match13/draw";
import { computeMeleeStandings, computeStandings, type StandingRow } from "@/lib/match13/standings";
import { isCompleteMatch, isInvalidMatch, isCompleteSubScore, isInvalidSubScore } from "@/lib/match13/validation";
import {
  assignPoules,
  buildKnockoutBracket,
  buildPouleBracket,
  courtsNeededForPoule,
  isTrueBye,
  poulesOf,
  pouleQualifiersReady,
  qualifiersFromPoule,
  resolvedTeams,
  usesBarrageBracket,
  winnerLoserOf,
  type BracketMatch,
  type PouleQualifier,
} from "@/lib/match13/poules";
import { slaMatch13OpAsync, archiveerMatch13Resultaten } from "@/actions/match13";
import type { AppState } from "@/lib/match13/state";

type Tab = "opzet" | "onthaal" | "zaal" | "klassement";

// A distinct accent color per poule, cycled if there are more poules than
// colors — just enough to tell "Poule A" apart from "Poule B" at a glance
// when several are stacked on one screen.
const POULE_COLORS = ["#2563eb", "#c2410c", "#7c3aed", "#0d9488", "#be185d", "#4d7c0f", "#0284c7", "#a16207"];
function pouleColor(index: number): string {
  return POULE_COLORS[index % POULE_COLORS.length];
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `t${Date.now()}_${idCounter}`;
}

// Trims, collapses inner whitespace, and capitalizes the first letter of
// every "& "-joined name — just enough normalization to stop "tif" / "Tif" /
// "tif " from being three different-looking teams, without mangling
// deliberate capitals or initials. Works the same on a single player name
// (used while adding a team) and on a full "A & B" team name (used when
// editing one after the fact).
function cleanName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .split(" & ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" & ");
}

// A small visual "1 2 3 4 5" stepper: filled once a round is fully played,
// ringed for the round currently in progress.
function RoundStepper({
  current,
  total,
  currentDone,
}: {
  current: number;
  total: number;
  currentDone: boolean;
}) {
  return (
    <div className="round-stepper">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
        const done = n < current || (n === current && currentDone);
        const isCurrent = n === current && !done;
        return (
          <span
            key={n}
            className={"step" + (done ? " done" : "") + (isCurrent ? " current" : "")}
          >
            {done ? "✓" : n}
          </span>
        );
      })}
    </div>
  );
}

// Live speeltijd per wedstrijd: tikt op (groen) zolang er geen score staat,
// bevriest (rood) zodra de score volledig is ingevuld.
function MatchTimer({ startedAt, finishedAt }: { startedAt: number; finishedAt?: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (finishedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [finishedAt]);

  const totalSeconds = Math.max(0, Math.floor(((finishedAt ?? now) - startedAt) / 1000));
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;

  return (
    <span className={"match-timer" + (finishedAt ? " klaar" : " bezig")}>
      {mm}:{String(ss).padStart(2, "0")}
    </span>
  );
}

// A one-shot confetti burst, replayed whenever `trigger` flips from false to
// true (i.e. the moment the tournament's last score gets filled in).
function Confetti({ trigger }: { trigger: boolean }) {
  const [show, setShow] = useState(false);
  const wasTriggered = useRef(false);

  useEffect(() => {
    if (trigger && !wasTriggered.current) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 2600);
      wasTriggered.current = true;
      return () => clearTimeout(t);
    }
    if (!trigger) {
      wasTriggered.current = false;
    }
  }, [trigger]);

  if (!show) return null;
  const colors = ["#f4c430", "#2563eb", "#16a34a", "#dc2626", "#1f1f1f"];
  const pieces = Array.from({ length: 32 }, (_, i) => i);
  return (
    <div className="confetti-overlay" aria-hidden="true">
      {pieces.map((i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.4}s`,
            animationDuration: `${1.8 + Math.random() * 1}s`,
          }}
        />
      ))}
    </div>
  );
}

// A poule of 4's mini-bracket, or the knock-out pyramid — rendered as
// columns (one per round) with each match showing "?" for a side that isn't
// known yet, live score inputs once both sides are, and the winner
// highlighted once it's played. Editing is always allowed (even on an
// already-decided match) so a wrong score can be fixed at any point.
//
// The round/label text baked into each match (Ronde 1, Winnaars, Verliezers,
// Barrage, Vrij geloot — from lib/match13/poules.ts) stays Dutch for now:
// it's generated by the shared, already-tested scheduling engine, and
// localizing it would mean teaching that pure logic about language. Most of
// these are petanque terms a French speaker already recognizes ("barrage").
function BracketColumns({
  matches,
  numNameOf,
  editable,
  onScore,
  onClear,
  onCourtChange,
  accent,
}: {
  matches: BracketMatch[];
  numNameOf: (id: string | null) => ReactNode;
  editable?: boolean;
  onScore?: (matchId: string, side: "scoreA" | "scoreB", value: string) => void;
  onClear?: (matchId: string) => void;
  onCourtChange?: (matchId: string, court: number) => void;
  accent?: string;
}) {
  const { t } = useTranslation();
  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
  return (
    <div className="bracket" style={accent ? ({ "--poule-accent": accent } as CSSProperties) : undefined}>
      {rounds.map((r) => (
        <div className="bracket-col" key={r}>
          {matches
            .filter((m) => m.round === r)
            .map((m) => {
              const [a, b] = resolvedTeams(matches, m);
              const bye = isTrueBye(m);
              const ready = a !== null && b !== null;
              const done = m.scoreA !== undefined && m.scoreB !== undefined;
              const aWon = done && m.scoreA! > m.scoreB!;
              const bWon = done && m.scoreB! > m.scoreA!;
              return (
                <div className={"bracket-match" + (done ? " done" : ready ? " ready" : " pending")} key={m.id}>
                  <div className="bracket-match-label">
                    {m.label}
                    {!bye && m.court ? (
                      editable && onCourtChange ? (
                        <span className="bracket-plein-edit">
                          {" — "}
                          {t.match13.pleinLabelKort}{" "}
                          <input
                            type="number"
                            min={1}
                            className="bracket-plein-input"
                            value={m.court}
                            onChange={(e) => onCourtChange(m.id, Math.max(1, Number(e.target.value) || 1))}
                          />
                        </span>
                      ) : (
                        ` — ${t.match13.plein(m.court)}`
                      )
                    ) : (
                      ""
                    )}
                  </div>
                  <div className={"bracket-side" + (aWon ? " winner" : bWon ? " loser" : "")}>
                    <span className="bracket-name">{a ? numNameOf(a) : "?"}</span>
                    {editable && ready ? (
                      <input
                        type="number"
                        min={0}
                        max={13}
                        value={m.scoreA ?? ""}
                        onChange={(e) => onScore?.(m.id, "scoreA", e.target.value)}
                      />
                    ) : (
                      done && <span className="bracket-score">{m.scoreA}</span>
                    )}
                  </div>
                  {!bye && (
                    <div className={"bracket-side" + (bWon ? " winner" : aWon ? " loser" : "")}>
                      <span className="bracket-name">{b ? numNameOf(b) : "?"}</span>
                      {editable && ready ? (
                        <input
                          type="number"
                          min={0}
                          max={13}
                          value={m.scoreB ?? ""}
                          onChange={(e) => onScore?.(m.id, "scoreB", e.target.value)}
                        />
                      ) : (
                        done && <span className="bracket-score">{m.scoreB}</span>
                      )}
                    </div>
                  )}
                  {bye && <div className="bracket-side bye-side">{t.match13.bye.toLowerCase()}</div>}
                  {editable && done && (
                    <button className="link-btn bracket-clear" onClick={() => onClear?.(m.id)}>
                      {t.match13.wisScore}
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}

// A small "who's through" callout next to a poule-of-4's mini-bracket — the
// direct winner is already known as soon as the Winnaars match is played
// (even before the barrage decides the 2nd spot), so this fills in as soon
// as each half is decided rather than waiting for the whole poule.
function PouleQualifiersBadge({
  matches,
  numNameOf,
  accent,
}: {
  matches: BracketMatch[];
  numNameOf: (id: string | null) => ReactNode;
  accent?: string;
}) {
  const { t } = useTranslation();
  const poule = matches.find((m) => m.poule)?.poule;
  if (!poule) return null;
  const winner = winnerLoserOf(matches, `${poule}-WIN`, "winner");
  const barrageWinner = winnerLoserOf(matches, `${poule}-BAR`, "winner");
  return (
    <div className="poule-qualifiers" style={accent ? ({ "--poule-accent": accent } as CSSProperties) : undefined}>
      <div className="poule-qualifiers-title">{t.match13.doorNaarPiramide}</div>
      <div className="poule-qualifier-row">
        <span className="poule-qualifier-rank">1</span>
        <span>{winner ? numNameOf(winner) : t.match13.nogTeBepalen}</span>
      </div>
      <div className="poule-qualifier-row">
        <span className="poule-qualifier-rank">2</span>
        <span>{barrageWinner ? numNameOf(barrageWinner) : t.match13.nogTeBepalenBarrage}</span>
      </div>
    </div>
  );
}

// The round-robin fallback pool (size 3, or the rare n=5 single-pool case)
// has no bracket shape, so on top of its BracketColumns match list we also
// show a plain ranking table — matchpunten then saldo, same as everywhere else.
function PouleStandingsTable({ rows }: { rows: StandingRow[] }) {
  const { t } = useTranslation();
  return (
    <table className="standings" style={{ marginTop: "0.6rem" }}>
      <thead>
        <tr>
          <th></th>
          <th>{t.match13.teamKolom}</th>
          <th className="num">{t.match13.gespeeld}</th>
          <th className="num">{t.match13.overwinningen}</th>
          <th className="num">{t.match13.pntVoor}</th>
          <th className="num">{t.match13.pntTegen}</th>
          <th className="num">{t.match13.saldo}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.teamId}>
            <td>{i + 1}</td>
            <td className="team-name">
              <div className="team-cell">
                <span className="team-num">{row.number}</span>
                <span>{row.name}</span>
              </div>
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
  );
}

function roundRobinStandings(pouleTeams: Team[], pouleMatches: BracketMatch[]): StandingRow[] {
  const fakeRound: Round = {
    number: 1,
    matches: pouleMatches.map((m) => ({
      court: 0,
      teamA: m.teamA as string,
      teamB: m.teamB,
      scoreA: m.scoreA,
      scoreB: m.scoreB,
    })),
  };
  return computeStandings(pouleTeams, [fakeRound]);
}

export function Match13App({ tournamentId, initialState }: { tournamentId: string; initialState: AppState }) {
  const { t } = useTranslation();
  const [state, setState] = useState<AppState>(initialState);
  const [tab, setTab] = useState<Tab>("opzet");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  // Welk afdrukblad er getoond wordt op het Zaalscherm — de kaartjes (default)
  // of het rondeoverzicht — via flushSync omgewisseld vlak vóór window.print()
  // zodat de browser het net-gekozen blad print, niet het vorige.
  const [printRondeModus, setPrintRondeModus] = useState<"kaartjes" | "overzicht">("kaartjes");

  // Volledig scherm: handig om het Zaalscherm groot te tonen op een
  // projector/tv aan de zaal. Luistert ook naar Esc (of de browser-eigen
  // "verlaat volledig scherm"-knop), die het scherm buiten onze eigen knop
  // om kan sluiten.
  const appShellRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === appShellRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      appShellRef.current?.requestFullscreen();
    }
  }

  const { clubName, format, entryFee, totalRounds, teams, rounds, pouleBracket, knockoutBracket } = state;
  const isMeli = format === "meli";
  const isPoules = format === "poules";
  const isKwartet = format === "kwartet";
  const isSextet = format === "sextet";
  const isKwsFormaat = isKwartet || isSextet;
  const teamSize = FORMAT_TEAM_SIZE[format];
  const minToPlay = isMeli ? 6 : isPoules ? 3 : 2;
  // Verplicht vóór je nog iets kan doen — maar enkel bij de allereerste
  // start: een toernooi dat al teams heeft (bv. van vóór deze check bestond)
  // blijft gewoon bruikbaar, ook als de clubnaam toen leeg bleef.
  const clubNaamVerplicht = !clubName.trim() && teams.length === 0;

  const [playerInputs, setPlayerInputs] = useState<string[]>(() => Array(teamSize).fill(""));
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState<Role>("flex");

  useEffect(() => {
    setPlayerInputs(Array(teamSize).fill(""));
  }, [teamSize]);

  // Saved to Supabase instead of localStorage — debounced so a fast run of
  // score keystrokes doesn't fire a write per keystroke. Skips the very
  // first render (that's just `initialState` we already fetched from there).
  const isFirstRender = useRef(true);
  const [opslaanMislukt, setOpslaanMislukt] = useState(false);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      slaMatch13OpAsync(tournamentId, state)
        .then((result) => setOpslaanMislukt(!result.succes))
        .catch(() => setOpslaanMislukt(true));
    }, 600);
    return () => clearTimeout(timeout);
  }, [state, tournamentId]);

  const presentTeams = useMemo(() => teams.filter((t) => t.present), [teams]);
  const paidCount = useMemo(() => teams.filter((t) => t.paid).length, [teams]);
  const currentRound = rounds[rounds.length - 1];
  const currentRoundComplete = !currentRound || currentRound.matches.every(isCompleteMatch);

  // Poules run as two shared "bracket" structures: the group stage (each
  // poule is its own little winners/losers/barrage mini-bracket, or — for
  // the odd-sized remainder pools — a flat round-robin) and, once every
  // poule has produced its 2 qualifiers, the knock-out pyramid. Both are
  // built once in full; a match becomes playable the moment its two teams
  // are known, independent of every other table.
  const pouleTeamsByLabel = isPoules ? poulesOf(teams) : new Map<string, Team[]>();
  const pouleLabelsSorted = Array.from(pouleTeamsByLabel.keys()).sort((a, b) => a.localeCompare(b));
  const groupStageStarted = isPoules && pouleBracket.length > 0;
  const groupStageDone =
    isPoules &&
    groupStageStarted &&
    pouleLabelsSorted.every((label) => pouleQualifiersReady(pouleBracket, label, pouleTeamsByLabel.get(label)!));
  const knockoutStarted = isPoules && knockoutBracket.length > 0;
  const finalMatch = knockoutBracket[knockoutBracket.length - 1];
  const champion =
    isPoules && knockoutStarted && finalMatch ? winnerLoserOf(knockoutBracket, finalMatch.id, "winner") : null;

  const tournamentComplete = isPoules
    ? !!champion
    : rounds.length >= totalRounds && currentRoundComplete && !!currentRound;
  const standings = useMemo(
    () => (isMeli ? computeMeleeStandings(teams, rounds) : computeStandings(teams, rounds)),
    [isMeli, teams, rounds]
  );

  // A name already used anywhere in the roster — checked per individual
  // player, not per team, since a fixed-team's stored name is really
  // "PlayerA & PlayerB & ..." and the same person shouldn't show up twice
  // under two different (mis)typings of their name.
  function isDuplicateName(name: string, excludeId?: string): boolean {
    const target = name.trim().toLowerCase();
    if (!target) return false;
    return teams.some(
      (t) => t.id !== excludeId && t.name.split(" & ").some((part) => part.trim().toLowerCase() === target)
    );
  }

  const cleanedPlayerInputs = playerInputs.map(cleanName);
  const duplicateInTeamForm =
    cleanedPlayerInputs.some((n) => n && isDuplicateName(n)) ||
    cleanedPlayerInputs.some((n, i) => n && cleanedPlayerInputs.findIndex((n2) => n2.toLowerCase() === n.toLowerCase()) !== i);
  const canAddTeam = playerInputs.every((n) => n.trim().length > 0) && !duplicateInTeamForm;
  const duplicateNewPlayer = isDuplicateName(cleanName(newPlayerName));

  function updatePlayerInput(i: number, value: string) {
    setPlayerInputs((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  function addTeam() {
    if (!canAddTeam) return;
    const members = playerInputs.map(cleanName);
    const name = members.join(" & ");
    setState((s) => {
      const nextNumber = s.teams.reduce((max, t) => Math.max(max, t.number || 0), 0) + 1;
      return {
        ...s,
        teams: [
          ...s.teams,
          {
            id: nextId(),
            number: nextNumber,
            name,
            present: true,
            paid: false,
            byes: 0,
            // Willekeurige startletter i.p.v. altijd bij A: bij een kort
            // tornooi (minder rondes dan er teamleden zijn) komt anders
            // altijd hetzelfde (laatst ingeschreven) lid nooit aan de beurt
            // voor het enkelspel — dit verdeelt dat eerlijk uit over de teams.
            ...(isKwsFormaat ? { members, kwartetAlleenIndex: Math.floor(Math.random() * teamSize) } : {}),
          },
        ],
      };
    });
    setPlayerInputs(Array(teamSize).fill(""));
  }

  function addPlayer() {
    const name = cleanName(newPlayerName);
    if (!name || isDuplicateName(name)) return;
    setState((s) => {
      const nextNumber = s.teams.reduce((max, t) => Math.max(max, t.number || 0), 0) + 1;
      return {
        ...s,
        teams: [
          ...s.teams,
          {
            id: nextId(),
            number: nextNumber,
            name,
            present: true,
            paid: false,
            byes: 0,
            role: newPlayerRole,
          },
        ],
      };
    });
    setNewPlayerName("");
    setNewPlayerRole("flex");
  }

  function updatePlayerRole(id: string, role: Role) {
    setState((s) => ({
      ...s,
      teams: s.teams.map((t) => (t.id === id ? { ...t, role } : t)),
    }));
  }

  function togglePresent(id: string) {
    setState((s) => ({
      ...s,
      teams: s.teams.map((t) => (t.id === id ? { ...t, present: !t.present } : t)),
    }));
  }

  function togglePaid(id: string) {
    setState((s) => ({
      ...s,
      teams: s.teams.map((t) => (t.id === id ? { ...t, paid: !t.paid } : t)),
    }));
  }

  function removeTeam(id: string) {
    setState((s) => ({ ...s, teams: s.teams.filter((t) => t.id !== id) }));
  }

  function generateNextRound() {
    if (presentTeams.length < minToPlay) return;
    const roundNumber = rounds.length + 1;

    if (isMeli) {
      const history = buildMeleeHistory(rounds);
      const { matches, restIds } = generateMeleeRound(roundNumber, presentTeams, history);
      setState((s) => ({
        ...s,
        rounds: [...s.rounds, { number: roundNumber, matches, rest: restIds, startedAt: Date.now() }],
        teams: s.teams.map((t) => (restIds.includes(t.id) ? { ...t, byes: t.byes + 1 } : t)),
      }));
      setTab("zaal");
      return;
    }

    const history = buildOpponentHistory(rounds);
    const courtHistory = buildCourtHistory(rounds);
    const rankById = new Map(standings.map((r) => [r.teamId, r]));
    const result =
      rounds.length === 0
        ? // Round 1: nobody has a standing yet, so it's a fair random draw.
          generateRound(roundNumber, presentTeams, history, courtHistory)
        : // Round 2+: pair by current standing — winners face winners.
          generateRankedRound(
            roundNumber,
            presentTeams,
            history,
            (id) => {
              const r = rankById.get(id);
              return { matchpunten: r?.matchpunten ?? 0, saldo: r?.saldo ?? 0 };
            },
            courtHistory
          );
    const { matches, byeTeamId } = result;

    const { matches: finalMatches, alleenIndexUpdates: kwartetIndexUpdates } = isKwartet
      ? assignKwartetRoles(matches, teams)
      : isSextet
      ? assignSextetRoles(matches, teams)
      : { matches, alleenIndexUpdates: new Map<string, number>() };

    setState((s) => ({
      ...s,
      rounds: [...s.rounds, { number: roundNumber, matches: finalMatches, startedAt: Date.now() }],
      teams: s.teams.map((t) => {
        const metBye = t.id === byeTeamId ? { ...t, byes: t.byes + 1 } : t;
        const nieuweIndex = kwartetIndexUpdates.get(t.id);
        return nieuweIndex === undefined ? metBye : { ...metBye, kwartetAlleenIndex: nieuweIndex };
      }),
    }));
    setTab("zaal");
  }

  // Builds every poule's mini-bracket (or round-robin) in one shot — this is
  // the only "generate" step the group stage ever needs; every match in it
  // unlocks on its own as soon as its two teams are known.
  function startPoulesTournament() {
    if (presentTeams.length < minToPlay) return;
    setState((s) => {
      const present = s.teams.filter((t) => t.present);
      const assignment = assignPoules(present);
      const teamsNow = s.teams.map((t) => ({ ...t, poule: assignment.get(t.id) ?? t.poule }));
      const groups = poulesOf(teamsNow.filter((t) => t.present));
      // Each poule keeps its own dedicated pleinen for its whole run, so a
      // poule only ever has to watch its own courts — never wait on a court
      // that belongs to a different poule.
      const labelsSorted = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b));
      const bracket: BracketMatch[] = [];
      let nextCourt = 1;
      for (const label of labelsSorted) {
        const pouleTeams = groups.get(label)!;
        bracket.push(...buildPouleBracket(label, pouleTeams, nextCourt));
        nextCourt += courtsNeededForPoule(pouleTeams.length);
      }
      return { ...s, teams: teamsNow, pouleBracket: bracket };
    });
    setTab("zaal");
  }

  // Builds the full knock-out pyramid in one shot from every poule's
  // qualifiers, once every poule has decided its 2 qualifying spots.
  function startKnockout() {
    setState((s) => {
      const groups = poulesOf(s.teams.filter((t) => t.present));
      const qualifiers: PouleQualifier[] = [];
      for (const [label, pouleTeams] of groups) {
        qualifiers.push(...qualifiersFromPoule(s.pouleBracket, label, pouleTeams));
      }
      return { ...s, knockoutBracket: buildKnockoutBracket(qualifiers) };
    });
  }

  function updateBracketScore(
    which: "poule" | "knockout",
    matchId: string,
    side: "scoreA" | "scoreB",
    value: string
  ) {
    setState((s) => {
      const key = which === "poule" ? "pouleBracket" : "knockoutBracket";
      const n = value === "" ? undefined : Math.min(13, Math.max(0, Number(value)));
      return { ...s, [key]: s[key].map((m) => (m.id === matchId ? { ...m, [side]: n } : m)) };
    });
  }

  // Courts are normally assigned once and never touched again — but a
  // physical plein can be out of use on the day itself, so let the
  // organizer override any match's plein by hand if that's ever needed.
  function updateBracketCourt(which: "poule" | "knockout", matchId: string, court: number) {
    setState((s) => {
      const key = which === "poule" ? "pouleBracket" : "knockoutBracket";
      return { ...s, [key]: s[key].map((m) => (m.id === matchId ? { ...m, court } : m)) };
    });
  }

  function clearBracketMatch(which: "poule" | "knockout", matchId: string) {
    setState((s) => {
      const key = which === "poule" ? "pouleBracket" : "knockoutBracket";
      return {
        ...s,
        [key]: s[key].map((m) => (m.id === matchId ? { ...m, scoreA: undefined, scoreB: undefined } : m)),
      };
    });
  }

  function undoLastRound() {
    if (rounds.length === 0) return;
    if (!window.confirm(t.match13.rondeOngedaanMaken(rounds.length).replace("← ", "") + "?")) {
      return;
    }
    setState((s) => {
      const last = s.rounds[s.rounds.length - 1];
      let teams = s.teams;
      const restedIds =
        last.rest && last.rest.length > 0
          ? last.rest
          : last.matches.filter((m) => m.teamB === null).map((m) => m.teamA);
      if (restedIds.length > 0) {
        teams = teams.map((t) =>
          restedIds.includes(t.id) ? { ...t, byes: Math.max(0, t.byes - 1) } : t
        );
      }
      return { ...s, rounds: s.rounds.slice(0, -1), teams };
    });
  }

  function updateScore(
    roundIndex: number,
    matchIndex: number,
    side: "scoreA" | "scoreB",
    value: string
  ) {
    setState((s) => {
      const rounds = s.rounds.slice();
      const round = { ...rounds[roundIndex] };
      const matches = round.matches.slice();
      const match = { ...matches[matchIndex] };
      const n = value === "" ? undefined : Math.min(13, Math.max(0, Number(value)));
      match[side] = n;
      match.finishedAt = isCompleteMatch(match) ? Date.now() : undefined;
      matches[matchIndex] = match;
      round.matches = matches;
      rounds[roundIndex] = round;
      return { ...s, rounds };
    });
  }

  // Kwartet: elk van de 2 deeluitslagen (enkelspel/triplet) apart ingeven —
  // scoreA/scoreB wordt telkens automatisch herberekend als de som van
  // beide, zodat klassement/validatie daarna gewoon verder werken zoals bij
  // elk ander speltype, zonder zelf iets van "enkelspel"/"triplet" te weten.
  function updateKwartetScore(
    roundIndex: number,
    matchIndex: number,
    deel: "Enkel" | "Doublet" | "Triplet",
    side: "A" | "B",
    value: string
  ) {
    setState((s) => {
      const rounds = s.rounds.slice();
      const round = { ...rounds[roundIndex] };
      const matches = round.matches.slice();
      const match = { ...matches[matchIndex] };
      const n = value === "" ? undefined : Math.min(13, Math.max(0, Number(value)));
      if (deel === "Enkel" && side === "A") match.scoreEnkelA = n;
      else if (deel === "Enkel" && side === "B") match.scoreEnkelB = n;
      else if (deel === "Doublet" && side === "A") match.scoreDoubletA = n;
      else if (deel === "Doublet" && side === "B") match.scoreDoubletB = n;
      else if (deel === "Triplet" && side === "A") match.scoreTripletA = n;
      else match.scoreTripletB = n;
      // Sextet telt 3 delen op (enkel + dubbel + triplet), Kwartet 2 (enkel +
      // triplet) — scoreDoubletA/B blijft bij Kwartet altijd undefined.
      const delenA = match.kwsSoort === "sextet"
        ? [match.scoreEnkelA, match.scoreDoubletA, match.scoreTripletA]
        : [match.scoreEnkelA, match.scoreTripletA];
      const delenB = match.kwsSoort === "sextet"
        ? [match.scoreEnkelB, match.scoreDoubletB, match.scoreTripletB]
        : [match.scoreEnkelB, match.scoreTripletB];
      match.scoreA = delenA.every((v) => v !== undefined)
        ? delenA.reduce((sum: number, v) => sum + (v as number), 0)
        : undefined;
      match.scoreB = delenB.every((v) => v !== undefined)
        ? delenB.reduce((sum: number, v) => sum + (v as number), 0)
        : undefined;
      match.finishedAt = isCompleteMatch(match) ? Date.now() : undefined;
      matches[matchIndex] = match;
      round.matches = matches;
      rounds[roundIndex] = round;
      return { ...s, rounds };
    });
  }

  // Same escape hatch as updateBracketCourt, for the fixed-format court grid.
  function updateCourt(roundIndex: number, matchIndex: number, court: number) {
    setState((s) => {
      const rounds = s.rounds.slice();
      const round = { ...rounds[roundIndex] };
      const matches = round.matches.slice();
      matches[matchIndex] = { ...matches[matchIndex], court };
      round.matches = matches;
      rounds[roundIndex] = round;
      return { ...s, rounds };
    });
  }

  // Kwartet: enkelspel en triplet gebeuren tegelijk door andere mensen, dus
  // die hebben allebei hun eigen plein nodig — dit is de tegenhanger van
  // updateCourt() (dat blijft het enkelspel-plein), enkel voor het triplet.
  function updateTripletCourt(roundIndex: number, matchIndex: number, court: number) {
    setState((s) => {
      const rounds = s.rounds.slice();
      const round = { ...rounds[roundIndex] };
      const matches = round.matches.slice();
      matches[matchIndex] = { ...matches[matchIndex], courtTriplet: court };
      round.matches = matches;
      rounds[roundIndex] = round;
      return { ...s, rounds };
    });
  }

  // Sextet only: the dubbel's own plein, same idea as updateTripletCourt.
  function updateDoubletCourt(roundIndex: number, matchIndex: number, court: number) {
    setState((s) => {
      const rounds = s.rounds.slice();
      const round = { ...rounds[roundIndex] };
      const matches = round.matches.slice();
      matches[matchIndex] = { ...matches[matchIndex], courtDoublet: court };
      round.matches = matches;
      rounds[roundIndex] = round;
      return { ...s, rounds };
    });
  }

  function updateTeamName(id: string, rawName: string) {
    setState((s) => ({
      ...s,
      teams: s.teams.map((t) => (t.id === id ? { ...t, name: rawName } : t)),
    }));
  }

  function resetAll() {
    if (!window.confirm(t.match13.wisBevestiging)) return;
    archiveerMatch13Resultaten(tournamentId, state);
    setState((s) => ({ ...s, teams: [], rounds: [], pouleBracket: [], knockoutBracket: [] }));
    setTab("opzet");
  }

  // Green for the winning score, red for the losing one — only once the
  // match actually has a valid finished result (never on an empty/half-typed one).
  function scoreClass(m: Match, side: "scoreA" | "scoreB") {
    if (!isCompleteMatch(m)) return "";
    return m[side] === 13 ? "won" : "lost";
  }

  const teamOf = (id: string | null) => (id ? teams.find((t) => t.id === id) : undefined);
  // Toont de leden op de gegeven letter-indices (bv. [1,4] -> "B. Piet, E.
  // Wout"), gedeeld door Kwartet's triplet en Sextet's dubbel/triplet.
  const ledenVoorIndices = (team: Team | undefined, indices: number[]): ReactNode =>
    indices.map((i, pos) => (
      <span key={i}>
        {pos > 0 && ", "}
        <span className="kwartet-letter">{SPEL_LETTERS[i]}</span>. {team?.members?.[i] ?? ""}
      </span>
    ));
  // Kwartet: de 3 triplet-spelers zijn het team min wie deze ronde het
  // enkelspel speelt — nooit de rauwe team.name, want die bevat ook de
  // enkelspel-speler, alsof die tegelijk op 2 pleinen zou spelen.
  const kwartetTripletLeden = (team: Team | undefined, alleenLetter: string | undefined): ReactNode => {
    const alleenIndex = alleenLetter ? SPEL_LETTERS.indexOf(alleenLetter as (typeof SPEL_LETTERS)[number]) : -1;
    return ledenVoorIndices(team, [0, 1, 2, 3].filter((i) => i !== alleenIndex));
  };
  // Sextet: dubbel/triplet-samenstelling ligt vast per "alleen"-letter,
  // rechtstreeks overgenomen uit MATCH16's Sextet 1-2-3-tabel (SEXTET_SPLIT).
  const sextetLeden = (
    team: Team | undefined,
    alleenLetter: string | undefined,
    deel: "doublet" | "triplet"
  ): ReactNode => {
    const alleenIndex = alleenLetter ? SPEL_LETTERS.indexOf(alleenLetter as (typeof SPEL_LETTERS)[number]) : 0;
    const split = SEXTET_SPLIT[alleenIndex];
    return ledenVoorIndices(team, deel === "doublet" ? split.doublet : split.triplet);
  };
  // The number is gold, bold, inline text — no box/circle around it, since a
  // fixed-size badge is what broke the line-wrapping last time. Plain
  // colored text wraps exactly like normal text, so it stays legible from a
  // distance without making the layout jump around.
  const numNameOf = (id: string | null): ReactNode => {
    const t = teamOf(id);
    if (!t) return "?";
    return (
      <>
        <span className="num-gold">{t.number}.</span> {t.name}
      </>
    );
  };
  // Meli-Melo matches carry playersA/playersB (fresh triplets) instead of a
  // single team id — this picks whichever representation the match actually has.
  const sideLabel = (m: Match, side: "A" | "B"): ReactNode => {
    const ids = side === "A" ? m.playersA : m.playersB;
    if (ids) {
      return ids.map((id, i) => (
        <span key={id}>
          {i > 0 && " + "}
          {numNameOf(id)}
        </span>
      ));
    }
    return numNameOf(side === "A" ? m.teamA : m.teamB);
  };

  // Afdrukkaartje voor 1 kant van 1 wedstrijd: bij Meli-Melo een rijtje
  // losse genummerde bolletjes (elke speler zijn eigen nummer), anders 1
  // gedeeld teamnummer + de geregistreerde teamnaam.
  const printTeamHeader = (m: Match, side: "A" | "B"): ReactNode => {
    const ids = side === "A" ? m.playersA : m.playersB;
    if (ids) {
      return (
        <div className="mk-boule-rij">
          {ids.map((id) => {
            const p = teamOf(id);
            return (
              <div className="mk-speler" key={id}>
                <span className="mk-boule">{p?.number ?? "?"}</span>
                <span className="mk-speler-naam">{p?.name ?? ""}</span>
              </div>
            );
          })}
        </div>
      );
    }
    const team = teamOf(side === "A" ? m.teamA : m.teamB);
    return (
      <>
        <span className="mk-nr">{team?.number ?? "?"}</span>
        <div className="mk-namen">{team?.name ?? ""}</div>
      </>
    );
  };

  // Elk team krijgt zijn eigen kaartje met het eigen nummer vooraan (petanque-
  // gewoonte) — behalve bij Tête-à-Tête (1 tegen 1, geen verwarring mogelijk)
  // en Meli-Melo (elke ronde nieuwe, losse spelerscombinaties, geen vast
  // "eigen team" om een kaartje aan toe te wijzen).
  const dubbeleKaartjes = !isMeli && format !== "tete";

  // Gedeeld door alle "gewone" kaartjes (dus niet Poules, en niet Kwartet
  // dat zijn eigen renderer heeft): kop + team-headers + volle rij
  // telbolletjes + voet. `label` is het optionele geel badge in de hoek
  // (enkel gebruikt door Kwartet's enkelspel/triplet-kaartjes hieronder).
  const renderKaartLichaam = (rondeNummer: number, label?: string) => (
    <>
      <div className="mk-kop">
        <img className="mk-logo" src="/images/logo-icon.png" alt="" />
        <div className="mk-titel">
          <b>
            MATCH<span className="m13-gold">13</span>
          </b>
          <span>{clubName}</span>
        </div>
        <div className="mk-meta">
          {t.match13.printRondeKort}
          <br />
          <b>{rondeNummer}</b>
          {label && (
            <>
              <br />
              <span className="mk-deel-label">{label}</span>
            </>
          )}
        </div>
      </div>
    </>
  );

  const renderTelbolletjes = () => (
    <div className="mk-score">
      <ul className="mk-tally">
        {Array.from({ length: 13 }).map((_, n) => (
          <li key={n} />
        ))}
      </ul>
      <div className="mk-mid">
        <span>{t.match13.printUitslag}</span>
        <span className="lijn" />
      </div>
      <ul className="mk-tally">
        {Array.from({ length: 13 }).map((_, n) => (
          <li key={n} />
        ))}
      </ul>
    </div>
  );

  const renderRondeKaart = (m: Match, key: string | number, eersteZijde: "A" | "B", rondeNummer: number) => {
    const tweedeZijde = eersteZijde === "A" ? "B" : "A";
    return (
      <article className="mk-kaart" key={key}>
        {renderKaartLichaam(rondeNummer)}
        <div className="mk-teams">
          <div className="mk-team">{printTeamHeader(m, eersteZijde)}</div>
          <div className="mk-plein">
            {t.match13.pleinLabelKort}
            <br />
            <b>{m.court}</b>
          </div>
          <div className="mk-team">{printTeamHeader(m, tweedeZijde)}</div>
        </div>
        {renderTelbolletjes()}
        <div className="mk-voet">
          <div className="mk-vak" />
          <div className="mk-mid2">
            <span className="lbl">{t.match13.printTotaal}</span>
            <span className="hand">{t.match13.printHandtekening}</span>
          </div>
          <div className="mk-vak" />
        </div>
        <div className="mk-credit">
          www.petanque<span className="m13-gold">13</span>.be
        </div>
      </article>
    );
  };

  // Kwartet: 3 losse kaartjes per wedstrijd, alle drie op hetzelfde plein —
  // 1x het enkelspel (net als een gewoon Tête-à-Tête-kaartje) en 2x het
  // triplet (net als een gewoon Triplet-kaartje, elk team eigen exemplaar).
  // Geen uitgeknepen hybride kaartje meer: dit hergebruikt exact hetzelfde,
  // al goedgekeurde bolletjes-ontwerp, gewoon driemaal.
  const renderKwartetKaarten = (m: Match, key: string | number, rondeNummer: number) => {
    if (m.alleenNaamA === undefined || m.alleenNaamB === undefined) return [];
    const teamA = teamOf(m.teamA);
    const teamB = teamOf(m.teamB);

    const enkelKaart = (
      <article className="mk-kaart" key={`${key}-enkel`}>
        {renderKaartLichaam(rondeNummer, t.match13.enkelspelLabel)}
        <div className="mk-teams">
          <div className="mk-team">
            <span className="mk-nr">{teamA?.number ?? "?"}</span>
            <div className="mk-namen">
              <span className="mk-letter">{m.alleenLetterA}</span>. {m.alleenNaamA}
            </div>
          </div>
          <div className="mk-plein">
            {t.match13.pleinLabelKort}
            <br />
            <b>{m.court}</b>
          </div>
          <div className="mk-team">
            <span className="mk-nr">{teamB?.number ?? "?"}</span>
            <div className="mk-namen">
              <span className="mk-letter">{m.alleenLetterB}</span>. {m.alleenNaamB}
            </div>
          </div>
        </div>
        {renderTelbolletjes()}
        <div className="mk-voet">
          <div className="mk-vak" />
          <div className="mk-mid2">
            <span className="lbl">{t.match13.printTotaal}</span>
            <span className="hand">{t.match13.printHandtekening}</span>
          </div>
          <div className="mk-vak" />
        </div>
        <div className="mk-credit">
          www.petanque<span className="m13-gold">13</span>.be
        </div>
      </article>
    );

    const tripletKaart = (eersteZijde: "A" | "B", key2: string) => {
      const tweedeZijde = eersteZijde === "A" ? "B" : "A";
      const eersteTeam = eersteZijde === "A" ? teamA : teamB;
      const tweedeTeam = eersteZijde === "A" ? teamB : teamA;
      const eersteLetter = eersteZijde === "A" ? m.alleenLetterA : m.alleenLetterB;
      const tweedeLetter = eersteZijde === "A" ? m.alleenLetterB : m.alleenLetterA;
      return (
        <article className="mk-kaart" key={key2}>
          {renderKaartLichaam(rondeNummer, t.match13.tripletLabel)}
          <div className="mk-teams">
            <div className="mk-team">
              <span className="mk-nr">{eersteTeam?.number ?? "?"}</span>
              <div className="mk-namen">{kwartetTripletLeden(eersteTeam, eersteLetter)}</div>
            </div>
            <div className="mk-plein">
              {t.match13.pleinLabelKort}
              <br />
              <b>{m.courtTriplet}</b>
            </div>
            <div className="mk-team">
              <span className="mk-nr">{tweedeTeam?.number ?? "?"}</span>
              <div className="mk-namen">{kwartetTripletLeden(tweedeTeam, tweedeLetter)}</div>
            </div>
          </div>
          {renderTelbolletjes()}
          <div className="mk-voet">
            <div className="mk-vak" />
            <div className="mk-mid2">
              <span className="lbl">{t.match13.printTotaal}</span>
              <span className="hand">{t.match13.printHandtekening}</span>
            </div>
            <div className="mk-vak" />
          </div>
          <div className="mk-credit">
            www.petanque<span className="m13-gold">13</span>.be
          </div>
        </article>
      );
    };

    return [enkelKaart, tripletKaart("A", `${key}-triplet-a`), tripletKaart("B", `${key}-triplet-b`)];
  };

  // Sextet: 5 losse kaartjes per wedstrijd — 1 enkelspel + 2 dubbel + 2
  // triplet (elk team eigen exemplaar) — elk met zijn eigen plein, net als
  // Kwartet's kaartjes hierboven maar met een extra dubbel-onderdeel.
  const renderSextetKaarten = (m: Match, key: string | number, rondeNummer: number) => {
    if (m.alleenNaamA === undefined || m.alleenNaamB === undefined) return [];
    const teamA = teamOf(m.teamA);
    const teamB = teamOf(m.teamB);

    const enkelKaart = (
      <article className="mk-kaart" key={`${key}-enkel`}>
        {renderKaartLichaam(rondeNummer, t.match13.enkelspelLabel)}
        <div className="mk-teams">
          <div className="mk-team">
            <span className="mk-nr">{teamA?.number ?? "?"}</span>
            <div className="mk-namen">
              <span className="mk-letter">{m.alleenLetterA}</span>. {m.alleenNaamA}
            </div>
          </div>
          <div className="mk-plein">
            {t.match13.pleinLabelKort}
            <br />
            <b>{m.court}</b>
          </div>
          <div className="mk-team">
            <span className="mk-nr">{teamB?.number ?? "?"}</span>
            <div className="mk-namen">
              <span className="mk-letter">{m.alleenLetterB}</span>. {m.alleenNaamB}
            </div>
          </div>
        </div>
        {renderTelbolletjes()}
        <div className="mk-voet">
          <div className="mk-vak" />
          <div className="mk-mid2">
            <span className="lbl">{t.match13.printTotaal}</span>
            <span className="hand">{t.match13.printHandtekening}</span>
          </div>
          <div className="mk-vak" />
        </div>
        <div className="mk-credit">
          www.petanque<span className="m13-gold">13</span>.be
        </div>
      </article>
    );

    const subKaart = (deel: "doublet" | "triplet", eersteZijde: "A" | "B", key2: string) => {
      const tweedeZijde = eersteZijde === "A" ? "B" : "A";
      const eersteTeam = eersteZijde === "A" ? teamA : teamB;
      const tweedeTeam = eersteZijde === "A" ? teamB : teamA;
      const eersteLetter = eersteZijde === "A" ? m.alleenLetterA : m.alleenLetterB;
      const tweedeLetter = eersteZijde === "A" ? m.alleenLetterB : m.alleenLetterA;
      const label = deel === "doublet" ? t.match13.dubbelLabel : t.match13.tripletLabel;
      const plein = deel === "doublet" ? m.courtDoublet : m.courtTriplet;
      return (
        <article className="mk-kaart" key={key2}>
          {renderKaartLichaam(rondeNummer, label)}
          <div className="mk-teams">
            <div className="mk-team">
              <span className="mk-nr">{eersteTeam?.number ?? "?"}</span>
              <div className="mk-namen">{sextetLeden(eersteTeam, eersteLetter, deel)}</div>
            </div>
            <div className="mk-plein">
              {t.match13.pleinLabelKort}
              <br />
              <b>{plein}</b>
            </div>
            <div className="mk-team">
              <span className="mk-nr">{tweedeTeam?.number ?? "?"}</span>
              <div className="mk-namen">{sextetLeden(tweedeTeam, tweedeLetter, deel)}</div>
            </div>
          </div>
          {renderTelbolletjes()}
          <div className="mk-voet">
            <div className="mk-vak" />
            <div className="mk-mid2">
              <span className="lbl">{t.match13.printTotaal}</span>
              <span className="hand">{t.match13.printHandtekening}</span>
            </div>
            <div className="mk-vak" />
          </div>
          <div className="mk-credit">
            www.petanque<span className="m13-gold">13</span>.be
          </div>
        </article>
      );
    };

    return [
      enkelKaart,
      subKaart("doublet", "A", `${key}-doublet-a`),
      subKaart("doublet", "B", `${key}-doublet-b`),
      subKaart("triplet", "A", `${key}-triplet-a`),
      subKaart("triplet", "B", `${key}-triplet-b`),
    ];
  };

  const printKaartjesBlad = currentRound && (
    <div className="print-kaarten-blad">
      <div className="print-kaarten-grid">
        {currentRound.matches
          .filter((m) => m.teamB !== null)
          .flatMap((m, i) =>
            isKwartet
              ? renderKwartetKaarten(m, i, currentRound.number)
              : isSextet
              ? renderSextetKaarten(m, i, currentRound.number)
              : dubbeleKaartjes
              ? [
                  renderRondeKaart(m, `${i}-a`, "A", currentRound.number),
                  renderRondeKaart(m, `${i}-b`, "B", currentRound.number),
                ]
              : [renderRondeKaart(m, i, "A", currentRound.number)]
          )}
      </div>
    </div>
  );

  // Alternatief voor de losse kaartjes: alle wedstrijden van de huidige ronde
  // op 1 blad, om op te hangen aan de zaalwand i.p.v. per plein rond te delen.
  const printRondeOverzichtBlad = currentRound && (
    <div className="print-klassement-blad">
      <div className="print-klassement-kop">
        <img className="print-klassement-logo" src="/images/logo-icon.png" alt="" />
        <div className="print-klassement-titel">
          <b>
            MATCH<span className="m13-gold">13</span>
          </b>
          <span>{clubName}</span>
        </div>
      </div>
      <table className="print-klassement-tabel ronde-overzicht">
        <thead>
          <tr>
            <th className="num">{t.match13.pleinLabelKort}</th>
            <th className="team-kolom">{t.match13.teamKolom} A</th>
            <th className="vs-kolom"></th>
            <th className="team-kolom">{t.match13.teamKolom} B</th>
          </tr>
        </thead>
        <tbody>
          {currentRound.matches.map((m) => (
            <tr key={m.court}>
              <td className="num">
                <span className="rank-bol geen-podium">{m.court}</span>
              </td>
              <td className="team-naam-print">{sideLabel(m, "A")}</td>
              <td className="vs-kolom">
                <span className="vs-pil">{t.match13.tegenLabel}</span>
              </td>
              <td className="team-naam-print">{m.teamB === null ? t.match13.bye : sideLabel(m, "B")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="print-klassement-credit">
        www.petanque<span className="m13-gold">13</span>.be
      </div>
    </div>
  );

  // Poules heeft geen vaste "ronde" — wedstrijden binnen een poule en de
  // knockout-fase worden vrij gepland. "Nu speelbaar" = beide teams gekend,
  // geen echte bye, en nog geen score → dat zijn de kaartjes die nu gedrukt
  // moeten worden.
  const activePoulesBracket = knockoutStarted ? knockoutBracket : pouleBracket;
  const playablePoulesMatches = isPoules
    ? activePoulesBracket.filter((m) => {
        if (isTrueBye(m)) return false;
        if (m.scoreA !== undefined && m.scoreB !== undefined) return false;
        const [a, b] = resolvedTeams(activePoulesBracket, m);
        return a !== null && b !== null;
      })
    : [];

  const printPoulesLabel = (m: BracketMatch) => (m.poule ? t.match13.pouleLabel(m.poule) : m.label);

  const renderPoulesKaart = (
    m: BracketMatch,
    key: string,
    eersteId: string | null,
    tweedeId: string | null
  ) => {
    const eersteTeam = teamOf(eersteId);
    const tweedeTeam = teamOf(tweedeId);
    return (
      <article className="mk-kaart" key={key}>
        <div className="mk-kop">
          <img className="mk-logo" src="/images/logo-icon.png" alt="" />
          <div className="mk-titel">
            <b>
              MATCH<span className="m13-gold">13</span>
            </b>
            <span>{clubName}</span>
          </div>
          <div className="mk-meta mk-meta-tekst">{printPoulesLabel(m)}</div>
        </div>
        <div className="mk-teams">
          <div className="mk-team">
            <span className="mk-nr">{eersteTeam?.number ?? "?"}</span>
            <div className="mk-namen">{eersteTeam?.name ?? ""}</div>
          </div>
          <div className="mk-plein">
            {t.match13.pleinLabelKort}
            <br />
            <b>{m.court ?? "—"}</b>
          </div>
          <div className="mk-team">
            <span className="mk-nr">{tweedeTeam?.number ?? "?"}</span>
            <div className="mk-namen">{tweedeTeam?.name ?? ""}</div>
          </div>
        </div>
        <div className="mk-score">
          <ul className="mk-tally">
            {Array.from({ length: 13 }).map((_, n) => (
              <li key={n} />
            ))}
          </ul>
          <div className="mk-mid">
            <span>{t.match13.printUitslag}</span>
            <span className="lijn" />
          </div>
          <ul className="mk-tally">
            {Array.from({ length: 13 }).map((_, n) => (
              <li key={n} />
            ))}
          </ul>
        </div>
        <div className="mk-voet">
          <div className="mk-vak" />
          <div className="mk-mid2">
            <span className="lbl">{t.match13.printTotaal}</span>
            <span className="hand">{t.match13.printHandtekening}</span>
          </div>
          <div className="mk-vak" />
        </div>
        <div className="mk-credit">
          www.petanque<span className="m13-gold">13</span>.be
        </div>
      </article>
    );
  };

  const printPoulesKaartjesBlad = playablePoulesMatches.length > 0 && (
    <div className="print-kaarten-blad">
      <div className="print-kaarten-grid">
        {playablePoulesMatches.flatMap((m) => {
          const [aId, bId] = resolvedTeams(activePoulesBracket, m);
          return [renderPoulesKaart(m, `${m.id}-a`, aId, bId), renderPoulesKaart(m, `${m.id}-b`, bId, aId)];
        })}
      </div>
    </div>
  );

  const printKlassementBlad = (
    <div className="print-klassement-blad">
      <div className="print-klassement-kop">
        <img className="print-klassement-logo" src="/images/logo-icon.png" alt="" />
        <div className="print-klassement-titel">
          <b>
            MATCH<span className="m13-gold">13</span>
          </b>
          <span>{clubName}</span>
        </div>
      </div>
      <table className="print-klassement-tabel">
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
            <tr key={row.teamId} className={rounds.length > 0 && i < 3 ? "podium" : undefined}>
              <td className="rank">
                <span className={"rank-bol" + (rounds.length === 0 ? " geen-podium" : "")}>{i + 1}</span>
              </td>
              <td className="team-naam-print">
                <span className="nr">{row.number}.</span> {row.name}
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
      <div className="print-klassement-credit">
        www.petanque<span className="m13-gold">13</span>.be
      </div>
    </div>
  );

  // Wie welk nummer heeft — om af te drukken en op te hangen bij het
  // onthaal, zodat spelers/teams hun eigen nummer meteen terugvinden.
  const printLijstBlad = (
    <div className="print-klassement-blad">
      <div className="print-klassement-kop">
        <img className="print-klassement-logo" src="/images/logo-icon.png" alt="" />
        <div className="print-klassement-titel">
          <b>
            MATCH<span className="m13-gold">13</span>
          </b>
          <span>{clubName}</span>
        </div>
      </div>
      <table className="print-klassement-tabel">
        <thead>
          <tr>
            <th className="num">{t.match13.nummerKolom}</th>
            <th>{isMeli ? t.match13.spelerKolom : t.match13.teamKolom}</th>
            {isMeli && <th>{t.match13.rolKolom}</th>}
          </tr>
        </thead>
        <tbody>
          {teams
            .slice()
            .sort((a, b) => a.number - b.number)
            .map((t2) => (
              <tr key={t2.id}>
                <td className="num">
                  <span className="rank-bol geen-podium">{t2.number}</span>
                </td>
                <td className="team-naam-print">
                  {isKwsFormaat && t2.members
                    ? t2.members.map((naam, i) => (
                        <span key={i}>
                          {i > 0 && ", "}
                          <span className="kwartet-letter">{SPEL_LETTERS[i]}</span>. {naam}
                        </span>
                      ))
                    : t2.name}
                </td>
                {isMeli && <td>{t.match13.roleLabels[t2.role ?? "flex"]}</td>}
              </tr>
            ))}
        </tbody>
      </table>
      <div className="print-klassement-credit">
        www.petanque<span className="m13-gold">13</span>.be
      </div>
    </div>
  );

  return (
    <div className="app-shell" ref={appShellRef}>
      <Confetti trigger={tournamentComplete} />
      <div className="hero-band">
        <div className="hero-inner">
          <div className="brand">
            <div className="brand-id">
              <img className="mark" src="/images/logo-icon.png" alt="Petanque13" />
              <div>
                <div className="wordmark">
                  Match<span className="m13-gold">13</span>
                </div>
                <div className="tagline">{t.match13.tagline}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
              <span className="hero-club">{clubName || t.match13.naamloosToernooi}</span>
              <span className="hero-club hero-formaat">{FORMAT_LABELS[format]}</span>
              <Link href="/beheer/match13" className="link-btn" style={{ color: "var(--header-ink)" }}>
                {t.match13.alleToernooien}
              </Link>
              <button className="ghost-btn" onClick={toggleFullscreen}>
                {isFullscreen ? t.match13.volledigSchermSluiten : t.match13.volledigScherm}
              </button>
              <button className="ghost-btn" onClick={resetAll}>
                {t.match13.ditToernooiWissen}
              </button>
            </div>
          </div>
        </div>
      </div>

      {opslaanMislukt && <div className="save-fout-banner">{t.match13.opslaanMislukt}</div>}

      <div className="page">
        <nav className="tabs">
          {(["opzet", "onthaal", "zaal", "klassement"] as Tab[]).map((tabKey) => (
            <button
              key={tabKey}
              className={"tab" + (tab === tabKey ? " active" : "")}
              disabled={clubNaamVerplicht && tabKey !== "opzet"}
              title={clubNaamVerplicht && tabKey !== "opzet" ? t.match13.vulEerstClubIn : undefined}
              onClick={() => setTab(tabKey)}
            >
              {tabKey === "opzet" && t.match13.tabOpzet}
              {tabKey === "onthaal" && t.match13.tabOnthaal}
              {tabKey === "zaal" && t.match13.tabZaal}
              {tabKey === "klassement" && t.match13.tabKlassement}
            </button>
          ))}
        </nav>

        {tab === "opzet" && (
          <section className="grid-2 fade-in">
            <div className="card">
              <div className="field">
                <label>{t.match13.club}</label>
                <input
                  value={clubName}
                  onChange={(e) => setState((s) => ({ ...s, clubName: e.target.value }))}
                />
                {clubNaamVerplicht && <p className="hint" style={{ color: "var(--warn)" }}>{t.match13.clubVerplicht}</p>}
              </div>
              <div className="field">
                <label>{t.match13.speltype}</label>
                <div className={"pill-row" + (teams.length > 0 ? " locked" : "")}>
                  {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
                    <span
                      key={f}
                      className={"pill" + (format === f ? " sel" : "")}
                      onClick={() => teams.length === 0 && setState((s) => ({ ...s, format: f }))}
                    >
                      {FORMAT_LABELS[f]}
                    </span>
                  ))}
                </div>
                <div className="hint">
                  {teams.length > 0
                    ? t.match13.speltypeVastgezet
                    : isMeli
                    ? t.match13.hintMeli
                    : isPoules
                    ? t.match13.hintPoules
                    : isKwartet
                    ? t.match13.hintKwartet
                    : isSextet
                    ? t.match13.hintSextet
                    : t.match13.hintAndereFormats}
                </div>
              </div>
              <div className="field">
                <label>{t.match13.inlegPerTeam}</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={entryFee}
                  onChange={(e) =>
                    setState((s) => ({ ...s, entryFee: Number(e.target.value) || 0 }))
                  }
                  style={{ maxWidth: 120 }}
                />
              </div>
              {!isPoules && (
                <div className="field">
                  <label>{t.match13.aantalRondes}</label>
                  <input
                    type="number"
                    min={1}
                    value={totalRounds}
                    onChange={(e) =>
                      setState((s) => ({ ...s, totalRounds: Math.max(1, Number(e.target.value) || 1) }))
                    }
                    style={{ maxWidth: 120 }}
                  />
                  <div className="hint">{t.match13.hintAantalRondes}</div>
                </div>
              )}
              <div className="field">
                <label>{t.match13.teamsLabel}</label>
                <div className="value">
                  {t.match13.teamsSamenvatting(teams.length, presentTeams.length, paidCount)}
                </div>
              </div>
              <button className="cta" disabled={clubNaamVerplicht} onClick={() => setTab("onthaal")}>
                {t.match13.gaNaarOnthaal}
              </button>
            </div>
            <div className="card muted-card">
              <img className="muted-card-logo" src="/images/logo-volledig.png" alt="Petanque13" />
              <h3>{t.match13.hoeDitWerkt}</h3>
              <ul>
                <li>{t.match13.stapTeamsToevoegen}</li>
                <li>{t.match13.stapAanwezigBetaald}</li>
                <li>{t.match13.stapLoting}</li>
                <li>{t.match13.stapScores}</li>
              </ul>
              <img className="muted-card-seal" src="/images/logo-icon.png" alt="" />
            </div>
          </section>
        )}

        {tab === "onthaal" && (
          <section className="card fade-in">
            <div className="zaal-head">
              <h2>{isMeli ? t.match13.spelersHeader : t.match13.teamsHeader}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {teams.length > 0 && (
                  <button className="match13-actie-knop" onClick={() => window.print()}>
                    {t.match13.printLijst}
                  </button>
                )}
                {!isPoules && (
                  <RoundStepper current={rounds.length} total={totalRounds} currentDone={currentRoundComplete} />
                )}
              </div>
            </div>
            {printLijstBlad}

            {groupStageStarted ? (
              <p className="hint">{t.match13.teamsGeslotenPoules}</p>
            ) : isMeli ? (
              <>
                <form
                  className="add-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addPlayer();
                  }}
                >
                  <input
                    placeholder={t.match13.naamSpeler}
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                  />
                  <div className="pill-row">
                    {(Object.keys(t.match13.roleLabels) as Role[]).map((r) => (
                      <span
                        key={r}
                        className={"pill" + (newPlayerRole === r ? " sel" : "")}
                        onClick={() => setNewPlayerRole(r)}
                      >
                        {t.match13.roleLabels[r]}
                      </span>
                    ))}
                  </div>
                  <button type="submit" className="cta" disabled={!newPlayerName.trim() || duplicateNewPlayer}>
                    {t.match13.toevoegen}
                  </button>
                </form>
                {duplicateNewPlayer && (
                  <p className="hint" style={{ color: "var(--warn)", marginTop: "-0.6rem" }}>
                    {t.match13.duplicaatSpeler(cleanName(newPlayerName))}
                  </p>
                )}
                <p className="hint" style={{ marginTop: "0.5rem", marginBottom: "1.2rem" }}>
                  {t.match13.hintGeenVoorkeur}
                </p>
              </>
            ) : (
              <>
                <form
                  className="add-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addTeam();
                  }}
                >
                  {playerInputs.map((val, i) => (
                    <input
                      key={i}
                      placeholder={teamSize === 1 ? t.match13.naamSpeler : t.match13.spelerN(i + 1)}
                      value={val}
                      onChange={(e) => updatePlayerInput(i, e.target.value)}
                    />
                  ))}
                  <button type="submit" className="cta" disabled={!canAddTeam}>
                    {t.match13.toevoegen}
                  </button>
                </form>
                {duplicateInTeamForm && (
                  <p className="hint" style={{ color: "var(--warn)", marginTop: "-0.6rem" }}>
                    {t.match13.duplicaatTeam}
                  </p>
                )}
                <p className="hint" style={{ marginTop: "-0.6rem", marginBottom: "1.2rem" }}>
                  {t.match13.hintElkeSpelerVakje}
                </p>
              </>
            )}

            {teams.length === 0 && (
              <p className="hint">
                {t.match13.geenSpelersOfTeams(isMeli ? t.match13.spelersWoord : t.match13.teamsWoord)}
              </p>
            )}

            <div className="roster">
              {teams.map((t2) => (
                <div className="roster-row" key={t2.id}>
                  {editingTeamId === t2.id ? (
                    <form
                      className="name-edit"
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateTeamName(t2.id, cleanName(t2.name) || t2.name);
                        setEditingTeamId(null);
                      }}
                    >
                      <span className="team-num">{t2.number}</span>
                      <input
                        autoFocus
                        value={t2.name}
                        onChange={(e) => updateTeamName(t2.id, e.target.value)}
                        onBlur={() => {
                          updateTeamName(t2.id, cleanName(t2.name) || t2.name);
                          setEditingTeamId(null);
                        }}
                      />
                      <button type="submit" className="link-btn">
                        {t.match13.opslaan}
                      </button>
                    </form>
                  ) : (
                    <span className="name">
                      <span className="team-num">{t2.number}</span>
                      {isKwsFormaat && t2.members
                        ? t2.members.map((naam, i) => (
                            <span key={i}>
                              {i > 0 && ", "}
                              <span className="kwartet-letter">{SPEL_LETTERS[i]}</span>. {naam}
                            </span>
                          ))
                        : t2.name}
                      {isPoules && t2.poule && (
                        <span className="team-num poule-num">{t.match13.pouleLabel(t2.poule)}</span>
                      )}
                      <button
                        className="link-btn edit-name-btn"
                        onClick={() => setEditingTeamId(t2.id)}
                      >
                        {t.match13.bewerken}
                      </button>
                    </span>
                  )}
                  <div className="roster-actions">
                    {isMeli && (
                      <div className="pill-row role-pill-row">
                        {(Object.keys(t.match13.roleLabels) as Role[]).map((r) => (
                          <span
                            key={r}
                            className={"pill small" + ((t2.role ?? "flex") === r ? " sel" : "")}
                            onClick={() => updatePlayerRole(t2.id, r)}
                          >
                            {t.match13.roleLabels[r]}
                          </span>
                        ))}
                      </div>
                    )}
                    <label className="check">
                      <input type="checkbox" checked={t2.paid} onChange={() => togglePaid(t2.id)} />
                      {t.match13.betaaldCheck}
                    </label>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={t2.present}
                        onChange={() => togglePresent(t2.id)}
                      />
                      {t.match13.aanwezigCheck}
                    </label>
                    <button className="link-btn" onClick={() => removeTeam(t2.id)}>
                      {t.match13.verwijder}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {teams.length > 0 && (
              <p className="hint" style={{ marginTop: "1rem" }}>
                {t.match13.betalingSamenvatting(paidCount * entryFee, teams.length * entryFee)}
              </p>
            )}

            {!(isPoules ? groupStageStarted : rounds.length > 0) ? (
              <button
                className="cta"
                style={{ marginTop: "1.2rem" }}
                disabled={presentTeams.length < minToPlay}
                onClick={isPoules ? startPoulesTournament : generateNextRound}
              >
                {t.match13.startTornooi}
              </button>
            ) : (
              <p className="hint" style={{ marginTop: "1.2rem" }}>
                {t.match13.tornooiGestart}{" "}
                <button className="link-btn" onClick={() => setTab("zaal")}>
                  {t.match13.naarZaalscherm}
                </button>
              </p>
            )}
            {!(isPoules ? groupStageStarted : rounds.length > 0) && presentTeams.length < minToPlay && (
              <p className="hint">
                {t.match13.minimumOmTeStarten(minToPlay, isMeli ? t.match13.spelersWoord : t.match13.teamsWoord)}
              </p>
            )}
          </section>
        )}

        {tab === "zaal" && isPoules && (
          <section className="card fade-in">
            <div className="zaal-head">
              <h2>
                {champion
                  ? t.match13.kampioenBekend
                  : knockoutStarted
                  ? t.match13.knockOut
                  : groupStageDone
                  ? t.match13.groepsfaseKlaar
                  : t.match13.groepsfase}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {playablePoulesMatches.length > 0 && (
                  <button className="match13-actie-knop" onClick={() => window.print()}>
                    {t.match13.printKaartjes}
                  </button>
                )}
                {groupStageDone && !knockoutStarted && (
                  <button className="cta" onClick={startKnockout}>
                    {t.match13.startKnockout}
                  </button>
                )}
              </div>
            </div>

            {printPoulesKaartjesBlad}

            {presentTeams.length < minToPlay && (
              <p className="hint" style={{ marginTop: "1rem" }}>
                {t.match13.minimumZieOnthaal(minToPlay)}
              </p>
            )}

            {!groupStageStarted && presentTeams.length >= minToPlay && (
              <p className="hint">{t.match13.nogGeenWedstrijden}</p>
            )}

            {champion && (
              <div className="finish-banner">
                {t.match13.kampioenLabel} {numNameOf(champion)}!
              </div>
            )}

            {groupStageStarted && !knockoutStarted && (
              <>
                <p className="hint" style={{ marginTop: "0.6rem", marginBottom: "1.2rem" }}>
                  {t.match13.uitlegSpeelbaar}
                </p>
                {pouleLabelsSorted.map((label, pi) => {
                  const pouleTeams = pouleTeamsByLabel.get(label)!;
                  const accent = pouleColor(pi);
                  return (
                    <div key={label} style={{ marginBottom: "1.8rem" }}>
                      <h4 style={{ margin: "0 0 0.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className="poule-dot" style={{ background: accent }} />
                        {t.match13.pouleLabel(label)}
                      </h4>
                      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                        <BracketColumns
                          matches={pouleBracket.filter((m) => m.poule === label)}
                          numNameOf={numNameOf}
                          editable
                          onScore={(id, side, v) => updateBracketScore("poule", id, side, v)}
                          onClear={(id) => clearBracketMatch("poule", id)}
                          onCourtChange={(id, court) => updateBracketCourt("poule", id, court)}
                          accent={accent}
                        />
                        {usesBarrageBracket(pouleTeams.length) && (
                          <PouleQualifiersBadge
                            matches={pouleBracket.filter((m) => m.poule === label)}
                            numNameOf={numNameOf}
                            accent={accent}
                          />
                        )}
                      </div>
                      {!usesBarrageBracket(pouleTeams.length) && (
                        <PouleStandingsTable
                          rows={roundRobinStandings(pouleTeams, pouleBracket.filter((m) => m.poule === label))}
                        />
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {knockoutStarted && (
              <BracketColumns
                matches={knockoutBracket}
                numNameOf={numNameOf}
                editable
                onScore={(id, side, v) => updateBracketScore("knockout", id, side, v)}
                onClear={(id) => clearBracketMatch("knockout", id)}
                onCourtChange={(id, court) => updateBracketCourt("knockout", id, court)}
              />
            )}
          </section>
        )}

        {tab === "zaal" && !isPoules && (
          <section className="card fade-in">
            <div className="zaal-head">
              <h2>{t.match13.rondeVan(currentRound ? currentRound.number : "—", totalRounds)}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {currentRound && currentRound.matches.some((m) => m.teamB !== null) && (
                  <button
                    className="match13-actie-knop"
                    onClick={() => {
                      flushSync(() => setPrintRondeModus("kaartjes"));
                      window.print();
                    }}
                  >
                    {t.match13.printKaartjes}
                  </button>
                )}
                {currentRound && (
                  <button
                    className="match13-actie-knop"
                    onClick={() => {
                      flushSync(() => setPrintRondeModus("overzicht"));
                      window.print();
                    }}
                  >
                    {t.match13.printRondeOverzicht}
                  </button>
                )}
                {currentRound && (
                  <button className="match13-actie-knop gevaar" onClick={undoLastRound}>
                    {t.match13.rondeOngedaanMaken(rounds.length)}
                  </button>
                )}
                {rounds.length < totalRounds && (
                  <button
                    className="cta"
                    disabled={presentTeams.length < minToPlay || !currentRoundComplete}
                    onClick={generateNextRound}
                  >
                    {t.match13.genereerRonde(rounds.length + 1)}
                  </button>
                )}
              </div>
            </div>
            <RoundStepper current={rounds.length} total={totalRounds} currentDone={currentRoundComplete} />
            {presentTeams.length < minToPlay && (
              <p className="hint" style={{ marginTop: "1rem" }}>
                {t.match13.minimumZieOnthaalWat(minToPlay, isMeli ? t.match13.spelersWoord : t.match13.teamsWoord)}
              </p>
            )}

            {!currentRound && presentTeams.length >= minToPlay && (
              <p className="hint">{t.match13.nogGeenRonde}</p>
            )}

            {currentRound && currentRound.rest && currentRound.rest.length > 0 && (
              <p className="hint" style={{ marginTop: "0.6rem" }}>
                {t.match13.rustDezeRonde}{" "}
                {currentRound.rest.map((id, i) => (
                  <span key={id}>
                    {i > 0 && ", "}
                    {numNameOf(id)}
                  </span>
                ))}
              </p>
            )}

            {currentRound && !currentRoundComplete && (
              <p className="hint" style={{ color: "var(--warn)", fontWeight: 600 }}>
                {t.match13.vulGeldigeEindstand}
              </p>
            )}

            {tournamentComplete && (
              <div className="finish-banner">
                {t.match13.tornooiAfgelopen(
                  standings[0]?.name ?? "",
                  standings[0]?.overwinningen ?? 0,
                  standings[0]?.saldo ?? 0
                )}
                <div className="hint" style={{ marginTop: "0.3rem" }}>
                  {t.match13.nogEen}{" "}
                  <button className="link-btn" onClick={generateNextRound}>
                    {t.match13.extraRondeToevoegen}
                  </button>
                  ?
                </div>
              </div>
            )}

            {currentRound && (
              <div className="court-grid">
                {currentRound.matches.map((m, i) => (
                  <div
                    className="court-card"
                    key={i}
                    style={{ "--plein-accent": pouleColor(i) } as CSSProperties}
                  >
                    <div className={"court-label" + (m.teamB === null ? " bye" : "")}>
                      {m.teamB === null ? (
                        t.match13.bye
                      ) : (
                        <span className="court-label-edit">
                          {t.match13.pleinLabelKort}{" "}
                          <input
                            type="number"
                            min={1}
                            className="court-label-input"
                            value={m.court}
                            onChange={(e) => updateCourt(rounds.length - 1, i, Math.max(1, Number(e.target.value) || 1))}
                          />
                        </span>
                      )}
                    </div>
                    {m.teamB !== null ? (
                      <>
                        {currentRound.startedAt && (
                          <MatchTimer startedAt={currentRound.startedAt} finishedAt={m.finishedAt} />
                        )}
                        {isKwsFormaat && m.alleenNaamA !== undefined ? (
                          <>
                            <div className="kwartet-onderdeel-label">{t.match13.enkelspelLabel}</div>
                            <div className={"match-row" + (isInvalidSubScore(m.scoreEnkelA, m.scoreEnkelB) ? " invalid" : "")}>
                              <span>
                                <span className="kwartet-letter">{m.alleenLetterA}</span>. {m.alleenNaamA}
                              </span>
                              <input
                                className={
                                  isCompleteSubScore(m.scoreEnkelA, m.scoreEnkelB) ? (m.scoreEnkelA === 13 ? "won" : "lost") : ""
                                }
                                type="number"
                                min={0}
                                max={13}
                                value={m.scoreEnkelA ?? ""}
                                onChange={(e) => updateKwartetScore(rounds.length - 1, i, "Enkel", "A", e.target.value)}
                              />
                            </div>
                            <div className={"match-row" + (isInvalidSubScore(m.scoreEnkelA, m.scoreEnkelB) ? " invalid" : "")}>
                              <span>
                                <span className="kwartet-letter">{m.alleenLetterB}</span>. {m.alleenNaamB}
                              </span>
                              <input
                                className={
                                  isCompleteSubScore(m.scoreEnkelA, m.scoreEnkelB) ? (m.scoreEnkelB === 13 ? "won" : "lost") : ""
                                }
                                type="number"
                                min={0}
                                max={13}
                                value={m.scoreEnkelB ?? ""}
                                onChange={(e) => updateKwartetScore(rounds.length - 1, i, "Enkel", "B", e.target.value)}
                              />
                            </div>
                            {isSextet && (
                              <>
                                <div className="kwartet-onderdeel-label kwartet-onderdeel-met-plein">
                                  <span>{t.match13.dubbelLabel}</span>
                                  <span className="court-label">
                                    <span className="court-label-edit">
                                      {t.match13.pleinLabelKort}{" "}
                                      <input
                                        type="number"
                                        min={1}
                                        className="court-label-input"
                                        value={m.courtDoublet ?? ""}
                                        onChange={(e) =>
                                          updateDoubletCourt(rounds.length - 1, i, Math.max(1, Number(e.target.value) || 1))
                                        }
                                      />
                                    </span>
                                  </span>
                                </div>
                                <div className={"match-row" + (isInvalidSubScore(m.scoreDoubletA, m.scoreDoubletB) ? " invalid" : "")}>
                                  <span>{sextetLeden(teamOf(m.teamA), m.alleenLetterA, "doublet")}</span>
                                  <input
                                    className={
                                      isCompleteSubScore(m.scoreDoubletA, m.scoreDoubletB)
                                        ? m.scoreDoubletA === 13
                                          ? "won"
                                          : "lost"
                                        : ""
                                    }
                                    type="number"
                                    min={0}
                                    max={13}
                                    value={m.scoreDoubletA ?? ""}
                                    onChange={(e) => updateKwartetScore(rounds.length - 1, i, "Doublet", "A", e.target.value)}
                                  />
                                </div>
                                <div className={"match-row" + (isInvalidSubScore(m.scoreDoubletA, m.scoreDoubletB) ? " invalid" : "")}>
                                  <span>{sextetLeden(teamOf(m.teamB), m.alleenLetterB, "doublet")}</span>
                                  <input
                                    className={
                                      isCompleteSubScore(m.scoreDoubletA, m.scoreDoubletB)
                                        ? m.scoreDoubletB === 13
                                          ? "won"
                                          : "lost"
                                        : ""
                                    }
                                    type="number"
                                    min={0}
                                    max={13}
                                    value={m.scoreDoubletB ?? ""}
                                    onChange={(e) => updateKwartetScore(rounds.length - 1, i, "Doublet", "B", e.target.value)}
                                  />
                                </div>
                              </>
                            )}
                            <div className="kwartet-onderdeel-label kwartet-onderdeel-met-plein">
                              <span>{t.match13.tripletLabel}</span>
                              <span className="court-label">
                                <span className="court-label-edit">
                                  {t.match13.pleinLabelKort}{" "}
                                  <input
                                    type="number"
                                    min={1}
                                    className="court-label-input"
                                    value={m.courtTriplet ?? ""}
                                    onChange={(e) =>
                                      updateTripletCourt(rounds.length - 1, i, Math.max(1, Number(e.target.value) || 1))
                                    }
                                  />
                                </span>
                              </span>
                            </div>
                            <div className={"match-row" + (isInvalidSubScore(m.scoreTripletA, m.scoreTripletB) ? " invalid" : "")}>
                              <span>
                                {isSextet
                                  ? sextetLeden(teamOf(m.teamA), m.alleenLetterA, "triplet")
                                  : kwartetTripletLeden(teamOf(m.teamA), m.alleenLetterA)}
                              </span>
                              <input
                                className={
                                  isCompleteSubScore(m.scoreTripletA, m.scoreTripletB)
                                    ? m.scoreTripletA === 13
                                      ? "won"
                                      : "lost"
                                    : ""
                                }
                                type="number"
                                min={0}
                                max={13}
                                value={m.scoreTripletA ?? ""}
                                onChange={(e) => updateKwartetScore(rounds.length - 1, i, "Triplet", "A", e.target.value)}
                              />
                            </div>
                            <div className={"match-row" + (isInvalidSubScore(m.scoreTripletA, m.scoreTripletB) ? " invalid" : "")}>
                              <span>
                                {isSextet
                                  ? sextetLeden(teamOf(m.teamB), m.alleenLetterB, "triplet")
                                  : kwartetTripletLeden(teamOf(m.teamB), m.alleenLetterB)}
                              </span>
                              <input
                                className={
                                  isCompleteSubScore(m.scoreTripletA, m.scoreTripletB)
                                    ? m.scoreTripletB === 13
                                      ? "won"
                                      : "lost"
                                    : ""
                                }
                                type="number"
                                min={0}
                                max={13}
                                value={m.scoreTripletB ?? ""}
                                onChange={(e) => updateKwartetScore(rounds.length - 1, i, "Triplet", "B", e.target.value)}
                              />
                            </div>
                            <div className="kwartet-totaal">
                              {t.match13.totaalLabel}: {m.scoreA ?? "–"} – {m.scoreB ?? "–"}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className={"match-row" + (isInvalidMatch(m) ? " invalid" : "")}>
                              <span>{sideLabel(m, "A")}</span>
                              <input
                                className={scoreClass(m, "scoreA")}
                                type="number"
                                min={0}
                                max={13}
                                value={m.scoreA ?? ""}
                                onChange={(e) => updateScore(rounds.length - 1, i, "scoreA", e.target.value)}
                              />
                            </div>
                            <div className={"match-row" + (isInvalidMatch(m) ? " invalid" : "")}>
                              <span>{sideLabel(m, "B")}</span>
                              <input
                                className={scoreClass(m, "scoreB")}
                                type="number"
                                min={0}
                                max={13}
                                value={m.scoreB ?? ""}
                                onChange={(e) => updateScore(rounds.length - 1, i, "scoreB", e.target.value)}
                              />
                            </div>
                          </>
                        )}
                        {isInvalidMatch(m) && (
                          <p className="hint" style={{ color: "var(--warn)", marginTop: "0.4rem" }}>
                            {m.scoreA === 13 && m.scoreB === 13 ? t.match13.tweeKeer13 : t.match13.eenMoetOp13}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="match-row bye-row">
                        <span>{sideLabel(m, "A")}</span>
                        <span className="hint bye-hint">{t.match13.automatischeWinst}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {printRondeModus === "kaartjes" ? printKaartjesBlad : printRondeOverzichtBlad}

            {rounds.length > 1 && (
              <details className="prev-rounds" open>
                <summary>{t.match13.vorigeRondes(rounds.length - 1)}</summary>
                <p className="hint" style={{ margin: "0 0 0.6rem" }}>
                  {t.match13.fouteScoreHint}
                </p>
                {rounds
                  .slice(0, -1)
                  .map((r, i) => ({ r, i }))
                  .reverse()
                  .map(({ r, i: roundIndex }) => (
                    <div key={r.number} className="prev-round">
                      <strong>{t.match13.ronde(r.number)}</strong>
                      {r.rest && r.rest.length > 0 && (
                        <p className="hint" style={{ margin: "0 0 0.5rem" }}>
                          {t.match13.rust}{" "}
                          {r.rest.map((id, i) => (
                            <span key={id}>
                              {i > 0 && ", "}
                              {numNameOf(id)}
                            </span>
                          ))}
                        </p>
                      )}
                      {r.matches.map((m, mi) => (
                        <div key={mi} className="prev-match">
                          <span className={m.scoreA === 13 ? "winner" : "loser"}>
                            {sideLabel(m, "A")}
                          </span>
                          {m.teamB !== null ? (
                            <>
                              {isKwsFormaat && m.alleenNaamA !== undefined ? (
                                <span
                                  className={"prev-score-edit" + (isInvalidMatch(m) ? " invalid" : "")}
                                  style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.2rem" }}
                                >
                                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                    <input
                                      type="number"
                                      min={0}
                                      max={13}
                                      value={m.scoreEnkelA ?? ""}
                                      onChange={(e) => updateKwartetScore(roundIndex, mi, "Enkel", "A", e.target.value)}
                                    />
                                    <span>&ndash;</span>
                                    <input
                                      type="number"
                                      min={0}
                                      max={13}
                                      value={m.scoreEnkelB ?? ""}
                                      onChange={(e) => updateKwartetScore(roundIndex, mi, "Enkel", "B", e.target.value)}
                                    />
                                    <span className="hint" style={{ fontSize: "0.7rem" }}>
                                      {t.match13.enkelspelLabel}
                                    </span>
                                  </span>
                                  {isSextet && (
                                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                      <input
                                        type="number"
                                        min={0}
                                        max={13}
                                        value={m.scoreDoubletA ?? ""}
                                        onChange={(e) => updateKwartetScore(roundIndex, mi, "Doublet", "A", e.target.value)}
                                      />
                                      <span>&ndash;</span>
                                      <input
                                        type="number"
                                        min={0}
                                        max={13}
                                        value={m.scoreDoubletB ?? ""}
                                        onChange={(e) => updateKwartetScore(roundIndex, mi, "Doublet", "B", e.target.value)}
                                      />
                                      <span className="hint" style={{ fontSize: "0.7rem" }}>
                                        {t.match13.dubbelLabel}
                                      </span>
                                    </span>
                                  )}
                                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                    <input
                                      type="number"
                                      min={0}
                                      max={13}
                                      value={m.scoreTripletA ?? ""}
                                      onChange={(e) => updateKwartetScore(roundIndex, mi, "Triplet", "A", e.target.value)}
                                    />
                                    <span>&ndash;</span>
                                    <input
                                      type="number"
                                      min={0}
                                      max={13}
                                      value={m.scoreTripletB ?? ""}
                                      onChange={(e) => updateKwartetScore(roundIndex, mi, "Triplet", "B", e.target.value)}
                                    />
                                    <span className="hint" style={{ fontSize: "0.7rem" }}>
                                      {t.match13.tripletLabel}
                                    </span>
                                  </span>
                                </span>
                              ) : (
                                <span className={"prev-score-edit" + (isInvalidMatch(m) ? " invalid" : "")}>
                                  <input
                                    className={scoreClass(m, "scoreA")}
                                    type="number"
                                    min={0}
                                    max={13}
                                    value={m.scoreA ?? ""}
                                    onChange={(e) =>
                                      updateScore(roundIndex, mi, "scoreA", e.target.value)
                                    }
                                  />
                                  <span>&ndash;</span>
                                  <input
                                    className={scoreClass(m, "scoreB")}
                                    type="number"
                                    min={0}
                                    max={13}
                                    value={m.scoreB ?? ""}
                                    onChange={(e) =>
                                      updateScore(roundIndex, mi, "scoreB", e.target.value)
                                    }
                                  />
                                </span>
                              )}
                              <span className={m.scoreB === 13 ? "winner" : "loser"}>
                                {sideLabel(m, "B")}
                              </span>
                            </>
                          ) : (
                            <span className="prev-score hint">{t.match13.byeScoreLabel}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
              </details>
            )}
          </section>
        )}

        {tab === "klassement" && (
          <section className="card fade-in" style={{ overflowX: "auto" }}>
            <div className="zaal-head">
              <h2>{t.match13.klassementTitel}</h2>
              {!isPoules && standings.length > 0 && (
                <button className="match13-actie-knop" onClick={() => window.print()}>
                  {t.match13.printKlassement}
                </button>
              )}
            </div>
            {!isPoules && printKlassementBlad}
            {isPoules ? (
              teams.length === 0 ? (
                <p className="hint">{t.match13.nogGeenTeams}</p>
              ) : (
                <>
                  {champion && (
                    <div className="finish-banner">
                      {t.match13.kampioenLabel} {numNameOf(champion)}!
                    </div>
                  )}
                  <h3 style={{ marginTop: champion ? "1.2rem" : 0 }}>{t.match13.poulesHeader}</h3>
                  {pouleLabelsSorted.map((label, pi) => {
                    const pouleTeams = pouleTeamsByLabel.get(label)!;
                    const accent = pouleColor(pi);
                    return (
                      <div key={label} style={{ marginBottom: "1.8rem" }}>
                        <h4 style={{ margin: "0 0 0.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span className="poule-dot" style={{ background: accent }} />
                          {t.match13.pouleLabel(label)}
                        </h4>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                          <BracketColumns
                            matches={pouleBracket.filter((m) => m.poule === label)}
                            numNameOf={numNameOf}
                            accent={accent}
                          />
                          {usesBarrageBracket(pouleTeams.length) && (
                            <PouleQualifiersBadge
                              matches={pouleBracket.filter((m) => m.poule === label)}
                              numNameOf={numNameOf}
                              accent={accent}
                            />
                          )}
                        </div>
                        {!usesBarrageBracket(pouleTeams.length) && (
                          <PouleStandingsTable
                            rows={roundRobinStandings(pouleTeams, pouleBracket.filter((m) => m.poule === label))}
                          />
                        )}
                      </div>
                    );
                  })}

                  {knockoutStarted && (
                    <>
                      <h3>{t.match13.knockoutHeader}</h3>
                      <BracketColumns matches={knockoutBracket} numNameOf={numNameOf} />
                    </>
                  )}
                </>
              )
            ) : standings.length === 0 ? (
              <p className="hint">{t.match13.nogGeenTeams}</p>
            ) : (
              <table className="standings">
                <thead>
                  <tr>
                    <th></th>
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
                      <td>
                        {i < 3 ? (
                          <span className={"rank " + (i === 0 ? "g" : i === 1 ? "s" : "b")}>
                            {i + 1}
                          </span>
                        ) : (
                          i + 1
                        )}
                      </td>
                      <td className="team-name">
                        <div className="team-cell">
                          <span className="team-num">{row.number}</span>
                          <span>{row.name}</span>
                        </div>
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
          </section>
        )}
      </div>

      <footer className="app-footer">
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
  );
}
