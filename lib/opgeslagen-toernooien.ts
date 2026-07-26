// Persoonlijke lijst van "mijn tornooien" — volledig lokaal in de browser
// bewaard (geen account nodig), zodat elke bezoeker op zijn eigen toestel kan
// bijhouden welke tornooien hij speelt en met wie hij heeft afgesproken.
export type OpgeslagenToernooi = { id: string; notitie: string; opgeslagenOp: string };

const SLEUTEL = "p13_opgeslagen_toernooien";

function alles(): OpgeslagenToernooi[] {
  if (typeof window === "undefined") return [];
  try {
    const ruw = localStorage.getItem(SLEUTEL);
    return ruw ? (JSON.parse(ruw) as OpgeslagenToernooi[]) : [];
  } catch {
    return [];
  }
}

function bewaar(lijst: OpgeslagenToernooi[]) {
  localStorage.setItem(SLEUTEL, JSON.stringify(lijst));
}

export function getOpgeslagenToernooien(): OpgeslagenToernooi[] {
  return alles();
}

export function isOpgeslagen(id: string): boolean {
  return alles().some((t) => t.id === id);
}

export function getNotitie(id: string): string {
  return alles().find((t) => t.id === id)?.notitie ?? "";
}

export function toernooiOpslaan(id: string) {
  const lijst = alles();
  if (lijst.some((t) => t.id === id)) return;
  lijst.push({ id, notitie: "", opgeslagenOp: new Date().toISOString() });
  bewaar(lijst);
}

export function toernooiVerwijderen(id: string) {
  bewaar(alles().filter((t) => t.id !== id));
}

export function notitieBijwerken(id: string, notitie: string) {
  const lijst = alles();
  const item = lijst.find((t) => t.id === id);
  if (!item) return;
  item.notitie = notitie;
  bewaar(lijst);
}
