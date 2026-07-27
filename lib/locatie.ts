// Bouwt een zoekterm voor Google Maps/Waze op basis van adres + gemeente,
// zonder de gemeente dubbel te zetten als het adres die al bevat.
export function locatieZoekterm(adres: string | null, gemeente: string): string {
  if (!adres) return gemeente;
  const bevatGemeente = adres.toLowerCase().includes(gemeente.toLowerCase());
  return bevatGemeente ? adres : `${adres}, ${gemeente}`;
}

export function googleMapsUrl(adres: string | null, gemeente: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locatieZoekterm(adres, gemeente))}`;
}

export function wazeUrl(adres: string | null, gemeente: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(locatieZoekterm(adres, gemeente))}&navigate=yes`;
}
