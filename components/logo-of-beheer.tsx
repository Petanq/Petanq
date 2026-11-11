"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/language-context";
import { createClient } from "@/lib/supabase/client";
import { telTeKeuren } from "@/actions/club-beheer";

export type BeheerStatus = {
  moderator: boolean;
  admin: boolean;
  match13: boolean;
  inBehandeling: number;
  wachtendeClubs: number;
  verwijderaanvragen: number;
  // Nieuwe clubs die in Match13 zijn ingetikt en nagekeken moeten worden (enkel admin).
  nieuweMatch13Clubs?: number;
  // Voorstellen van clubs en bezoekers die op goedkeuring van de admin wachten (enkel admin).
  clubVoorstellen?: number;
};

// Onder het menu van elke pagina: normaal het logo, maar wie ingelogd is als
// vrijwilliger (moderator), beheerder of pilootclub met Match13 krijgt hier
// in de plaats de beheerkaders — zo kan je vanaf elke pagina meteen
// goedkeuren, clubs beheren, enz. zonder eerst naar /beheer te moeten.
// De controle gebeurt in de browser, zodat de gewone pagina's gecachet en
// snel blijven voor alle andere bezoekers.
export function LogoOfBeheer() {
  const [status, setStatus] = useState<BeheerStatus | null>(null);

  useEffect(() => {
    let actief = true;

    // Enkel lokaal: laat de kaders zien zonder in te loggen (voor het
    // uitproberen van het ontwerp). Doet niets in productie.
    if (process.env.NODE_ENV !== "production") {
      try {
        if (localStorage.getItem("p13-demo-beheer") === "1") {
          setStatus({ moderator: true, admin: true, match13: true, inBehandeling: 3, wachtendeClubs: 1, verwijderaanvragen: 2, clubVoorstellen: 2 });
          return;
        }
      } catch {}
    }

    async function controleer() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const [mod, adm, m13] = await Promise.all([
        supabase.rpc("is_moderator"),
        supabase.rpc("is_admin"),
        supabase.rpc("heeft_match13_toegang"),
      ]);
      const moderator = mod.data === true;
      const admin = adm.data === true;
      const match13 = m13.data === true;
      if (!moderator && !admin && !match13) return;

      let inBehandeling = 0;
      let wachtendeClubs = 0;
      let verwijderaanvragen = 0;
      let nieuweMatch13Clubs = 0;
      let clubVoorstellen = 0;
      if (admin) {
        clubVoorstellen = await telTeKeuren().catch(() => 0);
        const r = await supabase
          .from("match13_nieuwe_clubs")
          .select("id", { count: "exact", head: true })
          .eq("afgehandeld", false);
        nieuweMatch13Clubs = r.error ? 0 : r.count ?? 0;
      }
      if (moderator) {
        const tel = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
        const [a, b, c, d] = await Promise.all([
          tel(supabase.from("toernooien").select("id", { count: "exact", head: true }).eq("status", "in_behandeling")),
          tel(supabase.from("clubs").select("id", { count: "exact", head: true }).eq("actief", false)),
          admin
            ? tel(
                supabase
                  .from("toernooien")
                  .select("id", { count: "exact", head: true })
                  .not("verwijder_aanvraag_op", "is", null)
                  .is("verwijderd_op", null)
              )
            : Promise.resolve(0),
          admin
            ? tel(
                supabase
                  .from("clubs")
                  .select("id", { count: "exact", head: true })
                  .not("verwijder_aanvraag_op", "is", null)
                  .is("verwijderd_op", null)
              )
            : Promise.resolve(0),
        ]);
        inBehandeling = a;
        wachtendeClubs = b;
        verwijderaanvragen = c + d;
      }
      if (actief) setStatus({ moderator, admin, match13, inBehandeling, wachtendeClubs, verwijderaanvragen, nieuweMatch13Clubs, clubVoorstellen });
    }

    controleer();
    return () => {
      actief = false;
    };
  }, []);

  return (
    // Op de gsm staat het logo al in de balk erboven: de witte band tonen we daar enkel nog voor
    // wie ingelogd is (het beheerknopje), zodat bezoekers geen dubbel logo en ~80 px schermruimte kwijt zijn.
    <div className={`relative border-b border-rand bg-white px-6 py-4 text-center ${status ? "" : "max-md:hidden"}`}>
      <Image
        src="/images/logo-volledig.png"
        alt="Petanque13"
        width={213}
        height={48}
        priority
        className="mx-auto"
      />
      {status && <BeheerKnop status={status} />}
    </div>
  );
}

