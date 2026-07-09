import { Club } from "@/lib/types";
import { initialenVan, avatarKleurVoor } from "@/lib/initialen";

export function ClubCard({ club }: { club: Club }) {
  return (
    <div
      title={club.openingsuren ?? undefined}
      className="flex items-center gap-3 rounded-[10px] border-[1.5px] border-rand bg-white p-3.5 transition-shadow hover:shadow-[0_4px_16px_rgba(11,31,58,0.08)]"
    >
      {club.foto_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={club.foto_url}
          alt=""
          className="h-11 w-11 shrink-0 rounded-full border border-rand object-cover"
        />
      ) : (
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-titel text-lg text-white ${avatarKleurVoor(
            club.naam
          )}`}
        >
          {initialenVan(club.naam)}
        </div>
      )}
      <div className="min-w-0">
        <div className="truncate text-[0.88rem] font-bold text-donker">{club.naam}</div>
        <div className="truncate text-[0.76rem] text-grijs">
          📍 {club.adres || club.gemeente}
        </div>
        {club.contact_email && (
          <a
            href={`mailto:${club.contact_email}`}
            className="block truncate text-[0.74rem] text-blauw-3 hover:underline"
          >
            ✉️ {club.contact_email}
          </a>
        )}
        {club.telefoon && (
          <a
            href={`tel:${club.telefoon.replace(/\s+/g, "")}`}
            className="block truncate text-[0.74rem] text-blauw-3 hover:underline"
          >
            📞 {club.telefoon}
          </a>
        )}
      </div>
    </div>
  );
}
