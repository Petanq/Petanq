// Maakt één nette afbeelding (PNG, 1080 × 1350 = 4:5, ideaal voor Facebook,
// Instagram en WhatsApp) van het klassement of de eindstand, met een podium en
// een grote Petanque13-vermelding onderaan — zodat elke gedeelde foto gratis
// reclame is. Alles wordt in de browser getekend (geen externe dienst).

export interface AfbeeldingPlek {
  plaats: string;
  naam: string;
  sub?: string;
}

export interface AfbeeldingOpties {
  club: string;
  titel: string;
  datum?: string;
  plekken: AfbeeldingPlek[];
  tagline: string;
  logoUrl: string;
  fontFamily: string;
}

const W = 1080;
const H = 1350;
const GOUD = "#f4c430";

function laadAfbeelding(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Breekt tekst af op woordgrenzen (of tekens als een woord te lang is) tot maximaal `maxRegels`.
function breekAf(ctx: CanvasRenderingContext2D, tekst: string, maxBreedte: number, maxRegels: number): string[] {
  const woorden = tekst.split(/\s+/).filter(Boolean);
  const regels: string[] = [];
  let huidig = "";
  for (const woord of woorden) {
    const probeer = huidig ? `${huidig} ${woord}` : woord;
    if (ctx.measureText(probeer).width <= maxBreedte) {
      huidig = probeer;
      continue;
    }
    if (huidig) regels.push(huidig);
    huidig = woord;
    while (ctx.measureText(huidig).width > maxBreedte && huidig.length > 1) {
      let stuk = huidig;
      while (ctx.measureText(stuk + "…").width > maxBreedte && stuk.length > 1) stuk = stuk.slice(0, -1);
      regels.push(stuk + "…");
      huidig = "";
      break;
    }
  }
  if (huidig) regels.push(huidig);
  if (regels.length > maxRegels) {
    const afgekapt = regels.slice(0, maxRegels);
    let laatste = afgekapt[maxRegels - 1];
    while (ctx.measureText(laatste + "…").width > maxBreedte && laatste.length > 1) laatste = laatste.slice(0, -1);
    afgekapt[maxRegels - 1] = laatste + "…";
    return afgekapt;
  }
  return regels;
}

function rondRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export async function maakKlassementAfbeelding(o: AfbeeldingOpties): Promise<Blob> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* lettertypes zijn een extraatje */
    }
  }
  const logo = await laadAfbeelding(o.logoUrl);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas niet beschikbaar");
  const font = (gewicht: number, px: number) => `${gewicht} ${px}px ${o.fontFamily}`;

  // Achtergrond met zachte gouden gloed bovenaan
  ctx.fillStyle = "#151515";
  ctx.fillRect(0, 0, W, H);
  const gloed = ctx.createRadialGradient(W / 2, 80, 40, W / 2, 80, 760);
  gloed.addColorStop(0, "rgba(244,196,48,0.28)");
  gloed.addColorStop(1, "rgba(244,196,48,0)");
  ctx.fillStyle = gloed;
  ctx.fillRect(0, 0, W, H);

  // Kop: logo + Match13 + club
  if (logo) ctx.drawImage(logo, 64, 56, 104, 104);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = font(900, 64);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Match", 192, 108);
  const matchBreedte = ctx.measureText("Match").width;
  ctx.fillStyle = GOUD;
  ctx.fillText("13", 192 + matchBreedte, 108);
  ctx.font = font(600, 34);
  ctx.fillStyle = "#cfcfcf";
  const clubRegels = breekAf(ctx, o.club, W - 192 - 64, 1);
  ctx.fillText(clubRegels[0] ?? "", 192, 156);

  // Titel (Klassement / Eindstand) + datum
  ctx.font = font(800, 34);
  ctx.fillStyle = GOUD;
  ctx.textAlign = "left";
  ctx.fillText(o.titel.toUpperCase(), 64, 250);
  if (o.datum) {
    ctx.textAlign = "right";
    ctx.font = font(600, 30);
    ctx.fillStyle = "#bdbdbd";
    ctx.fillText(o.datum, W - 64, 250);
  }

  // Podium
  const top = o.plekken.slice(0, 3);
  const stapBreedte = 300;
  const tussen = 20;
  const startX = (W - (3 * stapBreedte + 2 * tussen)) / 2;
  const basisY = 905;
  const hoogtes = [300, 220, 160];
  const kleuren: [string, string][] = [
    ["#fbdc66", "#e5ac00"],
    ["#e7eaee", "#aab1bb"],
    ["#eab280", "#b8742f"],
  ];
  const volgorde = [1, 0, 2]; // links 2e, midden 1e, rechts 3e
  volgorde.forEach((idx, kolom) => {
    const plek = top[idx];
    if (!plek) return;
    const x = startX + kolom * (stapBreedte + tussen);
    const hoogte = hoogtes[idx];
    const y = basisY - hoogte;
    const verloop = ctx.createLinearGradient(0, y, 0, basisY);
    verloop.addColorStop(0, kleuren[idx][0]);
    verloop.addColorStop(1, kleuren[idx][1]);
    ctx.fillStyle = verloop;
    rondRect(ctx, x, y, stapBreedte, hoogte, [22, 22, 0, 0]);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillRect(x + 8, y + 3, stapBreedte - 16, 3);

    // groot cijfer op de trap
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(30,30,30,0.8)";
    ctx.font = font(900, idx === 0 ? 150 : 110);
    ctx.fillText(String(idx + 1), x + stapBreedte / 2, y + hoogte / 2 + (idx === 0 ? 52 : 38));

    // naam + sub boven de trap
    const midden = x + stapBreedte / 2;
    let tekstY = y - 22;
    if (plek.sub) {
      ctx.font = font(600, 25);
      ctx.fillStyle = "#b9b9b9";
      ctx.fillText(plek.sub, midden, tekstY);
      tekstY -= 42;
    }
    ctx.font = font(800, idx === 0 ? 44 : 38);
    ctx.fillStyle = "#ffffff";
    const regels = breekAf(ctx, plek.naam, stapBreedte - 10, 2);
    const regelHoogte = idx === 0 ? 50 : 44;
    for (let i = regels.length - 1; i >= 0; i--) {
      ctx.fillText(regels[i], midden, tekstY);
      tekstY -= regelHoogte;
    }
    if (idx === 0) {
      ctx.save();
      ctx.translate(midden - 36, tekstY - 66);
      ctx.scale(3, 3);
      ctx.fillStyle = "#e2a900";
      ctx.strokeStyle = "#b88700";
      ctx.lineWidth = 0.8;
      const kroon = new Path2D("M3 8l4.5 4.2L12 5l4.5 7.2L21 8l-2 11H5z");
      ctx.fill(kroon);
      ctx.stroke(kroon);
      ctx.restore();
    }
  });
  ctx.fillStyle = GOUD;
  ctx.fillRect(startX - 6, basisY, 3 * stapBreedte + 2 * tussen + 12, 8);

  // Plaatsen 4 t.e.m. 8
  const rest = o.plekken.slice(3, 8);
  let rijY = 960;
  for (const plek of rest) {
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    rondRect(ctx, 64, rijY, W - 128, 62, 16);
    ctx.fill();
    ctx.textAlign = "center";
    ctx.font = font(800, 30);
    ctx.fillStyle = GOUD;
    ctx.fillText(plek.plaats, 112, rijY + 42);
    ctx.textAlign = "left";
    ctx.font = font(700, 32);
    ctx.fillStyle = "#ffffff";
    const naamBreedte = plek.sub ? 560 : 800;
    const regel = breekAf(ctx, plek.naam, naamBreedte, 1)[0] ?? "";
    ctx.fillText(regel, 160, rijY + 42);
    if (plek.sub) {
      ctx.textAlign = "right";
      ctx.font = font(600, 26);
      ctx.fillStyle = "#b9b9b9";
      ctx.fillText(plek.sub, W - 92, rijY + 41);
    }
    rijY += 72;
  }

  // Voetband met grote Petanque13-vermelding
  const bandY = H - 150;
  ctx.fillStyle = GOUD;
  ctx.fillRect(0, bandY, W, 150);
  ctx.textAlign = "center";
  ctx.fillStyle = "#1a1a1a";
  ctx.font = font(900, 62);
  ctx.fillText("petanque13.be", W / 2 + 30, bandY + 76);
  if (logo) ctx.drawImage(logo, W / 2 - 292, bandY + 22, 84, 84);
  ctx.font = font(700, 27);
  ctx.fillText(o.tagline, W / 2, bandY + 124);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Afbeelding maken mislukt"))), "image/png");
  });
}
