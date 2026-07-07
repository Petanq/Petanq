import type { MetadataRoute } from "next";
import { getGoedgekeurdeToernooien } from "@/lib/data";

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.petanq.be";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const toernooien = await getGoedgekeurdeToernooien();
  const base = siteUrl();

  const statischePaden: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/clubs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/toernooi-toevoegen`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const toernooiPaden: MetadataRoute.Sitemap = toernooien.map((toernooi) => ({
    url: `${base}/toernooien/${toernooi.id}`,
    lastModified: toernooi.aangemaakt_op,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...statischePaden, ...toernooiPaden];
}
