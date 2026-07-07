export function initialenVan(naam: string): string {
  const woorden = naam
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .split(/\s+/)
    .filter(Boolean);

  if (woorden.length === 0) return "?";
  if (woorden.length === 1) return woorden[0].slice(0, 2).toUpperCase();
  return (woorden[0][0] + woorden[woorden.length - 1][0]).toUpperCase();
}

const AVATAR_KLEUREN = [
  "bg-blauw-2",
  "bg-rood",
  "bg-[#6d28d9]",
  "bg-[#059669]",
  "bg-[#b45309]",
  "bg-[#be185d]",
];

export function avatarKleurVoor(naam: string): string {
  let hash = 0;
  for (let i = 0; i < naam.length; i++) hash = (hash * 31 + naam.charCodeAt(i)) >>> 0;
  return AVATAR_KLEUREN[hash % AVATAR_KLEUREN.length];
}
