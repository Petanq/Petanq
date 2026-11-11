import { ImageResponse } from "next/og";
import { getToernooiById } from "@/lib/data";
import { vertaalProvincie } from "@/lib/provincies";
import { vertalingen } from "@/lib/i18n";
import { parseDatum } from "@/lib/datum";

// Voorbeeldfoto die verschijnt als iemand een tornooi deelt (WhatsApp, Messenger, Facebook...).
// Per tornooi een eigen kaart met naam, datum, uur, plaats en club, in de huisstijl (zwart en goud).
export const alt = "Petanquetornooi op Petanque13";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOUD = "#F4C430";
const ZWART = "#1F1F1F";

function lettergrootte(titel: string): number {
  if (titel.length <= 28) return 84;
  if (titel.length <= 48) return 68;
  if (titel.length <= 70) return 54;
  return 44;
}

function inkorten(tekst: string, max: number): string {
  return tekst.length > max ? tekst.slice(0, max - 1).trimEnd() + "…" : tekst;
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const toernooi = await getToernooiById(id);

  const titel = inkorten(toernooi?.naam_nl ?? "Petanquetornooi", 90);
  let datumTekst = "";
  if (toernooi) {
    const d = parseDatum(toernooi.datum);
    const maand = vertalingen.nl.maanden[d.getMonth()].toLowerCase();
    const dagNaam = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"][d.getDay()];
    datumTekst = `${dagNaam} ${d.getDate()} ${maand} ${d.getFullYear()}`;
    if (toernooi.uur) datumTekst += ` · ${toernooi.uur.slice(0, 5)}`;
  }
  const plaats = toernooi
    ? `${toernooi.gemeente} · ${vertaalProvincie(toernooi.provincie, "nl")}`
    : "";
  const club = toernooi ? inkorten(toernooi.clubnaam, 60) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: ZWART,
          color: "white",
          padding: "56px 72px 0 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 44, fontWeight: 800, letterSpacing: 2 }}>
            <span>PETANQUE</span>
            <span style={{ color: GOUD }}>13</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.65)" }}>
            De Belgische petanquekalender
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {toernooi?.geannuleerd && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                marginBottom: 18,
                padding: "6px 18px",
                borderRadius: 8,
                background: "#C0392B",
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              GEANNULEERD
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: lettergrootte(titel),
              fontWeight: 800,
              lineHeight: 1.08,
              color: "white",
            }}
          >
            {titel}
          </div>
          {club && (
            <div style={{ display: "flex", marginTop: 20, fontSize: 36, color: GOUD, fontWeight: 700 }}>
              {club}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", paddingBottom: 40 }}>
          {datumTekst && (
            <div style={{ display: "flex", fontSize: 44, fontWeight: 800 }}>{datumTekst}</div>
          )}
          {plaats && (
            <div style={{ display: "flex", marginTop: 6, fontSize: 34, color: "rgba(255,255,255,0.75)" }}>
              {plaats}
            </div>
          )}
        </div>

        <div style={{ display: "flex", height: 18, background: GOUD, marginLeft: -72, marginRight: -72 }} />
      </div>
    ),
    { ...size }
  );
}
