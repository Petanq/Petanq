const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const env = {};
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2]; });
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY);
const anon = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const ADMIN_ID = "6531204e-8f1f-4e66-89e0-b914cd210c9a";
const KEEP = "b05a01fc-67b7-40e0-887b-2bf7fcd43d57", DUP = "a8381a7f-4a40-4e00-8bba-023e76e85911", APRIL = "bdc87687-ab01-455a-9b9c-e07d9a3ae81f";
const CLUB = { clubnaam: "PC Le Pays Noir Farciennes", club_id: "8d189402-4970-42e3-86cc-1826547672c5" };
(async () => {
  // 1. club gelijkzetten (geen verwijderd_op, dus geen trigger nodig)
  for (const id of [KEEP, APRIL]) {
    const r = await admin.from("toernooien").update(CLUB).eq("id", id).select("id,clubnaam");
    console.log("club", r.error?.message ?? JSON.stringify(r.data));
  }
  // 2. admin-sessie voor soft-delete
  const { data: l, error: le } = await admin.auth.admin.generateLink({ type: "recovery", email: "frederic.nitra@gmail.com" });
  if (le) return console.log("link fout", le.message);
  if (l.user.id !== ADMIN_ID) return console.log("STOP: verkeerde user", l.user.id);
  const { data: v, error: ve } = await anon.auth.verifyOtp({ type: "recovery", token_hash: l.properties.hashed_token });
  if (ve || v.user.id !== ADMIN_ID) { console.log("STOP verify", ve?.message, v?.user?.id); return; }
  const r = await anon.from("toernooien").update({ verwijderd_op: new Date().toISOString() }).eq("id", DUP).is("verwijderd_op", null).select("id,naam_nl,verwijderd_op");
  console.log("delete", r.error?.message ?? JSON.stringify(r.data));
  await anon.auth.signOut();
  const chk = await admin.from("toernooien").select("id,datum,naam_nl,clubnaam,verwijderd_op").eq("datum","2026-10-25").ilike("clubnaam","%farciennes%");
  console.log(JSON.stringify(chk.data));
})();
