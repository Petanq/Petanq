import { getInBehandelingToernooien } from "@/lib/data";
import { PendingList } from "@/components/beheer/pending-list";

export default async function BeheerDashboardPagina() {
  const toernooien = await getInBehandelingToernooien();
  return <PendingList toernooien={toernooien} />;
}
