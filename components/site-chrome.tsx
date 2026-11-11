import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { BezoekTeller } from "@/components/bezoek-teller";
import { TerugKnop } from "@/components/terug-knop";
import { LogoOfBeheer } from "@/components/logo-of-beheer";
import { SiteAchtergrond } from "@/components/site-achtergrond";
import { SkipLink } from "@/components/skip-link";

// De vaste omlijsting van de site (balk bovenaan, footer, achtergrond). Zowel de Nederlandse
// pagina's als de Franse (/fr) gebruiken dezelfde omlijsting.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <SiteAchtergrond>
      <SkipLink />
      <BezoekTeller />
      <Nav />
      <LogoOfBeheer />
      <TerugKnop />
      <main id="inhoud" tabIndex={-1} className="flex-1 scroll-mt-20 outline-none">{children}</main>
      <Footer />
    </SiteAchtergrond>
  );
}
