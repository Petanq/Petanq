"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useTranslation } from "@/lib/language-context";

// QR-code naar de publieke live-pagina, bedoeld voor het Zaalscherm zodat
// wie in de zaal staat het toernooi meteen op de eigen gsm kan volgen. De
// code wordt lokaal in de browser gemaakt — er gaat dus niets naar een externe
// QR-dienst, en het werkt zolang de pagina zelf geladen is.
export function LiveQrKaart({ url }: { url: string }) {
  const { t } = useTranslation();
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let actueel = true;
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M" })
      .then((resultaat) => {
        if (actueel) setSvg(resultaat);
      })
      .catch(() => {
        if (actueel) setSvg(null);
      });
    return () => {
      actueel = false;
    };
  }, [url]);

  if (!svg) return null;

  return (
    <div className="match13-live-qr">
      <div className="match13-live-qr-code" dangerouslySetInnerHTML={{ __html: svg }} aria-hidden="true" />
      <div className="match13-live-qr-tekst">
        <span className="match13-live-qr-badge">
          <span className="match13-live-stip">
            <span className="match13-live-stip-ping" />
            <span className="match13-live-stip-punt" />
          </span>
          {t.match13.liveBadge}
        </span>
        <strong>{t.match13.liveQrTitel}</strong>
        <span>{t.match13.liveQrUitleg}</span>
        <code>{url.replace(/^https?:\/\//, "")}</code>
      </div>
    </div>
  );
}
