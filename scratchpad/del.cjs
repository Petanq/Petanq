const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const env = {};
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2]; });
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const c = await s.from("clubs").select("id,naam,gemeente").or("naam.ilike.%farciennes%,naam.ilike.%pays%noir%,gemeente.ilike.%farciennes%,gemeente.ilike.%pironchamps%");
  console.log(JSON.stringify(c.data));
  const t = await s.from("toernooien").select("id,datum,clubnaam,club_id").or("clubnaam.ilike.%farciennes%,clubnaam.ilike.%pays%noir%").order("datum");
  console.log(JSON.stringify(t.data));
})();
