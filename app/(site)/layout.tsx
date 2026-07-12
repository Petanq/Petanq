import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <div className="border-b border-rand bg-white px-6 py-4 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-wordmark.png" alt="Petanque13" className="mx-auto h-12 w-auto" />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
