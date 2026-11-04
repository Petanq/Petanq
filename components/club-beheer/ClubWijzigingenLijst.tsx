"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import {
  keurWijzigingGoed,
  wijsWijzigingAf,
  zetClubVertrouwd,
  type TeKeurenWijziging,
} from "@/actions/club-beheer";
import {
  DAG_NAMEN_FR,
  DAG_NAMEN_NL,
  formatDagUren,
  veranderdeDagen,
  type ClubUren,
  type DagUren,
  type Seizoen,
} from "@/lib/club-beheer/uren";
import { Match13TerugKnop } from "@/components/match13/Match13TerugKnop";
import "./club-beheer.css";

const GEGEVENS_LABELS = { adres: "adres", contact_email: "email", telefoon: "telefoon", website: "website" } as const;

function dagTekst(d: DagUren | undefined, gesloten: string): string {
  if (!d) return "—";
  const basis = formatDagUren(d, gesloten);
  return d.open && (d.soort !== "open" || d.notitie) ? `${basis} · ${[d.soort !== "open" ? d.soort : "", d.notitie].filter(Boolean).join(", ")}` : basis;
}

function Kaart({ w }: { w: TeKeurenWijziging }) {
  const { t, taal } = useTranslation();
  const c = t.clubBeheer;
  const router = useRouter();
  const [reden, setReden] = useState("");
  const [bezig, setBezig] = useState(false);
  const [vertrouwd, setVertrouwd] = useState(w.vertrouwd);
  const [fout, setFout] = useState(false);
  const dagNamen = taal === "fr" ? DAG_NAMEN_FR : DAG_NAMEN_NL;
  const huidigeUren: ClubUren | null = w.huidigeUren;

  async function actie(f: () => Promise<{ succes: boolean }>) {
    setBezig(true);
    setFout(false);
    const r = await f();
    setBezig(false);
    if (r.succes) router.refresh();
    else setFout(true);
  }

  const gegevensSleutels = Object.keys(w.voorstel.gegevens ?? {}) as (keyof typeof GEGEVENS_LABELS)[];
  const seizoenen: Seizoen[] = ["zomer", "winter"];

  return (
    <div className="cb-keur-kaart">
      <div className="cb-keur-kop">
        <h2>{w.clubNaam}</h2>
        <span>{c.keurIngediend(new Date(w.ingediendOp).toLocaleString(taal === "fr" ? "fr-BE" : "nl-BE"))}</span>
      </div>

      {gegevensSleutels.length > 0 && (
        <div className="cb-voor-na" style={{ marginBottom: "0.8rem" }}>
          <div>
            <h3>{c.keurNuOnline}</h3>
            {gegevensSleutels.map((s) => (
              <div className="rij" key={s}>
                <span>{GEGEVENS_LABELS[s]}</span>
                <span>{w.huidigeGegevens[s] || "—"}</span>
              </div>
            ))}
          </div>
          <div className="na">
            <h3>{c.keurVoorstel}</h3>
            {gegevensSleutels.map((s) => (
              <div className="rij anders" key={s}>
                <span>{GEGEVENS_LABELS[s]}</span>
                <span>{w.voorstel.gegevens?.[s] || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {w.voorstel.uren &&
        seizoenen.map((s) => {
          const nieuw = w.voorstel.uren![s];
          const oud = huidigeUren?.[s] ?? [];
          const verschil = veranderdeDagen(oud, nieuw);
          if (!verschil.some(Boolean)) return null;
          return (
            <div className="cb-voor-na" key={s} style={{ marginBottom: "0.8rem" }}>
              <div>
                <h3>
                  {c.keurNuOnline} · {s === "zomer" ? c.zomer : c.winter}
                </h3>
                {huidigeUren ? (
                  nieuw.map((_, i) => (
                    <div className={"rij"} key={i}>
                      <span>{dagNamen[i]}</span>
                      <span>{dagTekst(oud[i], c.gesloten)}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ margin: 0, color: "#777" }}>{c.keurGeenUren}</p>
                )}
              </div>
              <div className="na">
                <h3>
                  {c.keurVoorstel} · {s === "zomer" ? c.zomer : c.winter}
                </h3>
                {nieuw.map((d, i) => (
                  <div className={"rij" + (verschil[i] ? " anders" : "")} key={i}>
                    <span>{dagNamen[i]}</span>
                    <span>{dagTekst(d, c.gesloten)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {w.voorstel.uren && JSON.stringify(w.voorstel.uren.afwijkingen) !== JSON.stringify(huidigeUren?.afwijkingen ?? []) && (
        <div className="cb-voor-na" style={{ marginBottom: "0.8rem" }}>
          <div>
            <h3>
              {c.keurNuOnline} · {c.afwijkingTitel}
            </h3>
            {(huidigeUren?.afwijkingen ?? []).map((a, i) => (
              <div className="rij" key={i}>
                <span>{a.van.slice(5)}</span>
                <span>
                  {a.tot} · {a.tekst}
                </span>
              </div>
            ))}
            {(huidigeUren?.afwijkingen ?? []).length === 0 && <p style={{ margin: 0, color: "#777" }}>—</p>}
          </div>
          <div className="na">
            <h3>
              {c.keurVoorstel} · {c.afwijkingTitel}
            </h3>
            {w.voorstel.uren.afwijkingen.map((a, i) => (
              <div className="rij anders" key={i}>
                <span>{a.van.slice(5)}</span>
                <span>
                  {a.tot} · {a.tekst}
                </span>
              </div>
            ))}
            {w.voorstel.uren.afwijkingen.length === 0 && <p style={{ margin: 0, color: "#777" }}>—</p>}
          </div>
        </div>
      )}

      <div className="cb-keur-acties cb-scope">
        <button type="button" className="cb-knop" disabled={bezig} onClick={() => actie(() => keurWijzigingGoed(w.id))}>
          {c.keurGoed}
        </button>
        <input type="text" value={reden} maxLength={300} placeholder={c.keurRedenPlaceholder} aria-label={c.keurRedenPlaceholder} onChange={(e) => setReden(e.target.value)} />
        <button type="button" className="cb-knop rand" disabled={bezig} onClick={() => actie(() => wijsWijzigingAf(w.id, reden))}>
          {c.keurAfwijs}
        </button>
      </div>
      <label className="cb-vertrouwd">
        <input
          type="checkbox"
          checked={vertrouwd}
          onChange={async (e) => {
            const aan = e.target.checked;
            setVertrouwd(aan);
            const r = await zetClubVertrouwd(w.clubId, aan);
            if (!r.succes) setVertrouwd(!aan);
          }}
        />
        {c.keurVertrouwd}
      </label>
      {fout && <p className="cb-melding fout">{c.fout}</p>}
    </div>
  );
}

export function ClubWijzigingenLijst({ items }: { items: TeKeurenWijziging[] }) {
  const { t } = useTranslation();
  const c = t.clubBeheer;
  return (
    <div className="match13-lijst-pagina">
      <Match13TerugKnop href="/beheer" />
      <header className="match13-hero">
        <h1>{c.keurTitel}</h1>
        <p>{c.keurUitleg}</p>
      </header>
      {items.length === 0 ? <p className="match13-lijst-leeg">{c.keurLeeg}</p> : items.map((w) => <Kaart key={w.id} w={w} />)}
    </div>
  );
}
