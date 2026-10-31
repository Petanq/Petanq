import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { BezoekTeller } from "@/components/bezoek-teller";
import { TerugKnop } from "@/components/terug-knop";
import { LogoOfBeheer } from "@/components/logo-of-beheer";
import { AchtergrondProef } from "@/components/achtergrond-proef";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BezoekTeller />
      <Nav />
      <LogoOfBeheer />
      <TerugKnop />
      {process.env.NODE_ENV !== "production" ? (
        <AchtergrondProef>{children}</AchtergrondProef>
      ) : (
        <main className="flex-1">{children}</main>
      )}
      <Footer />
    </>
  );
}
