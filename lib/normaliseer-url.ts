// Veel mensen typen een link zonder "https://" ervoor (bv. "www.site.be" of
// "facebook.com/evenement"), wat zowel de browser als onze eigen validatie
// als ongeldig beschouwt. Dit vult het protocol automatisch aan, zodat
// zo'n link gewoon aanvaard wordt in plaats van een foutmelding te geven.
export function normaliseerUrl(waarde: string): string {
  const getrimd = waarde.trim();
  if (!getrimd || /^https?:\/\//i.test(getrimd)) return getrimd;
  return `https://${getrimd}`;
}
