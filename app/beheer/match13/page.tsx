import { haalMatch13Toernooien } from "@/actions/match13";
import { isAdmin } from "@/lib/auth-helpers";
import { Match13Overzicht } from "@/components/match13/Match13Overzicht";

export default async function Match13OverzichtPagina() {
  const [toernooien, admin] = await Promise.all([haalMatch13Toernooien(), isAdmin()]);

  return <Match13Overzicht toernooien={toernooien} admin={admin} />;
}
