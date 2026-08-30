"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import {
  match13GebruikerUitnodigen,
  match13GebruikerVerwijderen,
  match13GegevensWijzigen,
  match13LinkOpnieuwSturen,
  match13StatusWijzigen,
  match13ToegangWijzigen,
  type Match13Gebruiker,
  type EchteClub,
} from "@/actions/match13-toegang";
import { Match13ClubKiezer } from "@/components/match13/Match13ClubKiezer";

export function Match13ToegangList({
  gebruikers,
  echteClubs,
}: {
  gebruikers: Match13Gebruiker[];
  echteClubs: EchteClub[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const aantalPerNaam = new Map<string, number>();
  for (const g of gebruikers) {
    const key = g.club.toLowerCase().trim();
    aantalPerNaam.set(key, (aantalPerNaam.get(key) ?? 0) + 1);
  }

  // Groepeer per club i.p.v. per persoon — meerdere uitgenodigde mensen van
  // dezelfde club delen dezelfde toernooien, dus horen ze visueel ook samen.
  // Groeperen gebeurt bij voorkeur op de gekoppelde echte club (club_id); wie
  // nog niet gekoppeld is (bv. een typfout die nog niet gecorrigeerd is)
  // groepeert voorlopig op de ingetypte naam, zodat niemand uit beeld valt.
  const groepenMap = new Map<string, { key: string; club: string; echteClub?: EchteClub; leden: Match13Gebruiker[] }>();
  for (const g of gebruikers) {
    const key = g.club_id ?? `naam:${g.club.toLowerCase().trim()}`;
    let groep = groepenMap.get(key);
    if (!groep) {
      groep = { key, club: g.club, echteClub: g.club_id ? echteClubs.find((c) => c.id === g.club_id) : undefined, leden: [] };
      groepenMap.set(key, groep);
    }
    groep.leden.push(g);
  }
  const groepen = Array.from(groepenMap.values()).sort((a, b) => a.club.localeCompare(b.club));

  const [club, setClub] = useState("");
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [nieuweLink, setNieuweLink] = useState<string | null>(null);
  const [rijBezig, setRijBezig] = useState<string | null>(null);
  const [rijLinks, setRijLinks] = useState<Record<string, string>>({});
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [bewerkClub, setBewerkClub] = useState("");
  const [bewerkNaam, setBewerkNaam] = useState("");

  const [toevoegClubKey, setToevoegClubKey] = useState<string | null>(null);
  const [toevoegNaam, setToevoegNaam] = useState("");
  const [toevoegEmail, setToevoegEmail] = useState("");
  const [toevoegBezig, setToevoegBezig] = useState(false);
  const [toevoegFout, setToevoegFout] = useState<string | null>(null);
  const [toevoegLink, setToevoegLink] = useState<string | null>(null);

  const foutLabels: Record<string, string> = {
    al_geregistreerd: t.match13.foutAlGeregistreerd,
    server_fout: t.match13.foutServer,
    niet_geautoriseerd: t.match13.foutNietGeautoriseerd,
  };

  async function uitnodigen(e: React.FormEvent) {
    e.preventDefault();
    if (!club.trim() || !naam.trim() || !email.trim()) return;
    setBezig(true);
    setFout(null);
    setNieuweLink(null);
    const result = await match13GebruikerUitnodigen({
      club: club.trim(),
      naam: naam.trim(),
      email: email.trim(),
    });
    setBezig(false);
    if (!result.succes) {
      setFout(foutLabels[result.fout] ?? result.fout);
      return;
    }
    setNieuweLink(result.link);
    setClub("");
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

  function bewerkStarten(g: Match13Gebruiker) {
    setBewerkId(g.id);
    setBewerkClub(g.club);
    setBewerkNaam(g.naam);
  }

  async function bewerkOpslaan(e: React.FormEvent, g: Match13Gebruiker) {
    e.preventDefault();
    if (!bewerkClub.trim() || !bewerkNaam.trim()) return;
    setRijBezig(g.id);
    await match13GegevensWijzigen(g.id, { club: bewerkClub.trim(), naam: bewerkNaam.trim() });
    setRijBezig(null);
    setBewerkId(null);
    router.refresh();
  }

  function toevoegStarten(groepKey: string) {
    setToevoegClubKey(groepKey);
    setToevoegNaam("");
    setToevoegEmail("");
    setToevoegFout(null);
    setToevoegLink(null);
  }

  async function persoonToevoegen(e: React.FormEvent, clubNaam: string) {
    e.preventDefault();
    if (!toevoegNaam.trim() || !toevoegEmail.trim()) return;
    setToevoegBezig(true);
    setToevoegFout(null);
    const result = await match13GebruikerUitnodigen({
      club: clubNaam,
      naam: toevoegNaam.trim(),
      email: toevoegEmail.trim(),
    });
    setToevoegBezig(false);
    if (!result.succes) {
      setToevoegFout(foutLabels[result.fout] ?? result.fout);
      return;
    }
    setToevoegLink(result.link);
    setToevoegNaam("");
    setToevoegEmail("");
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
          <label>{t.match13.naamClub}</label>
          <Match13ClubKiezer value={club} onChange={setClub} echteClubs={echteClubs} aantalPerNaam={aantalPerNaam} />
          <p className="hint" style={{ margin: 0 }}>{t.match13.kiesBestaandeClub}</p>
        </div>
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
        <button
          type="submit"
          className="cta"
          disabled={bezig || !club.trim() || !naam.trim() || !email.trim()}
        >
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

      {groepen.length === 0 ? (
        <p className="hint">{t.match13.nogGeenPilootclubs}</p>
      ) : (
        <div className="roster">
          {groepen.map((groep) => (
            <div className="card match13-club-kaart" key={groep.key} style={{ marginBottom: "1rem" }}>
              <div className="match13-club-rij" style={{ marginBottom: groep.echteClub ? "0.2rem" : "0.6rem" }}>
                <Link
                  href={`/beheer/match13/toegang/${groep.leden[0].id}`}
                  className="match13-toegang-naam-link match13-club-titel"
                >
                  {groep.club}
                </Link>
                <Link href={`/beheer/match13/toegang/${groep.leden[0].id}`} className="team-num team-num-toggle">
                  {t.match13.aantalToernooien(groep.leden[0].toernooiAantal)}
                </Link>
              </div>
              {groep.echteClub && (
                <p className="hint" style={{ margin: "0 0 0.8rem" }}>
                  {groep.echteClub.gemeente}
                </p>
              )}
              <hr className="match13-club-scheiding" />

              {groep.leden.map((g) => (
                <div className="match13-toegang-rij-wrap" key={g.id}>
                  <div className="roster-row match13-toegang-rij">
                    <div className="match13-toegang-info">
                      {bewerkId === g.id ? (
                        <form className="match13-bewerk-form" onSubmit={(e) => bewerkOpslaan(e, g)}>
                          <Match13ClubKiezer value={bewerkClub} onChange={setBewerkClub} echteClubs={echteClubs} aantalPerNaam={aantalPerNaam} />
                          <input
                            value={bewerkNaam}
                            onChange={(e) => setBewerkNaam(e.target.value)}
                            placeholder={t.match13.naamContactpersoon}
                          />
                          <button type="submit" className="link-btn" disabled={rijBezig === g.id}>
                            {t.match13.opslaan}
                          </button>
                          <button type="button" className="link-btn" onClick={() => setBewerkId(null)}>
                            {t.beheer.annuleren}
                          </button>
                        </form>
                      ) : (
                        <>
                          <span className="match13-club-rij">
                            <strong>{g.naam}</strong>
                            <button type="button" className="link-btn" onClick={() => bewerkStarten(g)}>
                              {t.match13.bewerken}
                            </button>
                          </span>
                          <span className="match13-badges-rij">
                            <button
                              type="button"
                              className="team-num team-num-toggle"
                              disabled={rijBezig === g.id}
                              onClick={() => toggle(g)}
                              title={t.match13.toegangAanCheck}
                              style={
                                g.actief
                                  ? { color: "var(--live)", background: "var(--live-bg)" }
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
                        </>
                      )}
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

              {toevoegClubKey === groep.key ? (
                <form
                  className="match13-bewerk-form"
                  style={{ marginTop: "0.8rem" }}
                  onSubmit={(e) => persoonToevoegen(e, groep.club)}
                >
                  <input
                    autoFocus
                    value={toevoegNaam}
                    onChange={(e) => setToevoegNaam(e.target.value)}
                    placeholder={t.match13.naamContactpersoonPlaceholder}
                  />
                  <input
                    type="email"
                    value={toevoegEmail}
                    onChange={(e) => setToevoegEmail(e.target.value)}
                    placeholder={t.match13.emailadresPlaceholder}
                  />
                  <button
                    type="submit"
                    className="link-btn"
                    disabled={toevoegBezig || !toevoegNaam.trim() || !toevoegEmail.trim()}
                  >
                    {toevoegBezig ? t.match13.bezig : t.match13.uitnodigen}
                  </button>
                  <button type="button" className="link-btn" onClick={() => setToevoegClubKey(null)}>
                    {t.beheer.annuleren}
                  </button>
                  {toevoegFout && (
                    <p className="hint" style={{ color: "#fca5a5", flex: "1 1 100%", margin: 0 }}>
                      {toevoegFout}
                    </p>
                  )}
                  {toevoegLink && (
                    <div className="match13-link-box" style={{ flex: "1 1 100%" }}>
                      <p className="hint" style={{ marginBottom: "0.4rem" }}>
                        {t.match13.linkUitleg}
                      </p>
                      <code>{toevoegLink}</code>
                    </div>
                  )}
                </form>
              ) : (
                <button
                  type="button"
                  className="link-btn"
                  style={{ marginTop: "0.6rem" }}
                  onClick={() => toevoegStarten(groep.key)}
                >
                  {t.match13.voegPersoonToeAanClub}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