// Ingelogd als vrijwilliger, beheerder of pilootclub: een klein, discreet
// knopje in de logo-balk naar het beheer (de volledige kaders staan daar zelf).
function BeheerKnop({ status }: { status: BeheerStatus }) {
  const { t } = useTranslation();
  const wachtend = status.inBehandeling + status.wachtendeClubs + status.verwijderaanvragen + (status.admin ? (status.nieuweMatch13Clubs ?? 0) + (status.clubVoorstellen ?? 0) : 0);
  const href = status.moderator ? "/beheer" : "/beheer/match13";
  const label = status.moderator ? t.beheer.dashboard : "Match13";
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-geel bg-donker text-geel transition-colors hover:bg-geel hover:text-donker sm:right-6"
    >
      <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
        <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
        <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
        <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
      </svg>
      {wachtend > 0 && status.moderator && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rood px-1 text-[0.62rem] font-bold text-white">
          {wachtend}
        </span>
      )}
    </Link>
  );
}

// De kaders zelf: gebruikt door de navigatie binnen het beheer (`actiefHref`
// is het geopende onderdeel).
export function BeheerKaderRooster({ status, actiefHref }: { status: BeheerStatus; actiefHref?: string }) {
  const { t } = useTranslation();

  type Kader = { href: string; label: ReactNode; icoon: ReactNode; badge?: number };
  const kaders: Kader[] = [];
  if (status.moderator) {
    kaders.push(
      { href: "/beheer", label: t.beheer.inBehandeling, icoon: <IcoonKlok />, badge: status.inBehandeling },
      { href: "/beheer/toernooien", label: t.beheer.alleToernooien, icoon: <IcoonLijst /> },
      { href: "/beheer/schiftingen", label: t.beheer.schiftingen, icoon: <IcoonKalender /> },
      { href: "/beheer/clubs", label: t.beheer.clubsBeheer, icoon: <IcoonClubs />, badge: status.wachtendeClubs },
      { href: "/beheer/moderatoren", label: t.beheer.vrijwilligers, icoon: <IcoonHart /> },
      { href: "/beheer/ideeen", label: t.beheer.ideeen, icoon: <IcoonLamp /> }
    );
    if (status.admin) {
      kaders.push({
        href: "/beheer/verwijderaanvragen",
        label: t.beheer.verwijderaanvragen.replace("aanvragen", "\u00ADaanvragen"),
        icoon: <IcoonPrullenbak />,
        badge: status.verwijderaanvragen,
      });
    }
  }
  if (status.admin) {
    kaders.push({
      href: "/beheer/club-wijzigingen",
      label: t.clubBeheer.keurTegel,
      icoon: <IcoonPotlood />,
      badge: status.clubVoorstellen,
    });
  }
  if (status.admin || status.match13) {
    kaders.push({
      href: "/beheer/match13",
      label: (
        <span>
          Match<span className={actiefHref === "/beheer/match13" ? "" : "text-geel"}>13</span>
        </span>
      ),
      icoon: <IcoonBoules />,
      badge: status.admin ? status.nieuweMatch13Clubs : undefined,
    });
  }

  return (
    <div className={`grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 ${kaders.length >= 9 ? "lg:grid-cols-9" : "lg:grid-cols-8"}`}>
      {kaders.map((k) => {
        const actief = actiefHref === k.href;
        return (
          <Link
            key={k.href}
            href={k.href}
            className={`relative flex min-h-[4.4rem] flex-col justify-between gap-1 rounded-xl border-2 p-2.5 transition-colors sm:p-3 ${
              actief
                ? "border-geel bg-geel shadow-[0_0_18px_rgba(244,196,48,0.35)]"
                : "border-geel/60 bg-white/[0.05] shadow-[0_0_14px_rgba(244,196,48,0.1)] hover:border-geel active:bg-white/[0.1]"
            }`}
          >
            <span className={actief ? "text-[#1f1f1f]" : "text-geel"}>{k.icoon}</span>
            <span
              style={{ hyphens: "auto" }}
              className={`break-words text-[0.7rem] font-semibold leading-tight sm:text-[0.8rem] ${
                actief ? "text-[#1f1f1f]" : "text-white"
              }`}
            >
              {k.label}
            </span>
            {k.badge ? (
              <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rood px-1.5 text-[0.65rem] font-bold text-white">
                {k.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

const SVG = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function IcoonKlok() {
  return (
    <svg {...SVG}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
function IcoonLijst() {
  return (
    <svg {...SVG}>
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}
function IcoonKalender() {
  return (
    <svg {...SVG}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}
function IcoonClubs() {
  return (
    <svg {...SVG}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19.5c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M17.5 14.2c2.4.2 4 1.9 4 4.3" />
    </svg>
  );
}
function IcoonHart() {
  return (
    <svg {...SVG}>
      <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z" />
    </svg>
  );
}
function IcoonLamp() {
  return (
    <svg {...SVG}>
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />
    </svg>
  );
}
function IcoonPotlood() {
  return (
    <svg {...SVG}>
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}
function IcoonPrullenbak() {
  return (
    <svg {...SVG}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );
}
function IcoonBoules() {
  return (
    <svg {...SVG}>
      <circle cx="12" cy="7.5" r="3.8" />
      <circle cx="7.5" cy="16" r="3.8" />
      <circle cx="16.5" cy="16" r="3.8" />
    </svg>
  );
}
