import { Provincie, PROVINCIE_TOEGANGSREGIO, ToegangsRegio } from "@/lib/provincies";

// Het toegangsgebied dat een admin rechtstreeks aan een moderator toekent:
// een specifieke provincie, een hele regio (Vlaanderen, of Wallonië incl.
// Brussel), of heel België — los van waar die moderator zelf woont.
export type ToegangScope = Provincie | ToegangsRegio | "heel_belgie";

// Ook gebruikt om te bepalen wie een meldingsmail krijgt bij een nieuwe
// indiening, zodat een vrijwilliger geen mails meer krijgt over
// tornooien/clubs buiten zijn eigen toegangsgebied.
export function heeftToegangTotProvincie(scope: ToegangScope, doelProvincie: Provincie): boolean {
  if (scope === "heel_belgie") return true;
  if (scope === "vlaanderen" || scope === "wallonie") {
    return PROVINCIE_TOEGANGSREGIO[doelProvincie] === scope;
  }
  return scope === doelProvincie;
}
