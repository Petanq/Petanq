import { Provincie } from "@/lib/provincies";

export type GeocodeResultaat = {
  lat: number;
  lng: number;
  provincie: Provincie | null;
};

// OpenStreetMap/Nominatim tagt elk Belgisch adres met een officiële
// ISO3166-2-provinciecode — betrouwbaarder dan zelf tekst als "Oost-
// Vlaanderen" proberen matchen. Brussel is geen provincie en krijgt enkel
// een gewest-code (ISO3166-2-lvl4 "BE-BRU"), geen lvl6-code.
const ISO_NAAR_PROVINCIE: Record<string, Provincie> = {
  "BE-VAN": "antwerpen",
  "BE-VOV": "oost-vlaanderen",
  "BE-VWV": "west-vlaanderen",
  "BE-VLI": "limburg",
  "BE-VBR": "vlaams-brabant",
  "BE-WHT": "henegouwen",
  "BE-WLG": "luik",
  "BE-WNA": "namen",
  "BE-WBR": "waals-brabant",
  "BE-WLX": "luxemburg",
};

type NominatimAdres = {
  "ISO3166-2-lvl6"?: string;
  "ISO3166-2-lvl4"?: string;
};

type NominatimResultaat = {
  lat: string;
  lon: string;
  address?: NominatimAdres;
};

// Best-effort: geocoding mag een inzending nooit laten mislukken. Bij twijfel
// of een fout geven we gewoon null terug en blijft lat/lng leeg — dat kan
// later via de backfill of een herziening alsnog aangevuld worden.
export async function geocodeAdres(
  adres: string | null,
  gemeente: string,
  provincie?: string
): Promise<GeocodeResultaat | null> {
  const gemeenteNaam = gemeente.trim();
  if (!gemeenteNaam) return null;

  const zoekterm = [adres, gemeenteNaam, provincie, "België"].filter(Boolean).join(", ");

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&countrycodes=be&q=${encodeURIComponent(
      zoekterm
    )}`;
    const res = await fetch(url, {
      headers: {
        // Nominatim's gebruiksvoorwaarden vragen een herkenbare User-Agent.
        "User-Agent": "Petanque13/1.0 (https://petanque13.be; contact: frederic@nitra.be)",
      },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as NominatimResultaat[];
    const eerste = data[0];
    if (!eerste) return null;

    const lat = parseFloat(eerste.lat);
    const lng = parseFloat(eerste.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

    const isoLvl6 = eerste.address?.["ISO3166-2-lvl6"];
    const isoLvl4 = eerste.address?.["ISO3166-2-lvl4"];
    const gevondenProvincie = isoLvl6
      ? ISO_NAAR_PROVINCIE[isoLvl6] ?? null
      : isoLvl4 === "BE-BRU"
        ? "brussel"
        : null;

    return { lat, lng, provincie: gevondenProvincie };
  } catch (fout) {
    console.error("Geocoding mislukt:", fout);
    return null;
  }
}
