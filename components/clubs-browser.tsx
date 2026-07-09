"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { Club } from "@/lib/types";
import { ALLE_PROVINCIES, Regio, vertaalProvincie, vertaalRegio } from "@/lib/provincies";
import { ClubCard } from "./club-card";
import { AddClubCard } from "./add-club-card";

const REGIOS: Regio[] = ["vlaanderen", "wallonie", "brussel"];

export function ClubsBrowser({ clubs }: { clubs: Club[] }) {
  const { t, taal } = useTranslation();
  const [zoek, setZoek] = useState("");
  const [regioFilter, setRegioFilter] = useState<Regio | null>(null);

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
          src="/images/petanque-benen.jpg"
          alt=""
          width={1140}
          height={280}
          className="h-[220px] w-full object-cover sm:h-[280px]"
          style={{ objectPosition: "center 55%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blauw/90 via-blauw/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <h1 className="font-titel text-4xl tracking-wide text-white">{t.clubsPagina.titel}</h1>
          <p className="max-w-lg text-sm text-white/70">{t.clubsPagina.beschrijving}</p>
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
              return (
                <div key={provincie} className="mb-6">
                  <h3 className="mb-2.5 text-[0.7rem] font-extrabold uppercase tracking-widest text-[#94a3b8]">
                    {vertaalProvincie(provincie, taal)}
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {clubsInProvincie.map((club) => (
                      <ClubCard key={club.id} club={club} />
                    ))}
                    <AddClubCard provincie={provincie} />
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
