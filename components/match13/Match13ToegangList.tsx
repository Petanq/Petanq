"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import {
  match13GebruikerUitnodigen,
  match13GebruikerVerwijderen,
  match13LinkOpnieuwSturen,
  match13StatusWijzigen,
  match13ToegangWijzigen,
  type Match13Gebruiker,
} from "@/actions/match13-toegang";

export function Match13ToegangList({ gebruikers }: { gebruikers: Match13Gebruiker[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [nieuweLink, setNieuweLink] = useState<string | null>(null);
  const [rijBezig, setRijBezig] = useState<string | null>(null);
  const [rijLinks, setRijLinks] = useState<Record<string, string>>({});

  const foutLabels: Record<string, string> = {
    al_geregistreerd: t.match13.foutAlGeregistreerd,
    server_fout: t.match13.foutServer,
    niet_geautoriseerd: t.match13.foutNietGeautoriseerd,
  };

  async function uitnodigen(e: React.FormEvent) {
    e.preventDefault();
    if (!naam.trim() || !email.trim()) return;
    setBezig(true);
    setFout(null);
    setNieuweLink(null);
    const result = await match13GebruikerUitnodigen({ naam: naam.trim(), email: email.trim() });
    setBezig(false);
    if (!result.succes) {
      setFout(foutLabels[result.fout] ?? result.fout);
      return;
    }
    setNieuweLink(result.link);
    setNaam("");
    setEmail("");
    router.refresh();
  }

  async function toggle(g: Match13Gebruiker) {
    setRijBezig(g.id);
    await match13ToegangWijzigen(g.id, !g.actief);
    setRijBezig(null);
    router.refresh();
  }

  async function statusToggle(g: Match13Gebruiker) {
    setRijBezig(g.id);
    await match13StatusWijzigen(g.id, g.status === "proef" ? "betalend" : "proef");
    setRijBezig(null);
    router.refresh();
  }

  async function nieuweLinkSturen(g: Match13Gebruiker) {
    setRijBezig(g.id);
    const result = await match13LinkOpnieuwSturen(g.id);
    setRijBezig(null);
    if (result.succes) {
      setRijLinks((prev) => ({ ...prev, [g.id]: result.link }));
    }
  }

  async function verwijderen(g: Match13Gebruiker) {
    if (!window.confirm(t.match13.verwijderGebruikerBevestiging(g.naam))) return;
    setRijBezig(g.id);
    await match13GebruikerVerwijderen(g.id);
    setRijBezig(null);
    router.refresh();
  }

  return (
    <div className="match13-lijst-pagina">
      <div className="match13-lijst-head" style={{ display: "block" }}>
        <nav className="match13-broodkruimel">
          <Link href="/beheer">{t.match13.beheerWoord}</Link>
          <span>/</span>
          <Link href="/beheer/match13">
            ← Match<span className="m13-gold">13</span>
          </Link>
          <span>/</span>
          <span className="huidig">{t.match13.toegangWoord}</span>
        </nav>
        <h1 style={{ marginBottom: "0.3rem" }}>
          Match<span className="m13-gold">13</span>-{t.match13.toegangWoord.toLowerCase()}
        </h1>
        <p style={{ color: "var(--ink-muted)", margin: 0 }}>{t.match13.toegangUitleg}</p>
      </div>

      <form className="match13-uitnodig-balk" style={{ marginBottom: "1.6rem" }} onSubmit={uitnodigen}>
        <h2>{t.match13.pilootclubToevoegen}</h2>
        <div className="match13-uitnodig-veld">
          <label>{t.match13.naamContactpersoon}</label>
          <input value={naam} onChange={(e) => setNaam(e.target.value)} placeholder={t.match13.naamContactpersoonPlaceholder} />
        </div>
        <div className="match13-uitnodig-veld">
          <label>{t.match13.emailadres}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.match13.emailadresPlaceholder}
          />
        </div>
        <button type="submit" className="cta" disabled={bezig || !naam.trim() || !email.trim()}>
          {bezig ? t.match13.bezig : t.match13.uitnodigen}
        </button>
        {fout && (
          <p className="hint" style={{ color: "#fca5a5", flex: "1 1 100%", margin: 0 }}>
            {fout}
          </p>
        )}
        {nieuweLink && (
          <div className="match13-link-box" style={{ flex: "1 1 100%" }}>
            <p className="hint" style={{ marginBottom: "0.4rem" }}>
              {t.match13.linkUitleg}
            </p>
            <code>{nieuweLink}</code>
          </div>
        )}
      </form>

      {gebruikers.length === 0 ? (
        <p className="hint">{t.match13.nogGeenPilootclubs}</p>
      ) : (
        <div className="roster">
          {gebruikers.map((g) => (
            <div className="match13-toegang-rij-wrap" key={g.id}>
              <div className="roster-row match13-toegang-rij">
                <div className="match13-toegang-info">
                  <span className="name">
                    {g.naam}
                    <button
                      type="button"
                      className="team-num team-num-toggle"
                      disabled={rijBezig === g.id}
                      onClick={() => toggle(g)}
                      title={t.match13.toegangAanCheck}
                      style={
                        g.actief
                          ? undefined
                          : { color: "var(--ink-muted)", background: "var(--surface-2)" }
                      }
                    >
                      {g.actief ? t.match13.actief : t.match13.gepauzeerd}
                    </button>
                    <button
                      type="button"
                      className="team-num team-num-toggle"
                      disabled={rijBezig === g.id}
                      onClick={() => statusToggle(g)}
                      title={g.status === "proef" ? t.match13.markerenAlsBetalend : t.match13.markerenAlsProef}
                      style={
                        g.status === "betalend"
                          ? { color: "var(--accent-ink)", background: "var(--accent)" }
                          : undefined
                      }
                    >
                      {g.status === "betalend" ? t.match13.statusBetalend : t.match13.statusProef}
                    </button>
                    <span
                      className="team-num"
                      style={
                        g.bevestigd
                          ? { color: "var(--live)", background: "var(--live-bg)" }
                          : { color: "var(--warn)", background: "var(--warn-bg)" }
                      }
                    >
                      {g.bevestigd ? t.match13.ingelogd : t.match13.nogNietIngelogd}
                    </span>
                  </span>
                  <span className="hint">{g.email}</span>
                </div>
                <div className="roster-actions">
                  <button
                    className="match13-actie-knop"
                    disabled={rijBezig === g.id}
                    onClick={() => nieuweLinkSturen(g)}
                  >
                    {t.match13.nieuweLinkSturen}
                  </button>
                  <button
                    className="match13-actie-knop gevaar"
                    disabled={rijBezig === g.id}
                    onClick={() => verwijderen(g)}
                  >
                    {t.match13.verwijder}
                  </button>
                </div>
              </div>
              {rijLinks[g.id] && (
                <div className="match13-link-box match13-link-box-rij">
                  <p className="hint" style={{ marginBottom: "0.4rem" }}>
                    {t.match13.linkUitleg}
                  </p>
                  <code>{rijLinks[g.id]}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
