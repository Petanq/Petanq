import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { BezoekTeller } from "@/components/bezoek-teller";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BezoekTeller />
      <Nav />
      <div className="border-b border-rand bg-white px-6 py-4 text-center">
        <Image
          src="/images/logo-volledig.png"
          alt="Petanque13"
          width={213}
          height={48}
          priority
          className="mx-auto"
        />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
