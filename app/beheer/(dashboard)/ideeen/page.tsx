import { getIdeeen } from "@/lib/data";
import { isAdmin } from "@/lib/auth-helpers";
import { IdeeenList } from "@/components/beheer/ideeen-list";

export default async function BeheerIdeeenPagina() {
  const [ideeen, magAdmin] = await Promise.all([getIdeeen(), isAdmin()]);
  return <IdeeenList ideeen={ideeen} isAdmin={magAdmin} />;
}
