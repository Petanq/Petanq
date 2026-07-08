import { BeheerNav } from "@/components/beheer/beheer-nav";
import { getInBehandelingToernooien, getWachtendeClubs } from "@/lib/data";

export default async function BeheerDashboardLayout({ children }: { children: React.ReactNode }) {
  const [toernooien, clubs] = await Promise.all([getInBehandelingToernooien(), getWachtendeClubs()]);

  return (
    <div>
      <BeheerNav wachtendeToernooien={toernooien.length} wachtendeClubs={clubs.length} />
      <div className="mx-auto max-w-[1140px] px-6 py-8 lg:px-10">{children}</div>
    </div>
  );
}
