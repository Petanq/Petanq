"use client";

import { veiligeUrl } from "@/lib/veilige-url";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/language-context";
import { Toernooi } from "@/lib/types";
import {
  dagVanWeekKort,
  dagNummer,
  maandKort,
  maandVolledig,
  formatUur,
  countdownTekst,
  parseDatum,
} from "@/lib/datum";
import { vertaalProvincie } from "@/lib/provincies";
import { CATEGORIE_STREEP } from "@/lib/stijlen";
import { Knop } from "@/components/ui/knop";
import { volgToernooiActie } from "@/lib/toernooi-acties";
import { googleAgendaLink, downloadIcs } from "@/lib/agenda";
import { ToernooiOpslaanKnop } from "@/components/toernooi-opslaan-knop";
import { googleMapsUrl, wazeUrl } from "@/lib/locatie";
import { siteUrl } from "@/lib/site-url";
import { useAfstandTot } from "@/lib/mijn-plaats";
import { formatKm } from "@/lib/postcodes";
import {
  AgendaBestandIcoon,
  GoogleAgendaIcoon,
  GoogleMapsIcoon,
  LIJN,
  LijnIcoon,
  LinkIcoon,
  MessengerIcoon,
  WazeIcoon,
  WhatsAppIcoon,
} from "@/components/merk-iconen";

// Alle knoppen in de acties-kaart hebben dezelfde stevige, witte vorm met een
// herkenbaar icoon; bij aanwijzen kleurt de rand goud.
const ACTIE_KNOP =
  "flex w-full items-center gap-3 rounded-xl border-2 border-[#1f1f1f]/15 bg-white px-4 py-3 text-left text-sm font-bold text-[#1f1f1f] transition-all hover:border-geel hover:bg-[#fff6d6] active:scale-[0.98]";
const ACTIE_KNOP_VIERKANT =
  "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-[#1f1f1f]/15 bg-white px-2 py-3 text-center text-[0.8rem] font-bold text-[#1f1f1f] transition-all hover:border-geel hover:bg-[#fff6d6] active:scale-[0.98]";
const ROUTE_KNOP =
  "inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-[#1f1f1f]/15 bg-white px-4 text-sm font-bold text-[#1f1f1f] transition-all hover:border-geel hover:bg-[#fff6d6] active:scale-[0.97]";

