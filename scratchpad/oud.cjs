const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const env = {};
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2]; });
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const c = await s.from("clubs").select("*").or("naam.ilike.%oudenaarde%,gemeente.ilike.%oudenaarde%");
  console.log("CLUBS", JSON.stringify(c.data, null, 1));
  const t = await s.from("toernooien").select("id,datum,naam_nl,clubnaam,gemeente,adres,club_id,lat,lng,status,verwijderd_op").or("clubnaam.ilike.%oudenaarde%,gemeente.ilike.%oudenaarde%").is("verwijderd_op",null).order("datum");
  console.log("TOERNOOIEN", t.error?.message ?? JSON.stringify(t.data.map(x=>[x.id.slice(0,8),x.datum,x.naam_nl.slice(0,30),x.clubnaam,x.gemeente,x.adres,x.club_id?.slice(0,8),x.lat,x.lng,x.status])));
})();
