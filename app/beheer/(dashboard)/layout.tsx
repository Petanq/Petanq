import { BeheerNav } from "@/components/beheer/beheer-nav";
import { WachtOpGoedkeuring } from "@/components/beheer/wacht-op-goedkeuring";
import { getInBehandelingToernooien, getWachtendeClubs } from "@/lib/data";
import { isModerator } from "@/lib/auth-helpers";

export default async function BeheerDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isModerator())) {
    return (
      <div className="mx-auto max-w-[1140px] px-6 py-8 lg:px-10">
        <WachtOpGoedkeuring />
      </div>
    );
  }

  const [toernooien, clubs] = await Promise.all([getInBehandelingToernooien(), getWachtendeClubs()]);

  return (
    <div>
      <BeheerNav wachtendeToernooien={toernooien.length} wachtendeClubs={clubs.length} />
      <div className="mx-auto max-w-[1140px] px-6 py-8 lg:px-10">{children}</div>
    </div>
  );
}
