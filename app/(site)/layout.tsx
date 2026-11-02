import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { BezoekTeller } from "@/components/bezoek-teller";
import { TerugKnop } from "@/components/terug-knop";
import { LogoOfBeheer } from "@/components/logo-of-beheer";
import { SiteAchtergrond } from "@/components/site-achtergrond";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteAchtergrond>
      <BezoekTeller />
      <Nav />
      <LogoOfBeheer />
      <TerugKnop />
      <main className="flex-1">{children}</main>
      <Footer />
    </SiteAchtergrond>
  );
}
