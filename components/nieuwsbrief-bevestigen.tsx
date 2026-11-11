"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { bevestigNieuwsbrief } from "@/actions/nieuwsbrief";
import { Knop } from "@/components/ui/knop";

const teksten = {
  nl: {
    titel: "Nieuwsbrief bevestigen",
    uitleg: "Klik op de knop om je inschrijving op de nieuwsbrief van Petanque13 te bevestigen.",
    knop: "Bevestig mijn inschrijving",
    bezig: "Even geduld…",
    gelukt: "Bedankt! Je inschrijving is bevestigd.",
    ongeldig: "Deze bevestigingslink klopt niet (meer). Schrijf je opnieuw in op de startpagina.",
    fout: "Er ging iets mis. Probeer het later opnieuw.",
    terug: "Naar de kalender",
  },
  fr: {
    titel: "Confirmer la newsletter",
    uitleg: "Cliquez sur le bouton pour confirmer votre inscription à la newsletter de Petanque13.",
    knop: "Confirmer mon inscription",
    bezig: "Un instant…",
    gelukt: "Merci ! Votre inscription est confirmée.",
    ongeldig: "Ce lien de confirmation n'est pas (ou plus) valide. Inscrivez-vous à nouveau sur la page d'accueil.",
    fout: "Une erreur est survenue. Réessayez plus tard.",
    terug: "Vers le calendrier",
  },
};

// De bevestiging gebeurt pas na een klik (en niet automatisch bij het openen van de link), zodat
// mailprogramma's die links vooraf "bekijken" een inschrijving niet per ongeluk bevestigen.
export function NieuwsbriefBevestigen({ token }: { token: string }) {
  const { taal } = useTranslation();
  const c = teksten[taal];
  const [status, setStatus] = useState<"wacht" | "bezig" | "ok" | "ongeldig" | "fout">("wacht");

  async function bevestig() {
    setStatus("bezig");
    const r = await bevestigNieuwsbrief(token);
    setStatus(r.succes ? "ok" : r.fout === "ongeldige_link" ? "ongeldig" : "fout");
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <h1 className="mb-3 font-titel text-3xl tracking-wide text-blauw">{c.titel}</h1>
      {status === "ok" ? (
        <>
          <p className="mb-6 text-sm text-donker">{c.gelukt}</p>
          <Knop href={taal === "fr" ? "/fr" : "/"} variant="geel">
            {c.terug}
          </Knop>
        </>
      ) : status === "ongeldig" || status === "fout" ? (
        <p role="alert" className="text-sm font-semibold text-rood-2">
          {status === "ongeldig" ? c.ongeldig : c.fout}
        </p>
      ) : (
        <>
          <p className="mb-6 text-sm text-donker">{c.uitleg}</p>
          <button
            type="button"
            onClick={bevestig}
            disabled={status === "bezig"}
            className="min-h-[44px] rounded-lg bg-geel px-6 text-sm font-extrabold text-[#1f1f1f] disabled:opacity-60"
          >
            {status === "bezig" ? c.bezig : c.knop}
          </button>
        </>
      )}
    </div>
  );
}
