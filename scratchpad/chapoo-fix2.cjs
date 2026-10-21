const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const env = {};
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2]; });
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const ids = ["28f708a9-ea7c-4044-b0b1-682c465e325f","50dd7c4a-c339-4079-9cb3-840111bcfba6","6a2fb50f-9c2a-4a32-b860-c19e3fc11f8c"];
  const w = await s.from("toernooien").update({ status: "geweigerd" }).in("id", ids).eq("status","in_behandeling").select("id,datum,status");
  console.log("geweigerd", w.error?.message ?? JSON.stringify(w.data));
  const b = await s.from("toernooien").update({ kwalificatiedata: null }).eq("id","ed3a6599-19e9-4f29-ab96-1f119b233ac9").select("id,datum,kwalificatiedata");
  console.log("B-finale", b.error?.message ?? JSON.stringify(b.data));
  const a = await s.from("toernooien").select("id,datum,status,kwalificatiedata").in("id",["9ecf7840-8ebf-476e-9ba5-11313dcdc212"]);
  console.log("A-finale kd:", a.data[0].kwalificatiedata.length, "data");
})();
