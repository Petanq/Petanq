import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";
import { siteUrl } from "@/lib/site-url";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Petanque13 — De Belgische Petanquekalender",
    template: "%s | Petanque13",
  },
  description:
    "De centrale kalender voor petanquetoernooien in Vlaanderen, Wallonië en Brussel. Gecontroleerd door vrijwilligers.",
  openGraph: {
    title: "Petanque13 — De Belgische Petanquekalender",
    description:
      "De centrale kalender voor petanquetoernooien in Vlaanderen, Wallonië en Brussel.",
    url: siteUrl(),
    siteName: "Petanque13",
    locale: "nl_BE",
    alternateLocale: "fr_BE",
    type: "website",
    images: [{ url: "/images/logo-bron-volledig.png", width: 1536, height: 1024, alt: "Petanque13" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Petanque13 — De Belgische Petanquekalender",
    description:
      "De centrale kalender voor petanquetoernooien in Vlaanderen, Wallonië en Brussel.",
    images: ["/images/logo-bron-volledig.png"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Petanque13",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F1F1F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={montserrat.variable}>
      <body className="flex min-h-screen flex-col">
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
