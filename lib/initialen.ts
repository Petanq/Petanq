const AVATAR_TINTEN = ["#fdf3d9", "#eff6ff", "#f1f5f9", "#fdf1ec", "#f0fdf9", "#f6f0fd"];

export function avatarTintVoor(naam: string): string {
  let hash = 0;
  for (let i = 0; i < naam.length; i++) hash = (hash * 31 + naam.charCodeAt(i)) >>> 0;
  return AVATAR_TINTEN[hash % AVATAR_TINTEN.length];
}
