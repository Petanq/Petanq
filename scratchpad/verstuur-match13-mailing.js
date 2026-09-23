const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");

const env = {};
fs.readFileSync("../.env.local", "utf8").split(/\r?\n/).forEach((line) => {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(env.RESEND_API_KEY);

const NL_PROVINCIES = ["antwerpen", "oost-vlaanderen", "west-vlaanderen", "limburg", "vlaams-brabant"];
const FR_PROVINCIES = ["henegouwen", "luik", "namen", "waals-brabant", "luxemburg", "brussel"];

function bouwHtml(bestand, logoUrl, heroUrl) {
  let html = fs.readFileSync(bestand, "utf8");
  html = html.replace("__LOGO__", logoUrl);
  html = html.replace("__HERO__", heroUrl);
  return html;
}

async function verstuurInBatches(items, label) {
  const CHUNK = 90;
  let verzonden = 0;
  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK);
    const { data, error } = await resend.batch.send(chunk);
    if (error) {
      console.error(`${label} batch ${i}-${i + chunk.length} FOUT:`, error.message);
    } else {
      verzonden += chunk.length;
      console.log(`${label}: batch van ${chunk.length} verstuurd (${verzonden}/${items.length})`);
    }
  }
  return verzonden;
}

async function main() {
  const { data: clubs, error } = await supabase
    .from("clubs")
    .select("id, naam, contact_email, provincie")
    .is("verwijderd_op", null)
    .eq("actief", true);
  if (error) throw error;

  const metEmail = clubs.filter((c) => c.contact_email && c.contact_email.includes("@"));
  const nlClubs = metEmail.filter((c) => NL_PROVINCIES.includes(c.provincie));
  const frClubs = metEmail.filter((c) => FR_PROVINCIES.includes(c.provincie));
  const onbekend = metEmail.filter((c) => !NL_PROVINCIES.includes(c.provincie) && !FR_PROVINCIES.includes(c.provincie));

  console.log(`NL clubs: ${nlClubs.length} | FR clubs: ${frClubs.length} | onbekende provincie: ${onbekend.length}`);
  if (onbekend.length) console.log("Onbekend:", onbekend.map((c) => `${c.naam} (${c.provincie})`).join(", "));

  const nlHtml = bouwHtml("match13-mailing-nl-clean.html", "https://petanque13.be/images/logo-icon.png", "https://petanque13.be/images/match13-achtergrond.png");
  const frHtml = bouwHtml("match13-mailing-fr-clean.html", "https://petanque13.be/images/logo-icon.png", "https://petanque13.be/images/match13-achtergrond.png");

  const nlItems = nlClubs.map((c) => ({
    from: env.RESEND_AFZENDER,
    to: c.contact_email,
    subject: "Match13 nu ook voor jullie club — gratis",
    html: nlHtml,
  }));
  const frItems = frClubs.map((c) => ({
    from: env.RESEND_AFZENDER,
    to: c.contact_email,
    subject: "Match13 pour votre club aussi — gratuit",
    html: frHtml,
  }));

  const nlVerzonden = await verstuurInBatches(nlItems, "NL");
  const frVerzonden = await verstuurInBatches(frItems, "FR");

  console.log(`\nTOTAAL verstuurd: ${nlVerzonden + frVerzonden} (NL: ${nlVerzonden}, FR: ${frVerzonden})`);
}

main().catch((e) => { console.error("Fataal:", e); process.exit(1); });
