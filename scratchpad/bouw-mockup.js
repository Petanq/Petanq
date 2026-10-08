// Bouwt de drie voorbeeldafbeeldingen (kaartje + Zaalscherm, website) voor een sponsor-prospect.
// Gebruik: node bouw-mockup.js  (instellingen hieronder)
const fs=require("fs");
const CFG={
  slug:"lotto", naamKop:"Lotto", logoFile:"lotto-logo-wit.png", logoW:150, donker:true,
  bron:"sponsordossier.html", siteShot:"_site-home.png", heroH:976, barH:72,
  kopKaart:"Zo ziet <b>Lotto</b> eruit bij onze tornooien",
  kopZaal:"Op het Zaalscherm in de zaal", dank:"Met dank aan onze partner",
  hoofd:"Hoofdpartner", partners:"Onze partners", uwlogo:"Uw logo",
};
const logo="data:image/png;base64,"+fs.readFileSync(CFG.logoFile).toString("base64");
const h=fs.readFileSync(CFG.bron,"utf8");
const css1=h.slice(h.indexOf("  .mk-echt-wrap {"),h.indexOf("  /* Aanduiding waar"));
const css2=h.slice(h.indexOf("  .zaal-demo {"),h.indexOf("  .stappen {"));
const a=h.indexOf('<div class="mk-echt-wrap match13-scope">');const b=h.indexOf("</article>",a)+10;
const art=h.slice(a,b);
const z1=h.indexOf('<div class="zaal-scherm">');const zaal=h.slice(z1,h.indexOf("zs-sponsor",z1));
const root=h.slice(h.indexOf(":root {"),h.indexOf("}",h.indexOf(":root {"))+1);
const mock=`<!doctype html><html><head><meta charset="utf-8"><style>
${root}
*{box-sizing:border-box}
body{margin:0;padding:26px 30px 30px;background:#fff;font-family:Montserrat,Arial,sans-serif;color:#1f1f1f;width:900px}
.kop{font-weight:800;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#3d3d3d;margin:0 0 16px}
.kop b{color:#D62828}
${css1}
.mk-echt-wrap{padding-top:22px;padding-bottom:6px}
.match13-scope .mk-kaart{width:760px;max-width:100%;box-shadow:0 10px 24px rgba(31,31,31,.22)}
.mk-kaart-tilt{filter:none}
.chip{position:absolute;top:10px;left:205px;z-index:3;background:#1f1f1f;border:2.5px solid var(--gold);border-radius:12px;padding:6px 16px;box-shadow:0 8px 20px rgba(31,31,31,.28)}
.chip img{height:26px;width:auto;display:block}
${css2}
.zaal-scherm{margin-top:6px}
.zs-sponsor{background:#1f1f1f;border:2px solid var(--gold);gap:16px;padding:8px 18px}
.zs-sponsor span.t{color:#fff;font-weight:700;font-size:.95rem}
.zs-sponsor img{height:30px;width:auto;display:block}
.zs-plein{padding:12px 14px 10px}
</style></head><body>
<p class="kop">${CFG.kopKaart}</p>
<div class="mk-echt-wrap match13-scope">
${art.slice(art.indexOf('<div class="mk-kaart-tilt">'))}
<span class="chip"><img src="${logo}" alt=""></span>
</div></div>
<p class="kop" style="margin-top:26px">${CFG.kopZaal}</p>
${zaal}zs-sponsor"><span class="t">${CFG.dank}</span><img src="${logo}" alt=""></div></div>
</body></html>`;
fs.writeFileSync("_mock.html",mock);
const web=`<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;width:1280px;font-family:Montserrat,Arial,sans-serif;background:#f4f4f4}
.seg{width:1280px;background:url(${CFG.siteShot}) no-repeat;position:relative}
.a{height:${CFG.heroH}px;background-position:0 0}.b{height:230px;background-position:0 -${CFG.heroH+CFG.barH+1}px}
.partner{position:absolute;right:110px;top:78px;height:66px;display:flex;align-items:center;gap:14px}
.partner small{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#777}
.partner img{height:26px;width:auto;display:block;background:#1f1f1f;padding:12px 18px;border-radius:10px;box-sizing:content-box}
.bar{height:92px;background:#fff;border-top:4px solid #F4C430;border-bottom:1px solid #e5e5e5;display:flex;align-items:center;gap:22px;padding:0 110px}
.bar .lbl{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#3d3d3d;white-space:nowrap}
.bar .slots{display:flex;gap:16px;flex:1}
.slot{flex:1;height:52px;border:2px dashed #cfc9b8;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#a09a88;letter-spacing:.04em;text-transform:uppercase;background:#faf8f3}
</style></head><body>
<div class="seg a"><div class="partner"><small>${CFG.hoofd}</small><img src="${logo}"></div></div>
<div class="bar"><span class="lbl">${CFG.partners}</span><div class="slots">${`<div class="slot">${CFG.uwlogo}</div>`.repeat(4)}</div></div>
<div class="seg b"></div></body></html>`;
fs.writeFileSync("_web.html",web);
console.log("html klaar");
