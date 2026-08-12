import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-helpers";
import { getVerwijderAanvragenToernooien, getVerwijderAanvragenClubs } from "@/lib/data";
import { VerwijderaanvragenList } from "@/components/beheer/verwijderaanvragen-list";

export default async function BeheerVerwijderaanvragenPagina() {
  if (!(await isAdmin())) redirect("/beheer");

  const [toernooien, clubs] = await Promise.all([
    getVerwijderAanvragenToernooien(),
    getVerwijderAanvragenClubs(),
  ]);

  return <VerwijderaanvragenList toernooien={toernooien} clubs={clubs} />;
}
