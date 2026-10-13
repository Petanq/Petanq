const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const env = {};
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2]; });
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const g = await s.from("match13_gebruikers").select("id,user_id,naam,club,email,actief,status").limit(100);
  console.log(g.error?.message ?? JSON.stringify(g.data.filter(x => x.user_id==="72ee6f38-f94d-43bd-94f2-1accc3f9344c" || /yves|rosa/i.test(JSON.stringify(x)))));
  console.log("totaal gebruikers", g.data?.length);
  const mods = await s.from("moderatoren").select("naam,email,user_id,rol").limit(100);
})();
