import { haalMatch13Toernooien, haalEigenToernooienOmTeKoppelen } from "@/actions/match13";
import { isAdmin } from "@/lib/auth-helpers";
import { haalNieuweClubs } from "@/actions/match13-clubs";
import { telTeKeuren } from "@/actions/club-beheer";
import { Match13Overzicht } from "@/components/match13/Match13Overzicht";

export default async function Match13OverzichtPagina() {
  const [toernooien, admin, koppelOpties, nieuweClubs, teKeuren] = await Promise.all([
    haalMatch13Toernooien(),
    isAdmin(),
    haalEigenToernooienOmTeKoppelen(),
    haalNieuweClubs(),
    telTeKeuren(),
  ]);

  return <Match13Overzicht toernooien={toernooien} admin={admin} koppelOpties={koppelOpties} nieuweClubs={nieuweClubs} teKeuren={teKeuren} />;
}
