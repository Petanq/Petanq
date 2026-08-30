"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import {
  match13GegevensWijzigen,
  type Match13GebruikerMetToernooien,
  type EchteClub,
} from "@/actions/match13-toegang";
import { Match13ClubKiezer } from "@/components/match13/Match13ClubKiezer";

export function Match13GebruikerDetail({
  gebruiker,
  echteClubs,
}: {
  gebruiker: Match13GebruikerMetToernooien;
  echteClubs: EchteClub[];
}) {
  const { t, taal } = useTranslation();
  const router = useRouter();
  const [bewerken, setBewerken] = useState(false);
  const [club, setClub] = useState(gebruiker.club);
  const [naam, setNaam] = useState(gebruiker.naam);
  const [bezig, setBezig] = useState(false);

  async function opslaan(e: React.FormEvent) {
    e.preventDefault();
    if (!club.trim() || !naam.trim()) return;
    setBezig(true);
    await match13GegevensWijzigen(gebruiker.id, { club: club.trim(), naam: naam.trim() });
    setBezig(false);
    setBewerken(false);
    router.refresh();
  }

  return (
    <div className="match13-lijst-pagina">
      <div className="match13-lijst-head" style={{ display: "block" }}>
        <nav className="match13-broodkruimel">
          <Link href="/beheer">{t.match13.beheerWoord}</Link>
          <span>/</span>
          <Link href="/beheer/match13">
            Match<span className="m13-gold">13</span>
          </Link>
          <span>/</span>
          <Link href="/beheer/match13/toegang">← {t.match13.toegangWoord}</Link>
          <span>/</span>
          <span className="huidig">{gebruiker.club}</span>
        </nav>

        {bewerken ? (
          <form className="match13-bewerk-form" style={{ margin: "0.3rem 0" }} onSubmit={opslaan}>
            <Match13ClubKiezer value={club} onChange={setClub} echteClubs={echteClubs} />
            <input
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              placeholder={t.match13.naamContactpersoon}
            />
            <button type="submit" className="link-btn" disabled={bezig}>
              {t.match13.opslaan}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setBewerken(false);
                setClub(gebruiker.club);
                setNaam(gebruiker.naam);
              }}
            >
              {t.beheer.annuleren}
            </button>
          </form>
        ) : (
          <h1 style={{ marginBottom: "0.3rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {gebruiker.club}
            <button
              type="button"
              className="link-btn"
              style={{ fontSize: "0.8rem" }}
              onClick={() => setBewerken(true)}
            >
              {t.match13.bewerken}
            </button>
          </h1>
        )}
        <p style={{ color: "var(--ink-muted)", margin: 0 }}>{t.match13.verantwoordelijke(gebruiker.naam, gebruiker.email)}</p>
      </div>

      <div className="match13-lijst-head" style={{ display: "block" }}>
        <h2 style={{ margin: "0 0 0.8rem", fontSize: "1.15rem" }}>{t.match13.clubgegevensTitel}</h2>
        {gebruiker.echteClub ? (
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            {gebruiker.echteClub.foto_url && (
              <img
                src={gebruiker.echteClub.foto_url}
                alt=""
                style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", flex: "0 0 auto" }}
              />
            )}
            <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.3rem 0.8rem" }}>
              <dt style={{ color: "var(--ink-muted)" }}>{t.match13.labelAdres}</dt>
              <dd style={{ margin: 0 }}>
                {[gebruiker.echteClub.adres, gebruiker.echteClub.gemeente].filter(Boolean).join(", ") || "—"}
              </dd>
              <dt style={{ color: "var(--ink-muted)" }}>{t.match13.labelTelefoon}</dt>
              <dd style={{ margin: 0 }}>{gebruiker.echteClub.telefoon || "—"}</dd>
              <dt style={{ color: "var(--ink-muted)" }}>{t.match13.labelWebsite}</dt>
              <dd style={{ margin: 0 }}>
                {gebruiker.echteClub.website ? (
                  <a href={gebruiker.echteClub.website} target="_blank" rel="noreferrer">
                    {gebruiker.echteClub.website}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
              <dt style={{ color: "var(--ink-muted)" }}>{t.match13.labelOpeningsuren}</dt>
              <dd style={{ margin: 0 }}>{gebruiker.echteClub.openingsuren || "—"}</dd>
            </dl>
          </div>
        ) : (
          <p className="hint">{t.match13.geenClubGekoppeld}</p>
        )}
      </div>

      <div className="match13-lijst-head" style={{ display: "block" }}>
        <h2 style={{ margin: "0 0 0.8rem", fontSize: "1.15rem" }}>
          {t.match13.toernooienVanClub(gebruiker.toernooien.length)}
        </h2>
        {gebruiker.toernooien.length === 0 ? (
          <p className="hint">{t.match13.nogGeenToernooien}</p>
        ) : (
          <ul className="match13-lijst">
            {gebruiker.toernooien.map((tour) => (
              <li key={tour.id} className="match13-lijst-rij">
                <Link href={`/beheer/match13/${tour.id}`}>
                  <span className="match13-lijst-naam">{tour.naam || t.match13.naamloosToernooi}</span>
                  <span className="match13-lijst-datum">
                    {t.match13.bijgewerkt(new Date(tour.bijgewerkt_op).toLocaleString(taal === "fr" ? "fr-BE" : "nl-BE"))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
