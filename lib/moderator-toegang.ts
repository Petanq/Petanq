import { Provincie, PROVINCIE_TOEGANGSREGIO } from "@/lib/provincies";

// Dezelfde regionale toegangsregel als in het beheerpaneel (wie mag welke
// tornooien zien/goedkeuren): eigen provincie, eigen regio (Vlaanderen, of
// Wallonië incl. Brussel), of heel België. Ook gebruikt om te bepalen wie een
// meldingsmail krijgt bij een nieuwe indiening, zodat een vrijwilliger geen
// mails meer krijgt over tornooien/clubs buiten zijn eigen regio.
export function heeftToegangTotProvincie(
  toegangsniveau: "eigen_provincie" | "eigen_regio" | "heel_belgie",
  eigenProvincie: Provincie | null,
  doelProvincie: Provincie
): boolean {
  if (toegangsniveau === "heel_belgie") return true;
  if (!eigenProvincie) return false;
  if (toegangsniveau === "eigen_regio") {
    return PROVINCIE_TOEGANGSREGIO[doelProvincie] === PROVINCIE_TOEGANGSREGIO[eigenProvincie];
  }
  return eigenProvincie === doelProvincie;
}
