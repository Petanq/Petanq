const LIVE = "https://www.petanque13.be";

// Het adres van de site, voor canonical-links, de sitemap en de deelkaarten.
// De echte site draait op www.petanque13.be (zonder www stuurt Vercel door). Staat in de Vercel-instelling
// nog het oude adres zonder www, dan gebruiken we toch het www-adres, zodat Google en de deelkaarten naar
// het juiste adres wijzen. Lokaal (bv. http://localhost:3000) blijft de instelling gewoon gelden.
export const siteUrl = () => {
  const url = (process.env.NEXT_PUBLIC_SITE_URL ?? LIVE).trim().replace(/\/+$/, "");
  return /^https?:\/\/petanque13\.be$/i.test(url) ? LIVE : url;
};
