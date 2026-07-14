import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToernooiById } from "@/lib/data";
import { vertaalProvincie } from "@/lib/provincies";
import { TournamentDetail } from "@/components/tournament-detail";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const toernooi = await getToernooiById(params.id);
  if (!toernooi) return { title: "Toernooi niet gevonden" };

  const titel = `${toernooi.naam_nl} — ${toernooi.clubnaam}`;
  const beschrijving = `${toernooi.naam_nl} op ${toernooi.datum} in ${toernooi.gemeente} (${vertaalProvincie(
    toernooi.provincie,
    "nl"
  )}), georganiseerd door ${toernooi.clubnaam}.`;

  return {
    title: titel,
    description: beschrijving,
    openGraph: { title: titel, description: beschrijving, type: "article" },
  };
}

export default async function ToernooiDetailPagina({ params }: Props) {
  const toernooi = await getToernooiById(params.id);
  if (!toernooi) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://petanque13.be";
  const startDatum = `${toernooi.datum}T${toernooi.uur}:00+02:00`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: toernooi.naam_nl,
    startDate: startDatum,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: toernooi.clubnaam,
      address: {
        "@type": "PostalAddress",
        ...(toernooi.adres ? { streetAddress: toernooi.adres } : {}),
        addressLocality: toernooi.gemeente,
        addressRegion: vertaalProvincie(toernooi.provincie, "nl"),
        addressCountry: "BE",
      },
    },
    organizer: {
      "@type": "Organization",
      name: toernooi.clubnaam,
      ...(toernooi.contact_email ? { email: toernooi.contact_email } : {}),
    },
    offers: toernooi.gratis
      ? { "@type": "Offer", price: "0", priceCurrency: "EUR" }
      : toernooi.inschrijvingsprijs
      ? { "@type": "Offer", price: toernooi.inschrijvingsprijs, priceCurrency: "EUR" }
      : undefined,
    url: `${siteUrl}/toernooien/${toernooi.id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TournamentDetail toernooi={toernooi} />
    </>
  );
}
