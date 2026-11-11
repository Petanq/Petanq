"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { dienBezoekerVoorstelIn } from "@/actions/club-beheer";
import { gelijkeUren, leegUren, type ClubGegevens, type ClubUren } from "@/lib/club-beheer/uren";
import { UrenBewerker } from "@/components/club-beheer/UrenBewerker";
import { useClubUren } from "@/components/club-beheer/ClubBeheerContext";
import "./club-beheer.css";

type ClubInfo = {
  id: string;
  naam: string;
  adres: string | null;
  contact_email: string | null;
  telefoon: string | null;
  website: string | null;
};

function kopieer(uren: ClubUren): ClubUren {
  return JSON.parse(JSON.stringify(uren)) as ClubUren;
}

// Onder elk clubkaartje: iedereen (ook zonder account) kan een aanpassing van de gegevens of openingsuren
// voorstellen. Het voorstel komt nooit rechtstreeks online maar wacht op goedkeuring door de admin.
export function ClubWijzigingKnop({ club }: { club: ClubInfo }) {
  const { t, taal } = useTranslation();
  const c = t.clubBeheer;
  const dialoog = useRef<HTMLDialogElement>(null);
  const huidigeUren = useClubUren(club.id);

  const begin: ClubGegevens = {
    adres: club.adres ?? "",
    contact_email: club.contact_email ?? "",
    telefoon: club.telefoon ?? "",
    website: club.website ?? "",
  };
  const [open, setOpen] = useState(false);
  const [gegevens, setGegevens] = useState<ClubGegevens>(begin);
  const [uren, setUren] = useState<ClubUren>(() => kopieer(huidigeUren ?? leegUren()));
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [vallik, setVallik] = useState("");
  const [start, setStart] = useState(0);
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState<{ soort: "ok" | "fout"; tekst: string } | null>(null);
  const [verstuurd, setVerstuurd] = useState(false);

  function openen() {
    setGegevens(begin);
    setUren(kopieer(huidigeUren ?? leegUren()));
    setMelding(null);
    setVerstuurd(false);
    setStart(Date.now());
    setOpen(true);
    dialoog.current?.showModal();
  }

  function sluiten() {
    dialoog.current?.close();
  }

  async function versturen(e: React.FormEvent) {
    e.preventDefault();
    setMelding(null);

    // Enkel wat veranderd is: zo blokkeert een oud, onvolledig gegeven bij de club het voorstel niet.
    const gewijzigd: Partial<ClubGegevens> = {};
    for (const sleutel of ["adres", "contact_email", "telefoon", "website"] as const) {
      if ((gegevens[sleutel] ?? "") !== (begin[sleutel] ?? "")) gewijzigd[sleutel] = gegevens[sleutel];
    }
    const urenGewijzigd = !gelijkeUren(uren, huidigeUren ?? leegUren());
    if (Object.keys(gewijzigd).length === 0 && !urenGewijzigd) {
      setMelding({ soort: "fout", tekst: c.wijzigGeenWijziging });
      return;
    }

    setBezig(true);
    const resultaat = await dienBezoekerVoorstelIn(club.id, {
      voorstel: {
        ...(Object.keys(gewijzigd).length > 0 ? { gegevens: gewijzigd } : {}),
        ...(urenGewijzigd ? { uren } : {}),
      },
      naam,
      email,
      taal,
      website_bevestig: vallik,
      startMs: start,
    });
    setBezig(false);

    if (!resultaat.succes) {
      setMelding({
        soort: "fout",
        tekst:
          resultaat.fout === "te_veel"
            ? c.wijzigTeVeel
            : resultaat.fout === "nog_niet_beschikbaar"
              ? c.nogNietBeschikbaar
              : c.fout,
      });
      return;
    }
    if (resultaat.status === "geen_wijziging") {
      setMelding({ soort: "fout", tekst: c.wijzigGeenWijziging });
      return;
    }
    setVerstuurd(true);
  }

  const veld = (
    id: string,
    label: string,
    waarde: string,
    onChange: (v: string) => void,
    opties: { type?: string; autoComplete?: string; verplicht?: boolean; inputMode?: "email" | "tel" | "url" | "text" } = {}
  ) => (
    <div className="cb-veld">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={opties.type ?? "text"}
        inputMode={opties.inputMode}
        autoComplete={opties.autoComplete ?? "off"}
        required={opties.verplicht}
        value={waarde}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={openen}
        className="mt-1 inline-flex min-h-[44px] items-center text-[0.76rem] font-bold text-[#555] underline underline-offset-2 hover:text-[#1f1f1f]"
      >
        {c.wijzigKnop}
      </button>

      <dialog
        ref={dialoog}
        onClose={() => setOpen(false)}
        aria-labelledby={`wijzig-titel-${club.id}`}
        className="m-0 h-[100dvh] max-h-none w-full max-w-none overflow-y-auto bg-white p-0 text-[#1f1f1f] backdrop:bg-black/60 sm:m-auto sm:h-auto sm:max-h-[90vh] sm:max-w-[720px] sm:rounded-2xl"
      >
        {open && (
          <div className="cb-scope px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 id={`wijzig-titel-${club.id}`} className="text-lg font-extrabold leading-snug">
                {c.wijzigTitel(club.naam)}
              </h2>
              <button
                type="button"
                onClick={sluiten}
                aria-label={c.wijzigSluiten}
                className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-[#555] hover:bg-black/5"
              >
                ×
              </button>
            </div>

            {verstuurd ? (
              <div className="flex flex-col gap-4">
                {/* Het embleem van Petanque13 op het bedankscherm (hier komt later ook de sponsor onder). */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-volledig.png"
                  alt="Petanque13"
                  width={1526}
                  height={344}
                  className="mx-auto mt-2 h-auto w-[220px] max-w-full"
                />
                <p className="cb-melding ok">{c.wijzigBedankt}</p>
                <button type="button" className="cb-knop" onClick={sluiten}>
                  {c.wijzigSluiten}
                </button>
              </div>
            ) : (
              <form onSubmit={versturen} className="flex flex-col gap-1">
                <p className="cb-uitleg">{c.wijzigUitleg}</p>

                {veld("wz-adres", c.adres, gegevens.adres ?? "", (v) => setGegevens({ ...gegevens, adres: v }), { autoComplete: "street-address" })}
                {veld("wz-mail", c.email, gegevens.contact_email ?? "", (v) => setGegevens({ ...gegevens, contact_email: v }), { type: "email", inputMode: "email" })}
                {veld("wz-tel", c.telefoon, gegevens.telefoon ?? "", (v) => setGegevens({ ...gegevens, telefoon: v }), { type: "tel", inputMode: "tel" })}
                {veld("wz-web", c.website, gegevens.website ?? "", (v) => setGegevens({ ...gegevens, website: v }), { inputMode: "url" })}

                <UrenBewerker uren={uren} onChange={setUren} compact />

                <h3 className="mt-5 text-[0.95rem] font-extrabold">{c.wijzigWieBenJij}</h3>
                {veld("wz-naam", c.wijzigJouwNaam, naam, setNaam, { autoComplete: "name", verplicht: true })}
                {veld("wz-email", c.wijzigJouwEmail, email, setEmail, { type: "email", inputMode: "email", autoComplete: "email", verplicht: true })}
                <p className="cb-uitleg">{c.wijzigPrivacy}</p>

                {/* Verborgen lokveld tegen robots: mensen zien en vullen het niet in. */}
                <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0">
                  <label htmlFor={`wz-vallik-${club.id}`}>Website</label>
                  <input
                    id={`wz-vallik-${club.id}`}
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={vallik}
                    onChange={(e) => setVallik(e.target.value)}
                  />
                </div>

                {melding && <p className={"cb-melding " + melding.soort}>{melding.tekst}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="submit" className="cb-knop" disabled={bezig}>
                    {bezig ? c.wijzigVerzenden : c.wijzigVerstuur}
                  </button>
                  <button type="button" className="cb-knop rand" onClick={sluiten}>
                    {c.wijzigSluiten}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
