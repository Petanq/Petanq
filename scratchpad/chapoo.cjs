const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const env = {};
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2]; });
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const t = await s.from("toernooien").select("*").or("clubnaam.ilike.%chapoo%,naam_nl.ilike.%schifting%,naam_nl.ilike.%chapoo%,naam_fr.ilike.%schifting%").order("datum");
  console.log(t.error?.message ?? JSON.stringify(t.data.map(x=>({id:x.id,datum:x.datum,uur:x.uur,naam_nl:x.naam_nl,naam_fr:x.naam_fr,club:x.clubnaam,gem:x.gemeente,adres:x.adres,prov:x.provincie,cat:x.categorie,formule:x.formule,ronden:x.aantal_ronden,prijs:x.inschrijvingsprijs,opm:x.opmerking,link:x.link_inschrijving,email:x.contact_email,aff:x.affiche_url,kd:x.kwalificatiedata,kuur:x.kwalificatie_uur,fin:x.finale,vw:x.verwijderd_op,st:x.status,ing:x.ingediend_door,gk:x.goedgekeurd_door,club_id:x.club_id,speelvorm:x.speelvorm,open:x.open_toernooi,lat:x.lat,lng:x.lng})),null,1));
  const c = await s.from("clubs").select("id,naam,gemeente,adres").ilike("naam","%chapoo%");
  console.log("CLUBS", JSON.stringify(c.data));
})();
