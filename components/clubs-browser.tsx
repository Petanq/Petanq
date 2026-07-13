"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { Club } from "@/lib/types";
import { ALLE_PROVINCIES, Provincie, Regio, vertaalProvincie, vertaalRegio } from "@/lib/provincies";
import { ClubCard } from "./club-card";
import { AddClubCard } from "./add-club-card";

const REGIOS: Regio[] = ["vlaanderen", "wallonie", "brussel"];

export function ClubsBrowser({ clubs }: { clubs: Club[] }) {
  const { t, taal } = useTranslation();
  const [zoek, setZoek] = useState("");
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

  const gefilterd = useMemo(() => {
    const term = zoek.trim().toLowerCase();
    return clubs.filter((club) => {
      if (regioFilter && club.regio !== regioFilter) return false;
      if (term && !`${club.naam} ${club.gemeente}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [clubs, zoek, regioFilter]);

  const regiosMetData = REGIOS.filter((regio) => !regioFilter || regio === regioFilter);

  return (
    <div id="provincies" className="mx-auto max-w-[1140px] px-6 py-8 lg:px-10">
      <div className="relative mb-6 overflow-hidden rounded-2xl">
        <Image
          src="/images/petanque-speler.jpg"
          alt=""
          width={1140}
          height={280}
          className="h-[220px] w-full object-cover sm:h-[280px]"
          style={{ objectPosition: "center 40%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blauw/90 via-blauw/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <h1 className="font-titel text-4xl tracking-wide text-white">{t.clubsPagina.titel}</h1>
          <p className="max-w-lg text-sm text-white/70">{t.clubsPagina.beschrijving}</p>
          <a
            href={`mailto:info@petanq.be?subject=${encodeURIComponent("Melding fout bij een club")}`}
            className="mt-1 inline-block text-xs font-semibold text-white/60 underline hover:text-white"
          >
            {t.lijst.meldFout}
          </a>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRegioFilter(null)}
            className={`rounded-full border-[1.5px] px-4 py-2 text-sm font-semibold transition-colors ${
              regioFilter === null
                ? "border-blauw bg-blauw text-white"
                : "border-rand bg-white text-grijs hover:border-blauw-3"
            }`}
          >
            {t.clubsPagina.alleRegios} <span className="ml-1 opacity-70">{clubs.length}</span>
          </button>
          {REGIOS.map((regio) => (
            <button
              key={regio}
              onClick={() => setRegioFilter(regio)}
              className={`rounded-full border-[1.5px] px-4 py-2 text-sm font-semibold transition-colors ${
                regioFilter === regio
                  ? "border-blauw bg-blauw text-white"
                  : "border-rand bg-white text-grijs hover:border-blauw-3"
              }`}
            >
              {vertaalRegio(regio, taal)}{" "}
              <span className="ml-1 opacity-70">
                {clubs.filter((c) => c.regio === regio).length}
              </span>
            </button>
          ))}
        </div>
        <input
          type="text"
          value={zoek}
          onChange={(e) => setZoek(e.target.value)}
          placeholder={t.clubsPagina.zoekPlaceholder}
          className="w-full rounded-md border-[1.5px] border-rand px-3.5 py-2.5 text-sm outline-none focus:border-blauw-3 sm:w-64"
        />
      </div>

      {gefilterd.length === 0 && (
        <p className="rounded-lg border border-rand bg-white p-6 text-center text-sm text-grijs">
          {t.clubsPagina.geenResultaten}
        </p>
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
              const uitgeklapt = zoek.trim().length > 0 || opengeklapt.has(provincie);
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
  );
}
