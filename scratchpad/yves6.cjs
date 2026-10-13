const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const env = {};
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2]; });
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const r = await s.from("match13_gebruikers").update({ club: "Yves Vdvk (test)" }).eq("id","c1c849e0-54af-4fcd-994b-74ad96586995").eq("club","").select("naam,club,actief,status");
  console.log(r.error?.message ?? JSON.stringify(r.data));
})();
