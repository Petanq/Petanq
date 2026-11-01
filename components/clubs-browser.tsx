"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { Club } from "@/lib/types";
import { ALLE_PROVINCIES, Provincie, Regio, vertaalProvincie, vertaalRegio } from "@/lib/provincies";
import { ClubCard } from "./club-card";
import { AddClubCard } from "./add-club-card";
import { ClubsGsmKop } from "./clubs-gsm-kop";
import { ZoekIcoon } from "./ui/zoek-icoon";
import { Plaats, PostcodeIndex, dichtstbijzijndeClubs, laadPostcodes, zoekPlaatsen } from "@/lib/postcodes";

const REGIOS: Regio[] = ["vlaanderen", "wallonie", "brussel"];

export function ClubsBrowser({ clubs }: { clubs: Club[] }) {
  const { t, taal } = useTranslation();
  const [zoek, setZoekTekst] = useState("");
  const [postcodes, setPostcodes] = useState<PostcodeIndex | null>(null);
  const [gekozenPlaats, setGekozenPlaats] = useState<Plaats | null>(null);

  // Elke wijziging van de zoektekst wist de gekozen plaats; de lijst met
  // postcodes wordt pas ingeladen als iemand echt begint te typen.
  function setZoek(tekst: string) {
    setZoekTekst(tekst);
    setGekozenPlaats(null);
    if (tekst.trim().length >= 2 && !postcodes) laadPostcodes().then(setPostcodes);
  }
  const [regioFilter, setRegioFilter] = useState<Regio | null>(null);
  const [opengeklapt, setOpengeklapt] = useState<Set<Provincie>>(new Set());

  useEffect(() => {
    function klapOpenVoorHash() {
      const hash = window.location.hash.replace("#", "") as Provincie;
      if (ALLE_PROVINCIES.includes(hash)) {
        setOpengeklapt((prev) => new Set(prev).add(hash));
      }
    }
    klapOpenVoorHash();
    window.addEventListener("hashchange", klapOpenVoorHash);
    return () => window.removeEventListener("hashchange", klapOpenVoorHash);
  }, []);

  function toggleProvincie(p: Provincie) {
    setOpengeklapt((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  function kiesProvincieOpKaart(p: Provincie) {
    setRegioFilter(null);
    setZoek("");
    setOpengeklapt((prev) => new Set(prev).add(p));
    requestAnimationFrame(() => {
      document.getElementById(p)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function kiesRegio(regio: Regio) {
    setRegioFilter(regio);
    setZoek("");
    requestAnimationFrame(() => {
      document.getElementById("clubs-lijst")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const aantalPerProvincie = useMemo(() => {
    const tellingen: Record<string, number> = {};
    for (const club of clubs) {
      tellingen[club.provincie] = (tellingen[club.provincie] ?? 0) + 1;
    }
    return tellingen;
  }, [clubs]);

  const suggesties = useMemo(
    () => (postcodes && !gekozenPlaats ? zoekPlaatsen(postcodes, zoek) : []),
    [postcodes, zoek, gekozenPlaats]
  );
  // Een volledige postcode (4 cijfers) hoeft niet aangeklikt te worden.
  const plaats = gekozenPlaats ?? (/^\d{4}$/.test(zoek.trim()) ? suggesties[0] ?? null : null);
  const nabij = useMemo(
    () => (postcodes && plaats ? dichtstbijzijndeClubs(postcodes, clubs, plaats.lat, plaats.lng, 9) : null),
    [postcodes, plaats, clubs]
  );

  function kiesPlaats(p: Plaats) {
    setGekozenPlaats(p);
    requestAnimationFrame(() => {
      // Er bestaat een gsm- en een pc-blok; scroll naar het blok dat zichtbaar is.
      const zichtbaar = Array.from(document.querySelectorAll<HTMLElement>("[data-nabij]")).find((e) => e.offsetParent !== null);
      zichtbaar?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }
  function sluitPlaats() {
    setGekozenPlaats(null);
    setZoekTekst("");
  }
  function enterKiest(e: React.KeyboardEvent) {
    if (e.key === "Enter" && suggesties[0] && !plaats) kiesPlaats(suggesties[0]);
  }

  const gefilterd = useMemo(() => {
    // Met een gekozen plaats toont de lijst alle clubs; de dichtstbijzijnde staan erboven.
    const term = plaats ? "" : zoek.trim().toLowerCase();
    return clubs.filter((club) => {
      if (regioFilter && club.regio !== regioFilter) return false;
      if (term && !`${club.naam} ${club.gemeente} ${club.adres ?? ""}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [clubs, zoek, regioFilter, plaats]);

  const regiosMetData = REGIOS.filter((regio) => !regioFilter || regio === regioFilter);

  return (
    <>
      {/* Eigen donkere kop (zelfde stijl op gsm en pc), tot aan de randen van het scherm. */}
      <div className="border-b-4 border-geel bg-[#161616]">
        <div className="mx-auto max-w-[1140px] px-6 pb-8 pt-8 lg:px-10">
          <ClubsGsmKop
            clubs={clubs}
            aantalPerProvincie={aantalPerProvincie}
            zoek={zoek}
            setZoek={setZoek}
            regioFilter={regioFilter}
            setRegioFilter={setRegioFilter}
            onProvincieKiezen={kiesProvincieOpKaart}
            onRegioKiezen={kiesRegio}
            onZoekKeyDown={enterKiest}
            suggesties={plaats ? [] : suggesties}
            onPlaatsKiezen={kiesPlaats}
            nabij={plaats && nabij ? { plaats, resultaat: nabij } : null}
            onNabijSluiten={sluitPlaats}
          />
        </div>
      </div>

      <div id="provincies" className="mx-auto max-w-[1140px] px-6 py-8 lg:px-10">
        <a
          href={`mailto:info@petanque13.be?subject=${encodeURIComponent("Melding fout bij een club")}`}
          className="mb-6 inline-block text-xs font-semibold text-grijs underline hover:text-donker"
        >
          {t.lijst.meldFout}
        </a>

      <div id="clubs-lijst" className="scroll-mt-20" />

      {gefilterd.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-rand bg-white p-8 text-center text-sm text-grijs">
          <ZoekIcoon />
          {t.clubsPagina.geenResultaten}
        </div>
      )}

      {regiosMetData.map((regio) => {
        const zichtbareProvincies = ALLE_PROVINCIES.filter(
          (p) =>
            gefilterd.some((c) => c.provincie === p) &&
            gefilterd.find((c) => c.provincie === p)?.regio === regio
        );

        if (zichtbareProvincies.length === 0) return null;

        return (
          <section key={regio} className="mb-10">
            <h2 className="mb-4 font-titel text-2xl tracking-wide text-blauw-2">
              {vertaalRegio(regio, taal)}
            </h2>
            {zichtbareProvincies.map((provincie) => {
              const clubsInProvincie = gefilterd.filter((c) => c.provincie === provincie);
              const uitgeklapt = (zoek.trim().length > 0 && !plaats) || opengeklapt.has(provincie);
              return (
                <div
                  key={provincie}
                  id={provincie}
                  className={`mb-3 scroll-mt-20 rounded-[10px] border-[1.5px] bg-white transition-shadow ${
                    uitgeklapt ? "border-geel/60 shadow-[0_2px_10px_rgba(244,196,48,0.15)]" : "border-rand"
                  }`}
                >
                  <button
                    onClick={() => toggleProvincie(provincie)}
                    className="group flex w-full items-center justify-between gap-2 p-4 text-left"
                  >
                    <span className="text-[0.8rem] font-extrabold uppercase tracking-widest text-[#b8860b] transition-colors group-hover:text-donker">
                      {vertaalProvincie(provincie, taal)}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="rounded-full bg-[#fdf3d9] px-2.5 py-0.5 text-xs font-bold text-[#b8860b]">
                        {clubsInProvincie.length}
                      </span>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-[#b8860b] transition-all ${
                          uitgeklapt
                            ? "rotate-90 bg-geel text-donker"
                            : "bg-[#fdf3d9] group-hover:bg-geel group-hover:text-donker"
                        }`}
                        aria-hidden="true"
                      >
                        ›
                      </span>
                    </span>
                  </button>
                  {uitgeklapt && (
                    <div className="grid grid-cols-1 gap-2.5 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-3">
                      {clubsInProvincie.map((club) => (
                        <ClubCard key={club.id} club={club} />
                      ))}
                      <AddClubCard provincie={provincie} />
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
      </div>
    </>
  );
}
