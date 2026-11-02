"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { meldNieuweClub, wisNieuweClubMelding, zoekClubsVoorMatch13, type ClubHit } from "@/actions/match13-clubs";

export interface ClubWaarde {
  naam: string;
  clubId?: string;
  adres?: string;
  gemeente?: string;
  nieuw?: boolean;
  geenPetanqueclub?: boolean;
}

// Het clubveld in Opzet:
//  - tik een clubnaam: de Petanque13-clublijst verschijnt als suggestie; kies je er één,
//    dan wordt de club gekoppeld en komt het adres er meteen bij
//  - staat de club er niet bij, dan kun je een nieuwe club gebruiken (de admin krijgt
//    een melding om dat na te kijken; het toernooi werkt gewoon door)
//  - "geen petanqueclub" (bv. een voetbalclub of bedrijf): gewoon de naam van de
//    organisatie, zonder koppeling en zonder melding
export function Match13ClubVeld({
  tournamentId,
  waarde,
  onChange,
  fout,
}: {
  tournamentId: string;
  waarde: ClubWaarde;
  onChange: (patch: Partial<ClubWaarde>) => void;
  fout?: boolean;
}) {
  const { t } = useTranslation();
  const [hits, setHits] = useState<ClubHit[]>([]);
  const [open, setOpen] = useState(false);
  const [zoeken, setZoeken] = useState(false);
  const [gemeenteTekst, setGemeenteTekst] = useState(waarde.gemeente ?? "");
  const tijdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const laatsteZoek = useRef("");

  const gekozen = !!waarde.clubId;
  const tekst = waarde.naam.trim();

  useEffect(() => {
    if (waarde.geenPetanqueclub || gekozen || tekst.length < 2) {
      setHits([]);
      return;
    }
    if (tijdRef.current) clearTimeout(tijdRef.current);
    tijdRef.current = setTimeout(async () => {
      laatsteZoek.current = tekst;
      setZoeken(true);
      try {
        const resultaat = await zoekClubsVoorMatch13(tekst);
        if (laatsteZoek.current === tekst) setHits(resultaat);
      } finally {
        setZoeken(false);
      }
    }, 250);
    return () => {
      if (tijdRef.current) clearTimeout(tijdRef.current);
    };
  }, [tekst, gekozen, waarde.geenPetanqueclub]);

  const exacteMatch = hits.some((h) => h.naam.trim().toLowerCase() === tekst.toLowerCase());
  const toonNieuwOptie = !gekozen && !waarde.geenPetanqueclub && tekst.length >= 3 && !exacteMatch;

  function kies(hit: ClubHit) {
    setOpen(false);
    setHits([]);
    setGemeenteTekst(hit.gemeente);
    onChange({ naam: hit.naam, clubId: hit.id, adres: hit.adres ?? "", gemeente: hit.gemeente, nieuw: false });
    void wisNieuweClubMelding(tournamentId);
  }

  function gebruikNieuw() {
    setOpen(false);
    onChange({ clubId: undefined, adres: undefined, nieuw: true });
  }

  function wijzig() {
    onChange({ clubId: undefined, adres: undefined, gemeente: undefined, nieuw: false });
    setGemeenteTekst("");
  }

  async function bewaarGemeente() {
    const g = gemeenteTekst.trim();
    onChange({ gemeente: g });
    if (g.length >= 2 && tekst.length >= 2) await meldNieuweClub({ toernooiId: tournamentId, naam: tekst, gemeente: g });
  }

  return (
    <div className="club-veld">
      <label className="checkbox-label club-veld-geen">
        <input
          type="checkbox"
          checked={!!waarde.geenPetanqueclub}
          onChange={(e) => {
            const aan = e.target.checked;
            onChange({ geenPetanqueclub: aan, clubId: undefined, adres: undefined, gemeente: undefined, nieuw: false });
            setGemeenteTekst("");
            setHits([]);
            if (aan) void wisNieuweClubMelding(tournamentId);
          }}
        />
        <span>{t.match13.geenPetanqueclub}</span>
      </label>

      <label className="club-veld-label">
        {waarde.geenPetanqueclub ? t.match13.organisatieNaam : t.match13.club}
      </label>
      <div className="club-veld-invoer">
        <input
          value={waarde.naam}
          autoComplete="off"
          placeholder={waarde.geenPetanqueclub ? t.match13.organisatiePlaceholder : t.match13.clubZoekPlaceholder}
          style={fout ? { borderColor: "var(--warn)" } : undefined}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => {
            // de naam wijzigt: een eerdere koppeling vervalt, tenzij het nog dezelfde naam is
            onChange({ naam: e.target.value, clubId: undefined, adres: undefined, nieuw: false });
            setOpen(true);
          }}
        />
        {open && !waarde.geenPetanqueclub && !gekozen && (hits.length > 0 || toonNieuwOptie || zoeken) && (
          <div className="club-veld-lijst" role="listbox">
            {zoeken && hits.length === 0 && <div className="club-veld-bezig">{t.match13.clubZoeken}</div>}
            {hits.map((h) => (
              <button
                type="button"
                key={h.id}
                className="club-veld-hit"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => kies(h)}
              >
                <strong>{h.naam}</strong>
                <span>{[h.adres, h.gemeente].filter(Boolean).join(" · ")}</span>
              </button>
            ))}
            {toonNieuwOptie && (
              <button
                type="button"
                className="club-veld-hit club-veld-nieuw"
                onMouseDown={(e) => e.preventDefault()}
                onClick={gebruikNieuw}
              >
                <strong>{t.match13.nieuweClubGebruiken(tekst)}</strong>
                <span>{t.match13.nieuweClubUitleg}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {gekozen && (
        <div className="club-veld-kaart">
          <div>
            <strong>{waarde.naam}</strong>
            <span>{[waarde.adres, waarde.gemeente].filter(Boolean).join(" · ") || "—"}</span>
          </div>
          <button type="button" className="link-btn" onClick={wijzig}>
            {t.match13.wijzigClub}
          </button>
        </div>
      )}

      {waarde.nieuw && !gekozen && !waarde.geenPetanqueclub && (
        <div className="club-veld-nieuw-blok">
          <label className="club-veld-label">{t.match13.nieuweClubGemeente}</label>
          <input
            value={gemeenteTekst}
            autoComplete="address-level2"
            placeholder={t.match13.clubGemeentePlaceholder}
            style={gemeenteTekst.trim().length < 2 ? { borderColor: "var(--warn)" } : undefined}
            onChange={(e) => setGemeenteTekst(e.target.value)}
            onBlur={() => void bewaarGemeente()}
          />
          <p className="hint">{t.match13.nieuweClubMelding}</p>
        </div>
      )}
    </div>
  );
}
