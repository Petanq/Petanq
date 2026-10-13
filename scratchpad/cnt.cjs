const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const env = {};
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2]; });
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const a = await s.from("toernooien").select("id",{count:"exact",head:true}).eq("status","goedgekeurd").is("verwijderd_op",null);
  const b = await s.from("toernooien").select("id",{count:"exact",head:true}).eq("status","goedgekeurd").is("verwijderd_op",null).gte("datum","2026-10-13");
  console.log("goedgekeurd totaal", a.count, "toekomstig", b.count);
  const c = await s.from("toernooien").select("datum").eq("status","goedgekeurd").is("verwijderd_op",null).order("datum").limit(5000);
  console.log("zonder limit-aanvraag rows:", c.data.length, "laatste datum:", c.data[c.data.length-1].datum);
})();
