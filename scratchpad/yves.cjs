const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const env = {};
fs.readFileSync("../.env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2]; });
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const mod = await s.from("moderatoren").select("*").ilike("naam", "%yves%");
  console.log("MODERATOR", JSON.stringify(mod.data ?? mod.error, null, 1));
  const m13 = await s.from("match13_aanvragen").select("*").order("created_at", { ascending: false }).limit(50);
  console.log("MATCH13 aanvragen", m13.error?.message ?? JSON.stringify((m13.data||[]).map(a => ({n:a.naam??a.club??a.email, e:a.email, st:a.status, c:a.created_at})), null, 0));
  const t = await s.from("toernooien").select("id,datum,naam_nl,naam_fr,clubnaam,gemeente,provincie,status,goedgekeurd_door,goedgekeurd_op,ingediend_door,verwijderd_op,created_at").gte("datum","2026-10-09").lte("datum","2026-11-30").or("goedgekeurd_door.ilike.%yves%,ingediend_door.ilike.%yves%,gemeente.ilike.%charleroi%,gemeente.ilike.%pays%").order("created_at",{ascending:false}).limit(40);
  console.log("TOERNOOIEN", t.error?.message ?? JSON.stringify(t.data, null, 0));
})();
