const fs=require("fs");
const lotto="data:image/png;base64,"+fs.readFileSync("lotto-logo-wit.png").toString("base64");
const icon="data:image/png;base64,"+fs.readFileSync("../public/images/logo-icon.png").toString("base64");
const shirt=(front)=>`
<svg viewBox="0 0 320 340" width="300" xmlns="http://www.w3.org/2000/svg">
  <defs><filter id="s" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity=".25"/></filter></defs>
  <g filter="url(#s)">
    <path d="M100 24 L62 36 L10 92 L48 128 L76 104 L76 316 L244 316 L244 104 L272 128 L310 92 L258 36 L220 24 Q160 ${front?64:46} 100 24 Z" fill="#1f1f1f"/>
    <path d="M10 92 L48 128 L60 118 L22 80 Z" fill="#F4C430"/>
    <path d="M310 92 L272 128 L260 118 L298 80 Z" fill="#F4C430"/>
    <path d="M76 304 L244 304 L244 316 L76 316 Z" fill="#F4C430"/>
  </g>
  ${front?`
  <path d="M100 24 Q160 64 220 24 L206 20 Q160 52 114 20 Z" fill="#F4C430"/>
  <line x1="160" y1="46" x2="160" y2="104" stroke="#F4C430" stroke-width="3"/>
  <circle cx="160" cy="62" r="3" fill="#F4C430"/><circle cx="160" cy="84" r="3" fill="#F4C430"/>
  <image href="${lotto}" x="176" y="92" width="52" height="9"/>
  <image href="${icon}" x="94" y="86" width="30" height="30"/>
  <image href="${lotto}" x="22" y="98" width="30" height="5" transform="rotate(-42 22 98)"/>
  `:`
  <path d="M100 24 Q160 46 220 24 L206 20 Q160 34 114 20 Z" fill="#F4C430"/>
  <image href="${icon}" x="132" y="70" width="56" height="56"/>
  <text x="160" y="150" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-weight="800" font-size="15" fill="#F4C430" letter-spacing="1">Petanque13.be</text>
  <image href="${lotto}" x="120" y="164" width="80" height="14"/>
  `}
</svg>`;
const html=`<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;padding:26px 30px 26px;width:900px;background:#fff;font-family:Montserrat,Arial,sans-serif;color:#1f1f1f}
.kop{font-weight:800;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#3d3d3d;margin:0 0 6px}.kop b{color:#D62828}
.rij{display:flex;gap:40px;justify-content:center;align-items:flex-start}
.c{text-align:center;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#777}
.clubnote{margin-top:6px;font-size:13px;color:#3d3d3d;text-align:center}
</style></head><body>
<p class="kop">Voorbeeld: <b>Lotto</b> x Petanque13 polo</p>
<div class="rij"><div>${shirt(true)}<div class="c">Voorkant</div></div><div>${shirt(false)}<div class="c">Achterkant</div></div></div>
<div class="clubnote">Clubversie: de naam van de club of het tornooi achterop in plaats van "Petanque13.be"</div>
</body></html>`;
fs.writeFileSync("_kleding.html",html);
