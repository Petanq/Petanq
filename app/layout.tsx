import type { Metadata } from "next";
import { Bebas_Neue, Outfit } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lebouliste.be";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Le Bouliste.be — Alle petanquetoernooien van België",
    template: "%s | Le Bouliste.be",
  },
  description:
    "De centrale kalender voor petanquetoernooien in Vlaanderen, Wallonië en Brussel. Gecontroleerd door vrijwilligers.",
  openGraph: {
    title: "Le Bouliste.be — Alle petanquetoernooien van België",
    description:
      "De centrale kalender voor petanquetoernooien in Vlaanderen, Wallonië en Brussel.",
    url: siteUrl,
    siteName: "Le Bouliste.be",
    locale: "nl_BE",
    alternateLocale: "fr_BE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Le Bouliste.be — Alle petanquetoernooien van België",
    description:
      "De centrale kalender voor petanquetoernooien in Vlaanderen, Wallonië en Brussel.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${bebasNeue.variable} ${outfit.variable}`}>
      <body className="flex min-h-screen flex-col">
        <LanguageProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
