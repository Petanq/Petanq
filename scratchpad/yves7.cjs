const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const env = {};
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2]; });
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const t = await s.from("toernooien").select("id,datum,naam_nl,clubnaam,gemeente,status,ingediend_door,goedgekeurd_door,goedgekeurd_op,aangemaakt_op,verwijderd_op").gte("aangemaakt_op","2026-10-05").order("aangemaakt_op",{ascending:false}).limit(40);
  console.log(JSON.stringify(t.data.map(x=>[x.aangemaakt_op.slice(5,16),x.datum,x.naam_nl.slice(0,35),x.clubnaam,x.status,x.ingediend_door,x.goedgekeurd_door,x.verwijderd_op?"DEL":""])));
  const y = await s.from("toernooien").select("id,datum,naam_nl,clubnaam,status").gte("datum","2027-01-01").order("datum");
  console.log("2027+:", y.data.length, JSON.stringify(y.data.slice(0,60).map(x=>[x.datum,x.naam_nl.slice(0,30),x.clubnaam,x.status])));
})();
