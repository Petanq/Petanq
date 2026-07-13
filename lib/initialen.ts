const SCHAKERINGEN = [0, 0.14, 0.28, 0.42];

export function schakeringVoor(naam: string): number {
  let hash = 0;
  for (let i = 0; i < naam.length; i++) hash = (hash * 31 + naam.charCodeAt(i)) >>> 0;
  return SCHAKERINGEN[hash % SCHAKERINGEN.length];
}
