import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { NietGevondenContent } from "@/components/niet-gevonden-content";

export default function GlobaalNietGevonden() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <NietGevondenContent />
      </main>
      <Footer />
    </>
  );
}
