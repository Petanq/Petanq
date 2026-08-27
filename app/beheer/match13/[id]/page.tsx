import Link from "next/link";
import { haalMatch13Toernooi } from "@/actions/match13";
import { Match13App } from "@/components/match13/Match13App";

export default async function Match13ToernooiPagina({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initialState = await haalMatch13Toernooi(id);

  if (!initialState) {
    return (
      <div style={{ maxWidth: 480, margin: "4rem auto", textAlign: "center", padding: "0 1.5rem" }}>
        <p style={{ marginBottom: "1rem" }}>
          Dit toernooi kon niet geladen worden — mogelijk een tijdelijke verbindingsfout.
        </p>
        <Link href={`/beheer/match13/${id}`} style={{ marginRight: "1rem" }}>
          Opnieuw proberen
        </Link>
        <Link href="/beheer/match13">Terug naar overzicht</Link>
      </div>
    );
  }

  return <Match13App tournamentId={id} initialState={initialState} />;
}
