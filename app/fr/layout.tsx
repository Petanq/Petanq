import { LanguageProvider } from "@/lib/language-context";
import { SiteChrome } from "@/components/site-chrome";

// Franse versie van de site: dezelfde omlijsting, maar de taal staat vast op Frans.
export default function FrLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider forceTaal="fr">
      <SiteChrome>{children}</SiteChrome>
    </LanguageProvider>
  );
}
