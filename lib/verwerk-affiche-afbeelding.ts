const MAX_ZIJDE = 1600;
const KWALITEIT = 0.85;

/**
 * Normaliseert een geüploade affiche-foto in de browser vóór upload:
 * - past de EXIF-rotatie toe op de pixels (GSM-foto's staan anders soms scheef/op hun kant)
 * - schaalt overgrote foto's terug naar een redelijke webmaat
 * Faalt dit (oude browser, geen afbeelding, ...) dan geven we gewoon het originele bestand terug.
 */
export async function verwerkAfficheAfbeelding(bestand: File): Promise<File> {
  if (!bestand.type.startsWith("image/") || bestand.type === "image/svg+xml") {
    return bestand;
  }

  try {
    const bitmap = await createImageBitmap(bestand, { imageOrientation: "from-image" });
    const schaal = Math.min(1, MAX_ZIJDE / Math.max(bitmap.width, bitmap.height));
    const breedte = Math.round(bitmap.width * schaal);
    const hoogte = Math.round(bitmap.height * schaal);

    const canvas = document.createElement("canvas");
    canvas.width = breedte;
    canvas.height = hoogte;
    const ctx = canvas.getContext("2d");
    if (!ctx) return bestand;
    ctx.drawImage(bitmap, 0, 0, breedte, hoogte);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", KWALITEIT)
    );
    if (!blob) return bestand;

    const naam = bestand.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], naam, { type: "image/jpeg" });
  } catch (fout) {
    console.error("Affiche verwerken mislukt, origineel bestand wordt gebruikt:", fout);
    return bestand;
  }
}
