// Eenmalige achtergrond-taak: geocodeert alle bestaande clubs en tornooien
// die nog geen lat/lng hebben. Respecteert de 1 aanvraag/seconde-limiet van
// Nominatim (OpenStreetMap) via een korte wachttijd tussen elke aanvraag.
//
// Uitvoeren met: node scripts/backfill-geocoding.js
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const env = {};
fs.readFileSync(".env.local", "utf8")
  .split(/\r?\n/)
  .forEach((line) => {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  });
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const ISO_NAAR_PROVINCIE = {
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

async function geocodeAdres(adres, gemeente, provincie) {
  const zoekterm = [adres, gemeente, provincie, "België"].filter(Boolean).join(", ");
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&countrycodes=be&q=${encodeURIComponent(
    zoekterm
  )}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Petanque13/1.0 (https://petanque13.be; contact: frederic@nitra.be)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const eerste = data[0];
    if (!eerste) return null;
    const lat = parseFloat(eerste.lat);
    const lng = parseFloat(eerste.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    const isoLvl6 = eerste.address?.["ISO3166-2-lvl6"];
    const isoLvl4 = eerste.address?.["ISO3166-2-lvl4"];
    const gevondenProvincie = isoLvl6 ? ISO_NAAR_PROVINCIE[isoLvl6] ?? null : isoLvl4 === "BE-BRU" ? "brussel" : null;
    return { lat, lng, provincie: gevondenProvincie };
  } catch (fout) {
    console.error("Geocoding mislukt:", fout.message);
    return null;
  }
}

function wacht(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function backfillClubs() {
  const { data: clubs, error } = await supabase.from("clubs").select("id, adres, gemeente, provincie").is("lat", null);
  if (error) {
    console.error("Clubs ophalen mislukt:", error.message);
    return;
  }
  console.log(`Clubs zonder coördinaten: ${clubs.length}`);
  let n = 0;
  for (const club of clubs) {
    const geo = await geocodeAdres(club.adres, club.gemeente, club.provincie);
    if (geo) {
      await supabase
        .from("clubs")
        .update({ lat: geo.lat, lng: geo.lng, geocoded_provincie: geo.provincie })
        .eq("id", club.id);
      n++;
    }
    await wacht(1100);
  }
  console.log(`Clubs geocodeerd: ${n}/${clubs.length}`);
}

async function backfillToernooien() {
  const { data: toernooien, error } = await supabase
    .from("toernooien")
    .select("id, adres, gemeente, provincie")
    .is("lat", null)
    .is("verwijderd_op", null);
  if (error) {
    console.error("Toernooien ophalen mislukt:", error.message);
    return;
  }
  console.log(`Tornooien zonder coördinaten: ${toernooien.length}`);
  let n = 0;
  for (const toernooi of toernooien) {
    const geo = await geocodeAdres(toernooi.adres, toernooi.gemeente, toernooi.provincie);
    if (geo) {
      await supabase
        .from("toernooien")
        .update({ lat: geo.lat, lng: geo.lng, geocoded_provincie: geo.provincie })
        .eq("id", toernooi.id);
      n++;
    }
    await wacht(1100);
  }
  console.log(`Tornooien geocodeerd: ${n}/${toernooien.length}`);
}

(async () => {
  await backfillClubs();
  await backfillToernooien();
  console.log("Klaar.");
})();
