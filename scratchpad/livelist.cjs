const fs=require("fs");const env={};
fs.readFileSync("../.env.local","utf8").split(/\r?\n/).forEach(l=>{const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)env[m[1]]=m[2].replace(/^"|"$/g,"")});
const {createClient}=require("@supabase/supabase-js");
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
 const {data,error}=await s.from("match13_toernooien").select("id,naam,club,live_delen,afgewerkt,bijgewerkt_op,format:data->>format").eq("live_delen",true).order("bijgewerkt_op",{ascending:false}).limit(8);
 console.log(error||data);
})();