export function TournamentDetail({
  toernooi,
  liveMatch13Id,
}: {
  toernooi: Toernooi;
  liveMatch13Id?: string | null;
}) {
  const { t, taal } = useTranslation();
  const router = useRouter();
  const [gekopieerd, setGekopieerd] = useState(false);
  const km = useAfstandTot(toernooi);

  // Terug naar de vorige pagina (bv. de lijst, op de scrollpositie/filters
  // van daarvoor) i.p.v. altijd een verse homepage — enkel als er browser-
  // geschiedenis is (bv. bij een rechtstreekse link van buitenaf niet).
  function terugGaan(e: React.MouseEvent) {
    if (typeof window !== "undefined" && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  }
  const naam = taal === "fr" ? toernooi.naam_fr : toernooi.naam_nl;
  const maandIndex = parseDatum(toernooi.datum).getMonth();
  const deelUrl = `${siteUrl()}/toernooien/${toernooi.id}`;
  const heeftSchiftingen = !!toernooi.kwalificatiedata && toernooi.kwalificatiedata.length > 0;

  // In-app browsers zoals die van Facebook/Instagram blokkeren vaak zowel de
  // moderne Clipboard API als window.prompt. document.execCommand("copy") op
  // een verborgen tekstveld werkt daar doorgaans wel nog.
  function kopieerViaVerborgenVeld(): boolean {
    const veld = document.createElement("textarea");
    veld.value = deelUrl;
    veld.style.position = "fixed";
    veld.style.opacity = "0";
    document.body.appendChild(veld);
    veld.focus();
    veld.select();
    let gelukt = false;
    try {
      gelukt = document.execCommand("copy");
    } catch {
      gelukt = false;
    }
    document.body.removeChild(veld);
    return gelukt;
  }

  // Opent rechtstreeks Messenger (mobiele app) om de link door te sturen,
  // in plaats van naar de Facebook-pagina te gaan. Als de Messenger-app niet
  // opent (bv. op desktop, of niet geïnstalleerd), valt dit terug op de
  // gewone Facebook-deelvenster na een korte timeout.
  function deelViaMessenger() {
    volgToernooiActie(toernooi.id, "delen_messenger");
    const messengerLink = `fb-messenger://share/?link=${encodeURIComponent(deelUrl)}`;
    const fallbackLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(deelUrl)}`;
    // Een window.open() in de setTimeout zou als pop-up geblokkeerd worden
    // omdat die niet meer synchroon bij de klik gebeurt — de huidige pagina
    // laten navigeren via location.href valt daar niet onder.
    const timer = setTimeout(() => {
      if (!document.hidden) {
        window.location.href = fallbackLink;
      }
    }, 900);
    window.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) clearTimeout(timer);
      },
      { once: true }
    );
    window.location.href = messengerLink;
  }

  async function linkKopieren() {
    volgToernooiActie(toernooi.id, "delen_link");
    try {
      await navigator.clipboard.writeText(deelUrl);
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2000);
      return;
    } catch {
      // valt hieronder terug op de oudere methode
    }
    if (kopieerViaVerborgenVeld()) {
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2000);
    } else {
      window.prompt(t.lijst.linkKopieren, deelUrl);
    }
  }

  return (
    <div className="mx-auto max-w-[1140px] px-6 pb-16 pt-8 lg:px-10">
      <Link
        href="/"
        onClick={terugGaan}
        className="mb-4 hidden items-center gap-2 rounded-full border border-geel/50 bg-[#121212]/80 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition-colors hover:border-geel md:inline-flex"
      >
        <LijnIcoon pad={LIJN.pijlTerug} className="h-4 w-4" />
        {t.lijst.terugNaarLijst}
      </Link>

      {/* Kop in dezelfde stijl als de tegels op de startpagina */}
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-4 rounded-2xl border-[1.5px] border-geel/60 bg-[#121212]/80 p-5 shadow-[0_0_22px_rgba(244,196,48,0.14)] backdrop-blur-md sm:p-6 md:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div className="flex h-[78px] w-[66px] shrink-0 flex-col items-center justify-center rounded-xl bg-[#f8d55a] text-center text-[#1f1f1f] sm:h-[94px] sm:w-[84px]">
          <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] sm:text-[0.7rem]">
            {dagVanWeekKort(toernooi.datum, taal)}
          </span>
          <span className="font-titel text-[1.9rem] font-extrabold leading-none sm:text-4xl">
            {dagNummer(toernooi.datum)}
          </span>
          <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] sm:text-[0.7rem]">
            {maandKort(toernooi.datum, taal)}
          </span>
        </div>

        <div className="min-w-0">
          <div className="mb-2.5 flex flex-wrap gap-2">
            {toernooi.geannuleerd && (
              <span className="rounded-full bg-rood px-2.5 py-1 text-[0.62rem] sm:px-3 sm:text-[0.7rem] font-extrabold uppercase tracking-wide text-white">
                {t.lijst.geannuleerdBadge}
              </span>
            )}
            {toernooi.vol && (
              <span className="rounded-full bg-rood px-2.5 py-1 text-[0.62rem] sm:px-3 sm:text-[0.7rem] font-extrabold uppercase tracking-wide text-white">
                {t.lijst.volBadge}
              </span>
            )}
            {toernooi.open_toernooi && (
              <span className="rounded-full bg-[#0f766e] px-2.5 py-1 text-[0.62rem] sm:px-3 sm:text-[0.7rem] font-extrabold uppercase tracking-wide text-white">
                {t.lijst.openBadge}
              </span>
            )}
            <span className="rounded-full bg-[#f8d55a] px-2.5 py-1 text-[0.62rem] sm:px-3 sm:text-[0.7rem] font-extrabold uppercase tracking-wide text-[#1f1f1f]">
              {t.formule[toernooi.formule]}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[0.62rem] sm:px-3 sm:text-[0.7rem] font-extrabold uppercase tracking-wide text-white ${CATEGORIE_STREEP[toernooi.categorie]}`}
            >
              {t.categorie[toernooi.categorie]}
            </span>
          </div>
          <h1 className="hyphens-auto break-words font-titel text-[1.5rem] font-extrabold leading-tight tracking-tight text-white min-[400px]:text-[1.8rem] sm:text-4xl">
            {naam}
          </h1>
          <p className="mt-1.5 text-[0.82rem] font-extrabold uppercase tracking-[0.12em] text-geel">
            {toernooi.clubnaam}
          </p>
        </div>

        <div className="col-span-full flex flex-wrap items-center justify-between gap-3 border-t border-geel/30 pt-4 md:col-span-1 md:flex-col md:items-end md:justify-center md:border-0 md:pt-0">
          <span className="rounded-full bg-[#f8d55a] px-4 py-1.5 text-sm font-extrabold text-[#1f1f1f]">
            {countdownTekst(toernooi.datum, taal)}
          </span>
          {km !== null && (
            <span
              title={t.lijst.afstandTitel2}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-geel/50 bg-black/50 px-3.5 py-1.5 text-sm font-bold text-geel"
            >
              <LijnIcoon pad={LIJN.pin} className="h-4 w-4" />
              {formatKm(km)}
            </span>
          )}
          {liveMatch13Id && (
            <Link
              href={`/live/match13/${liveMatch13Id}`}
              className="inline-flex items-center gap-2 rounded-full bg-rood px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_2px_10px_rgba(214,40,40,0.4)] transition-transform hover:scale-105 hover:bg-rood-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              {t.match13.liveVolgKnop}
            </Link>
          )}
        </div>
      </header>

      {/* Inhoud links, acties rechts. Op gsm komt de opslaan-knop meteen onder de kop. */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="contents lg:grid lg:gap-5">
          <Kaart titel={t.lijst.praktischTitel} className="order-2 lg:order-none">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 min-[480px]:grid-cols-2">
              <Feit icoon={LIJN.kalender} label={t.form.datum}>
                {dagVanWeekKort(toernooi.datum, taal)} {dagNummer(toernooi.datum)} {maandVolledig(maandIndex, taal)}
              </Feit>
              <Feit icoon={LIJN.klok} label={t.form.uur}>
                {formatUur(toernooi.uur)}
              </Feit>
              {toernooi.speelvorm === "rondes" && toernooi.aantal_ronden && (
                <Feit icoon={LIJN.ronden} label={t.form.aantalRonden}>
                  {toernooi.aantal_ronden} {t.lijst.ronden}
                  {toernooi.finale && ` ${t.lijst.metFinale}`}
                </Feit>
              )}
              {toernooi.speelvorm === "poules" && toernooi.aantal_poules && (
                <Feit icoon={LIJN.ronden} label={t.form.aantalPoules}>
                  {toernooi.aantal_poules} {t.lijst.poules}
                </Feit>
              )}
              <Feit icoon={LIJN.euro} label={t.filters.inschrijving}>
                {toernooi.gratis
                  ? t.filters.gratis
                  : toernooi.inschrijvingsprijs
                  ? `€ ${toernooi.inschrijvingsprijs.toFixed(2)}`
                  : t.filters.betalend}
              </Feit>
              {toernooi.max_ploegen && (
                <Feit icoon={LIJN.groep} label={t.form.maxPloegen}>
                  {toernooi.max_ploegen}
                </Feit>
              )}
              {km !== null && (
                <Feit icoon={LIJN.pin} label={t.lijst.afstandVanJou}>
                  {formatKm(km)}
                </Feit>
              )}
            </dl>

            <div className="mt-6 flex flex-col gap-4 border-t border-rand pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8d55a] text-[#1f1f1f]">
                  <LijnIcoon pad={LIJN.pin} />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-bold leading-snug text-[#1f1f1f]">
                    {toernooi.adres ?? toernooi.gemeente}
                  </p>
                  <p className="text-sm text-[#6b6a63]">
                    {toernooi.adres ? `${toernooi.gemeente}, ` : ""}
                    {vertaalProvincie(toernooi.provincie, taal)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={googleMapsUrl(toernooi.adres, toernooi.gemeente)}
                  onClick={() => volgToernooiActie(toernooi.id, "route_google")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ROUTE_KNOP}
                >
                  <GoogleMapsIcoon className="h-5 w-5" />
                  Google Maps
                </a>
                <a
                  href={wazeUrl(toernooi.adres, toernooi.gemeente)}
                  onClick={() => volgToernooiActie(toernooi.id, "route_waze")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ROUTE_KNOP}
                >
                  <WazeIcoon className="h-5 w-5" />
                  Waze
                </a>
              </div>
            </div>
          </Kaart>

          {heeftSchiftingen && (
            <div className="order-3 rounded-2xl border-2 border-geel bg-[#fdf3d9] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.18),0_10px_30px_rgba(0,0,0,0.2)] sm:p-6 lg:order-none">
              <p className="text-base font-extrabold text-[#5c4710]">{t.lijst.kwalificatieTitel}</p>
              <p className="mt-0.5 text-sm text-[#5c4710]">{t.lijst.kwalificatieUitleg}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {toernooi.kwalificatiedata!.map((schifting) => (
                  <a
                    key={schifting.datum}
                    href={googleAgendaLink(
                      toernooi,
                      naam,
                      schifting.datum,
                      schifting.uur ?? toernooi.kwalificatie_uur ?? undefined
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t.lijst.kwalificatieDatumToevoegenAanAgenda}
                    className="inline-block min-h-[44px] rounded-full border-2 border-geel bg-white px-4 py-[0.55rem] text-sm font-bold text-[#1f1f1f] transition-colors hover:bg-[#f8d55a]"
                  >
                    {dagVanWeekKort(schifting.datum, taal)} {dagNummer(schifting.datum)}{" "}
                    {maandVolledig(parseDatum(schifting.datum).getMonth(), taal)}
                    {(schifting.uur ?? toernooi.kwalificatie_uur) && (
                      <span className="font-medium text-[#6b6a63]">
                        {" "}
                        · {formatUur((schifting.uur ?? toernooi.kwalificatie_uur) as string)}
                      </span>
                    )}
                    {schifting.opmerking && (
                      <span className="block text-xs font-medium text-[#6b6a63]">{schifting.opmerking}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {toernooi.opmerking && (
            <Kaart titel={t.lijst.overTitel} className="order-4 lg:order-none">
              <p className="max-w-[62ch] text-base leading-relaxed text-[#3d3c38]">{toernooi.opmerking}</p>
            </Kaart>
          )}

          {toernooi.affiche_url && (
            <Kaart titel={t.lijst.afficheTitel} className="order-5 lg:order-none">
              <a
                href={veiligeUrl(toernooi.affiche_url)}
                onClick={() => volgToernooiActie(toernooi.id, "affiche")}
                target="_blank"
                rel="noopener noreferrer"
                title={t.lijst.openAfficheGroot}
                className="mx-auto block w-fit max-w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={toernooi.affiche_url}
                  alt={naam}
                  className="max-h-[640px] w-auto max-w-full rounded-xl border-2 border-[#1f1f1f]/10 object-contain"
                />
              </a>
            </Kaart>
          )}
        </div>

        <aside className="contents lg:sticky lg:top-20 lg:grid lg:gap-5">
          <div className="order-1 lg:order-none">
            <ToernooiOpslaanKnop toernooiId={toernooi.id} />
          </div>

          <Kaart className="order-6 lg:order-none">
            {toernooi.link_inschrijving && (
              <Groep titel={t.lijst.inschrijvenTitel}>
                <div className="contents" onClickCapture={() => volgToernooiActie(toernooi.id, "inschrijven")}>
                  <Knop href={veiligeUrl(toernooi.link_inschrijving)} variant="rood">
                    {t.hero.toernooiAanmelden}
                  </Knop>
                </div>
              </Groep>
            )}

            <Groep titel={t.lijst.voegToeAanAgenda}>
              <a
                href={googleAgendaLink(toernooi, naam)}
                onClick={() => volgToernooiActie(toernooi.id, "agenda_google")}
                target="_blank"
                rel="noopener noreferrer"
                className={ACTIE_KNOP}
              >
                <GoogleAgendaIcoon className="h-6 w-6 shrink-0" />
                {t.lijst.googleAgenda}
              </a>
              <button
                onClick={() => {
                  volgToernooiActie(toernooi.id, "agenda_ics");
                  downloadIcs(toernooi, naam);
                }}
                className={ACTIE_KNOP}
              >
                <AgendaBestandIcoon className="h-6 w-6 shrink-0" />
                {t.lijst.icsBestand}
              </button>
            </Groep>

            <Groep titel={t.lijst.deelDitToernooi} rij>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${naam} — ${toernooi.clubnaam}\n${deelUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => volgToernooiActie(toernooi.id, "delen_whatsapp")}
                className={ACTIE_KNOP_VIERKANT}
              >
                <WhatsAppIcoon className="h-7 w-7" />
                WhatsApp
              </a>
              <button onClick={deelViaMessenger} className={ACTIE_KNOP_VIERKANT}>
                <MessengerIcoon className="h-7 w-7" />
                Messenger
              </button>
              <button onClick={linkKopieren} className={ACTIE_KNOP_VIERKANT}>
                <LinkIcoon className="h-7 w-7" />
                {gekopieerd ? `✓ ${t.lijst.linkGekopieerd}` : t.lijst.linkKopieren}
              </button>
            </Groep>

            <Groep titel={t.lijst.contactTitel}>
              {toernooi.contact_email && (
                <a href={`mailto:${toernooi.contact_email}`} onClick={() => volgToernooiActie(toernooi.id, "contact_mail")} className={`${ACTIE_KNOP} break-words`}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#1f1f1f]">
                    <LijnIcoon pad={LIJN.mail} />
                  </span>
                  <span>{toernooi.contact_email.replace("@", "@\u200b")}</span>
                </a>
              )}
              <a
                href={`mailto:info@petanque13.be?subject=${encodeURIComponent(
                  `Melding fout bij toernooi: ${naam}`
                )}`}
                className="inline-flex min-h-[44px] items-center text-sm font-bold text-[#3d3c38] underline underline-offset-2 hover:text-black"
              >
                {t.lijst.meldFout}
              </a>
            </Groep>
          </Kaart>
        </aside>
      </div>
    </div>
  );
}

// Een witte kaart met een duidelijke titel (gouden streepje ervoor).
function Kaart({
  titel,
  className = "",
  children,
}: {
  titel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/60 bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.18),0_10px_30px_rgba(0,0,0,0.2)] sm:p-6 ${className}`}
    >
      {titel && (
        <h2 className="mb-5 flex items-center gap-2.5 text-[0.78rem] font-extrabold uppercase tracking-[0.14em] text-[#1f1f1f]">
          <span className="h-4 w-1.5 rounded-full bg-[#f8d55a]" aria-hidden="true" />
          {titel}
        </h2>
      )}
      {children}
    </section>
  );
}

// Een feitje met een gouden icoon: label klein, waarde groot en vet.
function Feit({ icoon, label, children }: { icoon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8d55a] text-[#1f1f1f]">
        <LijnIcoon pad={icoon} />
      </span>
      <div className="min-w-0">
        <dt className="text-[0.68rem] font-extrabold uppercase tracking-widest text-[#6b6a63]">{label}</dt>
        <dd className="mt-0.5 text-base font-bold leading-snug text-[#1f1f1f]">{children}</dd>
      </div>
    </div>
  );
}

// Een groepje knoppen in de acties-kaart, gescheiden door een dunne lijn.
function Groep({ titel, rij, children }: { titel: string; rij?: boolean; children: React.ReactNode }) {
  return (
    <div className="border-t border-rand pt-5 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-5">
      <h3 className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-[#6b6a63]">{titel}</h3>
      <div className={rij ? "grid grid-cols-[repeat(auto-fit,minmax(88px,1fr))] gap-2" : "flex flex-col gap-2"}>{children}</div>
    </div>
  );
}
