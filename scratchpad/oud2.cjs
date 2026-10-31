const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const env = {};
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2]; });
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const r = await s.from("clubs").update({ adres: "Galgestraat 75, 9700 Oudenaarde", lat: 50.8536777, lng: 3.6151502 }).eq("id","b965092e-ff84-46a0-964b-9cbcecc786d6").eq("adres","Dries ter Biest 18, 9700 Oudenaarde").select("naam,adres,gemeente,lat,lng,geocoded_provincie");
  console.log(r.error?.message ?? JSON.stringify(r.data));
})();
