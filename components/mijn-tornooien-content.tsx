"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { createClient } from "@/lib/supabase/client";
import { Toernooi } from "@/lib/types";
import { dagVanWeekKort, dagNummer, maandVolledig, formatUur, countdownTekst, parseDatum } from "@/lib/datum";
import { vertaalProvincie } from "@/lib/provincies";
import { getOpgeslagenToernooien, toernooiVerwijderen, notitieBijwerken, OpgeslagenToernooi } from "@/lib/opgeslagen-toernooien";
import { googleMapsUrl } from "@/lib/locatie";
import { WazeLink } from "@/components/waze-link";

export function MijnTornooienContent() {
  const { t, taal } = useTranslation();
  const [laden, setLaden] = useState(true);
  const [opgeslagen, setOpgeslagen] = useState<OpgeslagenToernooi[]>([]);
  const [toernooien, setToernooien] = useState<Toernooi[]>([]);

  useEffect(() => {
    const lijst = getOpgeslagenToernooien();
    setOpgeslagen(lijst);
    if (lijst.length === 0) {
      setLaden(false);
      return;
    }
    const supabase = createClient();
    supabase
      .from("toernooien")
      .select("*")
      .in("id", lijst.map((o) => o.id))
      .then(({ data }) => {
        setToernooien((data as Toernooi[]) ?? []);
        setLaden(false);
      });
  }, []);

  function verwijderen(id: string) {
    toernooiVerwijderen(id);
    setOpgeslagen((prev) => prev.filter((o) => o.id !== id));
    setToernooien((prev) => prev.filter((tn) => tn.id !== id));
  }

  function notitieWijzigen(id: string, notitie: string) {
    notitieBijwerken(id, notitie);
    setOpgeslagen((prev) => prev.map((o) => (o.id === id ? { ...o, notitie } : o)));
  }

  const gesorteerd = [...toernooien].sort((a, b) => a.datum.localeCompare(b.datum));

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
      <h1 className="mb-2 font-titel text-4xl tracking-wide text-blauw">{t.lijst.mijnTornooien}</h1>
      <p className="mb-8 text-sm text-grijs">{t.lijst.mijnTornooienUitleg}</p>

      {laden ? null : gesorteerd.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-rand bg-white p-8 text-center text-sm text-grijs">
          <span className="text-4xl">☆</span>
          {t.lijst.geenOpgeslagenToernooien}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {gesorteerd.map((tn) => {
            const notitie = opgeslagen.find((o) => o.id === tn.id)?.notitie ?? "";
            const naam = taal === "fr" ? tn.naam_fr : tn.naam_nl;
            const maandIndex = parseDatum(tn.datum).getMonth();
            return (
              <div key={tn.id} className="rounded-xl border-[1.5px] border-rand bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/toernooien/${tn.id}`} className="min-w-0 flex-1">
                    <p className="text-[0.72rem] font-bold uppercase tracking-wide text-blauw-2">{tn.clubnaam}</p>
                    <p className="font-bold text-donker">{naam}</p>
                    <p className="mt-1 text-sm text-grijs">
                      {dagVanWeekKort(tn.datum, taal)} {dagNummer(tn.datum)} {maandVolledig(maandIndex, taal)} ·{" "}
                      {formatUur(tn.uur)} · {tn.gemeente}, {vertaalProvincie(tn.provincie, taal)}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-grijs">{countdownTekst(tn.datum, taal)}</p>
                  </Link>
                  <button
                    onClick={() => verwijderen(tn.id)}
                    className="shrink-0 text-xs font-semibold text-rood-2 underline"
                  >
                    {t.beheer.verwijderen}
                  </button>
                </div>
                <p className="mt-1 text-sm text-grijs">
                  📍{" "}
                  <a
                    href={googleMapsUrl(tn.adres, tn.gemeente)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-donker"
                  >
                    {tn.adres || tn.gemeente}
                  </a>{" "}
                  <WazeLink adres={tn.adres} gemeente={tn.gemeente} />
                </p>
                <textarea
                  value={notitie}
                  onChange={(e) => notitieWijzigen(tn.id, e.target.value)}
                  placeholder={t.lijst.notitiePlaceholder}
                  rows={2}
                  className="veld-input mt-3 w-full resize-none"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
