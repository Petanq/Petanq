const fs=require("fs");const env={};
fs.readFileSync("../.env.local","utf8").split(/\r?\n/).forEach(l=>{const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)env[m[1]]=m[2].replace(/^"|"$/g,"")});
const {createClient}=require("@supabase/supabase-js");
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
 const vandaag=new Date().toISOString().slice(0,10);
 const {data:v}=await s.from("toernooien").select("id,datum,naam_nl").eq("status","goedgekeurd").is("verwijderd_op",null).gte("datum",vandaag).order("datum").limit(3);
 const {data:p}=await s.from("toernooien").select("id,datum,naam_nl").eq("status","goedgekeurd").is("verwijderd_op",null).lt("datum",vandaag).order("datum",{ascending:false}).limit(1);
 console.log(JSON.stringify({toekomst:v,voorbij:p}));
})();
