"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { createClient } from "@/lib/supabase/client";
import { Toernooi } from "@/lib/types";
import { dagVanWeekKort, dagNummer, maandKort, formatUur, countdownTekst, isToekomstig } from "@/lib/datum";
import { vertaalProvincie } from "@/lib/provincies";
import { getOpgeslagenToernooien, toernooiVerwijderen, notitieBijwerken, OpgeslagenToernooi } from "@/lib/opgeslagen-toernooien";
import { googleMapsUrl } from "@/lib/locatie";
import { WazeLink } from "@/components/waze-link";

// Zet een tornooi in de eigen agenda van de gsm: een .ics-bestand met datum,
// uur en plaats. Het einduur kennen we niet, dus we rekenen 4 uur speeltijd.
function icsBestand(tn: Toernooi, naam: string) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const [jaar, maand, dag] = tn.datum.split("-").map(Number);
  const [uur, minuut] = (tn.uur || "13:00").split(":").map(Number);
  const start = new Date(jaar, maand - 1, dag, uur, minuut);
  const einde = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  const stempel = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const veilig = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\r?\n/g, "\\n");
  const regels = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Petanque13//NL",
    "BEGIN:VEVENT",
    `UID:${tn.id}@petanque13.be`,
    `DTSTAMP:${stempel(new Date())}`,
    `DTSTART:${stempel(start)}`,
    `DTEND:${stempel(einde)}`,
    `SUMMARY:${veilig(`${naam} — ${tn.clubnaam}`)}`,
    `LOCATION:${veilig([tn.adres, tn.gemeente].filter(Boolean).join(", "))}`,
    `DESCRIPTION:${veilig(`${window.location.origin}/toernooien/${tn.id}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([regels.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "petanque-tornooi.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function whatsappLink(tn: Toernooi, naam: string, taal: string) {
  const datum = new Date(tn.datum).toLocaleDateString(taal === "fr" ? "fr-BE" : "nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const tekst = `${naam} — ${datum}, ${formatUur(tn.uur)} — ${tn.gemeente}\n${window.location.origin}/toernooien/${tn.id}`;
  return `https://wa.me/?text=${encodeURIComponent(tekst)}`;
}

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
  const binnenkort = gesorteerd.filter((tn) => isToekomstig(tn.datum));
  const voorbij = gesorteerd.filter((tn) => !isToekomstig(tn.datum)).reverse();
  const volgende = binnenkort[0];
  const restBinnenkort = binnenkort.slice(1);

  function kaart(tn: Toernooi, groot: boolean) {
    const notitie = opgeslagen.find((o) => o.id === tn.id)?.notitie ?? "";
    const naam = taal === "fr" ? tn.naam_fr : tn.naam_nl;
    const voorbijTornooi = !isToekomstig(tn.datum);
    return (
      <div
        key={tn.id}
        className={`rounded-2xl border-[1.5px] bg-white p-4 ${
          groot ? "border-geel shadow-[0_6px_24px_rgba(244,196,48,0.25)]" : "border-rand"
        } ${voorbijTornooi ? "opacity-70" : ""}`}
      >
        {groot && (
          <p className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-[#b8860b]">
            {t.lijst.agendaVolgende}
          </p>
        )}
        <Link href={`/toernooien/${tn.id}`} className="flex items-center gap-3">
          <div className={`shrink-0 rounded-xl bg-donker px-0.5 py-2 text-center ${groot ? "w-16" : "w-14"}`}>
            <div className="text-[0.58rem] font-bold uppercase tracking-wide text-white/50">
              {dagVanWeekKort(tn.datum, taal)}
            </div>
            <div className={`font-titel leading-none text-geel ${groot ? "text-3xl" : "text-2xl"}`}>
              {dagNummer(tn.datum)}
            </div>
            <div className="text-[0.58rem] font-bold uppercase tracking-wider text-white/50">
              {maandKort(tn.datum, taal)}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.72rem] font-bold uppercase tracking-wide text-blauw-2">{tn.clubnaam}</p>
            <p className={`font-bold leading-tight text-donker ${groot ? "text-lg" : "text-[0.95rem]"}`}>{naam}</p>
            <p className="mt-0.5 text-[0.78rem] text-grijs">
              🕐 {formatUur(tn.uur)} · 📍 {tn.gemeente}, {vertaalProvincie(tn.provincie, taal)}
            </p>
          </div>
          {!voorbijTornooi && (
            <span className="shrink-0 self-start rounded-full bg-donker px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-geel">
              {countdownTekst(tn.datum, taal)}
            </span>
          )}
        </Link>

        {!voorbijTornooi && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="flex overflow-hidden rounded-lg bg-geel">
              <a
                href={googleMapsUrl(tn.adres, tn.gemeente)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 px-2 py-2.5 text-[0.78rem] font-bold text-[#1f1f1f] active:brightness-95"
              >
                📍 {t.lijst.agendaRoute}
              </a>
              <span className="flex items-center border-l border-black/10 px-2">
                <WazeLink adres={tn.adres} gemeente={tn.gemeente} />
              </span>
            </div>
            <button
              type="button"
              onClick={() => icsBestand(tn, naam)}
              className="rounded-lg border-[1.5px] border-rand px-2 py-2.5 text-[0.78rem] font-bold text-donker active:bg-licht"
            >
              🗓️ {t.lijst.agendaInAgenda}
            </button>
            <a
              href={whatsappLink(tn, naam, taal)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 rounded-lg border-[1.5px] border-rand px-2 py-2.5 text-[0.78rem] font-bold text-donker active:bg-licht"
            >
              💬 {t.lijst.agendaDelen}
            </a>
          </div>
        )}

        <textarea
          value={notitie}
          onChange={(e) => notitieWijzigen(tn.id, e.target.value)}
          placeholder={t.lijst.notitiePlaceholder}
          rows={2}
          className="veld-input mt-3 w-full resize-none"
        />
        <div className="mt-2 text-right">
          <button onClick={() => verwijderen(tn.id)} className="text-xs font-semibold text-rood-2 underline">
            {t.beheer.verwijderen}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b-4 border-geel bg-[#161616] px-6 pb-7 pt-8 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-titel text-[2.4rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
            {t.lijst.agendaTitel1} <span className="text-geel">{t.lijst.agendaTitel2}</span>
          </h1>
          <p className="mt-2 text-[0.95rem] font-semibold text-white/90">
            {laden || gesorteerd.length === 0 ? " " : t.lijst.agendaAantal(gesorteerd.length)}
          </p>
          <p className="mt-1 max-w-xl text-sm text-white/60">{t.lijst.mijnTornooienUitleg}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 lg:px-10">
        {laden ? null : gesorteerd.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-rand bg-white p-8 text-center">
            <span className="text-4xl text-geel">☆</span>
            <p className="max-w-sm text-sm text-grijs">{t.lijst.geenOpgeslagenToernooien}</p>
            <Link
              href="/#kalender"
              className="inline-flex items-center gap-2 rounded-xl bg-geel px-5 py-3 text-sm font-bold text-[#1f1f1f] active:brightness-95"
            >
              {t.lijst.agendaOntdek} <span aria-hidden>→</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {volgende && <div className="flex flex-col gap-4">{kaart(volgende, true)}</div>}

            {restBinnenkort.length > 0 && (
              <section>
                <h2 className="mb-3 font-titel text-xl tracking-wide text-blauw">{t.lijst.agendaBinnenkort}</h2>
                <div className="flex flex-col gap-4">{restBinnenkort.map((tn) => kaart(tn, false))}</div>
              </section>
            )}

            {voorbij.length > 0 && (
              <section>
                <h2 className="mb-3 font-titel text-xl tracking-wide text-grijs">{t.lijst.agendaVoorbij}</h2>
                <div className="flex flex-col gap-4">{voorbij.map((tn) => kaart(tn, false))}</div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
