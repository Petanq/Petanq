// Verwijzingen tussen de taalversies (hreflang), zodat Google weet welke pagina bij welke taal hoort.
// canonical = het eigen adres van de pagina; nl/fr = de twee versies; x-default = de standaardversie.
export function talenAlternatief(canonical: string, nl: string, fr: string) {
  return {
    canonical,
    languages: { "nl-BE": nl, "fr-BE": fr, "x-default": nl },
  };
}
