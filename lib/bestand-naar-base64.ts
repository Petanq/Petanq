export async function bestandNaarBase64(bestand: File): Promise<string> {
  const buffer = await bestand.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binair = "";
  for (let i = 0; i < bytes.length; i++) binair += String.fromCharCode(bytes[i]);
  return btoa(binair);
}
