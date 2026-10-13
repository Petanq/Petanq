// Drie-weg-samenvoeging van twee gelijktijdige wijzigingen aan hetzelfde toernooi.
//
// Een toernooi wordt als één blok bewaard. Voeren twee toestellen (bv. gsm en
// pc) tegelijk scores in, dan mag het ene niet het andere wissen. Daarom
// vergelijken we drie standen:
//   basis  — de stand waarvan dit toestel is vertrokken (laatst gekend op de server)
//   mijn   — de stand op dit toestel (met nog niet opgeslagen wijzigingen)
//   hunne  — de stand die ondertussen op de server staat (wijzigingen van een ander toestel)
// Per veld geldt: enkel door mij gewijzigd → de mijne, enkel door de ander
// gewijzigd → de hunne, door beide verschillend gewijzigd → de mijne (het
// toestel dat nu opslaat, net zoals vroeger — maar enkel voor dat ene veld,
// niet meer voor het hele toernooi).

type Json = unknown;

function isObject(v: Json): v is Record<string, Json> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Structureel gelijk, ongevoelig voor sleutelvolgorde en voor `undefined`-velden (die verdwijnen in JSON). */
export function gelijk(a: Json, b: Json): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => gelijk(x, b[i]));
  }
  if (isObject(a) && isObject(b)) {
    const sleutels = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of sleutels) {
      if (!gelijk(a[k], b[k])) return false;
    }
    return true;
  }
  return false;
}

function heeftId(v: Json): v is Record<string, Json> & { id: string } {
  return isObject(v) && typeof v.id === "string";
}

function alleMetId(...lijsten: Json[][]): boolean {
  return lijsten.every((l) => l.every(heeftId));
}

function voegObjectenSamen(
  basis: Record<string, Json>,
  mijn: Record<string, Json>,
  hunne: Record<string, Json>
): Record<string, Json> {
  const resultaat: Record<string, Json> = {};
  const sleutels = new Set([...Object.keys(basis), ...Object.keys(mijn), ...Object.keys(hunne)]);
  for (const k of sleutels) {
    const waarde = voegSamen(basis[k], mijn[k], hunne[k]);
    if (waarde !== undefined) resultaat[k] = waarde;
  }
  return resultaat;
}

// Lijsten van dingen met een eigen id (teams, bracket-wedstrijden): per id
// samenvoegen. Een nieuw item van een van beide kanten blijft behouden; een
// item dat de ene kant verwijderde verdwijnt, tenzij de andere kant het net
// aangepast heeft (dan blijft het, zodat niets stilletjes verloren gaat).
function voegLijstMetIdSamen(basis: Json[], mijn: Json[], hunne: Json[]): Json[] {
  const per = (lijst: Json[]) => new Map(lijst.map((x) => [(x as { id: string }).id, x]));
  const basisPerId = per(basis);
  const mijnPerId = per(mijn);
  const hunnePerId = per(hunne);

  // Volgorde van de server aanhouden, eigen nieuwe items erachter.
  const volgorde: string[] = [];
  for (const x of hunne) volgorde.push((x as { id: string }).id);
  for (const x of mijn) {
    const id = (x as { id: string }).id;
    if (!hunnePerId.has(id)) volgorde.push(id);
  }

  const resultaat: Json[] = [];
  for (const id of volgorde) {
    const b = basisPerId.get(id);
    const m = mijnPerId.get(id);
    const h = hunnePerId.get(id);
    if (m !== undefined && h !== undefined) {
      resultaat.push(voegSamen(b, m, h));
    } else if (m !== undefined) {
      // Niet (meer) op de server: nieuw bij mij, of door de ander verwijderd.
      if (b === undefined || !gelijk(b, m)) resultaat.push(m);
    } else if (h !== undefined) {
      // Niet (meer) bij mij: nieuw bij de ander, of door mij verwijderd.
      if (b === undefined || !gelijk(b, h)) resultaat.push(h);
    }
  }
  return resultaat;
}

// Lijsten zonder id (bv. rondes en de wedstrijden in een ronde): positie voor
// positie. Een ronde die beide kanten tegelijk bijmaken (zelfde positie,
// verschillend) kunnen we niet zinvol mengen — dan wint de server, want die
// ronde is al bevestigd en mogelijk al uitgedeeld.
function voegLijstOpPositieSamen(basis: Json[], mijn: Json[], hunne: Json[]): Json[] {
  const lengte = Math.max(basis.length, mijn.length, hunne.length);
  const resultaat: Json[] = [];
  for (let i = 0; i < lengte; i++) {
    const b = basis[i];
    const m = mijn[i];
    const h = hunne[i];
    if (b === undefined && m !== undefined && h !== undefined && !gelijk(m, h)) {
      resultaat.push(h);
      continue;
    }
    const waarde = voegSamen(b, m, h);
    if (waarde !== undefined) resultaat.push(waarde);
  }
  return resultaat;
}

export function voegSamen(basis: Json, mijn: Json, hunne: Json): Json {
  if (gelijk(mijn, hunne)) return mijn;
  if (gelijk(basis, mijn)) return hunne;
  if (gelijk(basis, hunne)) return mijn;

  // Beide kanten wijzigden dit onderdeel, verschillend.
  if (isObject(mijn) && isObject(hunne)) {
    return voegObjectenSamen(isObject(basis) ? basis : {}, mijn, hunne);
  }
  if (Array.isArray(mijn) && Array.isArray(hunne)) {
    const b = Array.isArray(basis) ? basis : [];
    return alleMetId(b, mijn, hunne) ? voegLijstMetIdSamen(b, mijn, hunne) : voegLijstOpPositieSamen(b, mijn, hunne);
  }
  // Los veld (getal, tekst, …) of een type dat niet meer overeenkomt: de mijne.
  return mijn !== undefined ? mijn : hunne;
}
