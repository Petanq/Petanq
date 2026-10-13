const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const env = {};
fs.readFileSync("../.env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2]; });
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const m13 = await s.from("match13_aanvragen").select("*").limit(100);
  console.log("MATCH13", m13.error?.message ?? JSON.stringify(m13.data.filter(a => JSON.stringify(a).toLowerCase().includes("yves")||JSON.stringify(a).toLowerCase().includes("rosa"))));
  console.log("cols", m13.data?.[0] && Object.keys(m13.data[0]));
  const toeg = await s.from("match13_toegang").select("*").limit(5);
  console.log("TOEGANG", toeg.error?.message ?? Object.keys(toeg.data[0]||{}));
  const t = await s.from("toernooien").select("*").gte("datum","2026-10-09").lte("datum","2026-11-30").or("goedgekeurd_door.ilike.%yves%,ingediend_door.ilike.%yves%").order("datum").limit(60);
  console.log("TOERNOOIEN", t.error?.message ?? JSON.stringify(t.data.map(x=>({id:x.id.slice(0,8),d:x.datum,n:x.naam_nl,club:x.clubnaam,gem:x.gemeente,prov:x.provincie,st:x.status,gk:x.goedgekeurd_door,go:x.goedgekeurd_op,vw:x.verwijderd_op,open:x.open_toernooi,cat:x.categorie}))));
  const p25 = await s.from("toernooien").select("id,datum,naam_nl,clubnaam,gemeente,provincie,status,goedgekeurd_door,verwijderd_op").eq("datum","2026-10-25");
  console.log("25 OKT", JSON.stringify(p25.data));
})();
