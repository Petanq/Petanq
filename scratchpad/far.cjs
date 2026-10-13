const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const env = {};
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2]; });
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const t = await s.from("toernooien").select("id,datum,uur,naam_nl,clubnaam,gemeente,categorie,formule,inschrijvingsprijs,opmerking,aangemaakt_op,verwijderd_op").or("clubnaam.ilike.%farciennes%,clubnaam.ilike.%fanny%").order("datum");
  console.log(JSON.stringify(t.data,null,0));
})();
