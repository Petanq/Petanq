const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const env = {};
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2]; });
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const g = await s.from("match13_gebruikers").select("id,naam").eq("club","");
  for (const x of g.data) {
    const r = await s.from("match13_gebruikers").update({ club: `${x.naam.trim()} (test)` }).eq("id", x.id).eq("club","").select("naam,club");
    console.log(r.error?.message ?? JSON.stringify(r.data));
  }
})();
