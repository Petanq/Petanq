import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.petanq.be";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Qpetanque — De Belgische Petanquekalender",
    template: "%s | Qpetanque",
  },
  description:
    "De centrale kalender voor petanquetoernooien in Vlaanderen, Wallonië en Brussel. Gecontroleerd door vrijwilligers.",
  openGraph: {
    title: "Qpetanque — De Belgische Petanquekalender",
    description:
      "De centrale kalender voor petanquetoernooien in Vlaanderen, Wallonië en Brussel.",
    url: siteUrl,
    siteName: "Qpetanque",
    locale: "nl_BE",
    alternateLocale: "fr_BE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qpetanque — De Belgische Petanquekalender",
    description:
      "De centrale kalender voor petanquetoernooien in Vlaanderen, Wallonië en Brussel.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={montserrat.variable}>
      <body className="flex min-h-screen flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
