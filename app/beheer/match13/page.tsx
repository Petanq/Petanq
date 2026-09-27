import { haalMatch13Toernooien, haalEigenToernooienOmTeKoppelen } from "@/actions/match13";
import { isAdmin } from "@/lib/auth-helpers";
import { Match13Overzicht } from "@/components/match13/Match13Overzicht";

export default async function Match13OverzichtPagina() {
  const [toernooien, admin, koppelOpties] = await Promise.all([
    haalMatch13Toernooien(),
    isAdmin(),
    haalEigenToernooienOmTeKoppelen(),
  ]);

  return <Match13Overzicht toernooien={toernooien} admin={admin} koppelOpties={koppelOpties} />;
}
