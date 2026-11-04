"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { appleMapsUrl, googleMapsUrl, wazeUrl } from "@/lib/locatie";
import { GoogleMapsLogo, WazeLogo } from "@/components/club-route-logos";

// Gele routeknop onder een clubkaartje. Een tik toont de keuze van de app: Google Maps, Waze en,
// op een iPhone of iPad, ook Apple Kaarten.
export function ClubRoute({ adres, gemeente }: { adres: string | null; gemeente: string }) {
  const { t } = useTranslation();
  const c = t.clubsPagina;
  const [open, setOpen] = useState(false);
  const [apple, setApple] = useState(false);

  useEffect(() => {
    // iPhone/iPad (ook een iPad die zich als Mac voordoet): daar staat Apple Kaarten standaard op het toestel.
    const ua = navigator.userAgent;
    setApple(/iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1));
  }, []);

  return (
    <div className="cb-route-wrap">
      <button type="button" className="cb-route" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        {c.actieRoute}
      </button>
      {open && (
        <div className="cb-route-paneel" role="group" aria-label={c.routeKies}>
          <p className="cb-route-titel">{c.routeKies}</p>
          <a className="cb-route-keuze" href={googleMapsUrl(adres, gemeente)} target="_blank" rel="noopener noreferrer">
            <GoogleMapsLogo className="cb-route-icoon" />
            {c.routeGoogle}
          </a>
          <a className="cb-route-keuze" href={wazeUrl(adres, gemeente)} target="_blank" rel="noopener noreferrer">
            <WazeLogo className="cb-route-icoon" />
            {c.routeWaze}
          </a>
          {apple && (
            <a className="cb-route-keuze" href={appleMapsUrl(adres, gemeente)} target="_blank" rel="noopener noreferrer">
              {c.routeApple}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
