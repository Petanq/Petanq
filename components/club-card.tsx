import { Club } from "@/lib/types";
import { avatarTintVoor } from "@/lib/initialen";
import { googleMapsUrl } from "@/lib/locatie";
import { WazeLink } from "@/components/waze-link";
import { formatKm } from "@/lib/postcodes";
import { ClubUrenVoorClub } from "@/components/club-beheer/ClubBeheerContext";

// `km` (zoeken op postcode): afstandsbadge naast de naam en alle tekst mag
// op meerdere regels, zodat naam, adres en e-mail volledig leesbaar blijven.
export function ClubCard({ club, km }: { club: Club; km?: number }) {
  const ruim = km !== undefined;
  const tekst = ruim ? "break-words" : "truncate";
  return (
    <div
      title={club.openingsuren ?? undefined}
      className="rounded-[10px] border-[1.5px] border-rand bg-white p-3.5 transition-shadow hover:shadow-[0_4px_16px_rgba(11,31,58,0.08)]"
    >
      <div className="flex items-center gap-3">
        {club.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={club.foto_url}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full border border-rand object-cover"
          />
        ) : (
          <div
            className="h-11 w-11 shrink-0 rounded-full border border-rand bg-contain bg-center bg-no-repeat"
            style={{
              backgroundColor: avatarTintVoor(club.naam),
              backgroundImage: "url('/images/logo-icon.png')",
            }}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div
              className={`${tekst} text-[0.88rem] font-bold leading-snug text-donker`}
            >
              {club.naam}
            </div>
            {ruim && (
              <span className="shrink-0 whitespace-nowrap rounded-full bg-[#1f1f1f] px-2.5 py-0.5 text-[0.7rem] font-bold text-geel">
                {formatKm(km)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[0.76rem] text-grijs">
            <a
              href={googleMapsUrl(club.adres, club.gemeente)}
              target="_blank"
              rel="noopener noreferrer"
              className={`min-w-0 ${tekst} hover:underline`}
            >
              📍 {club.adres || club.gemeente}
            </a>
            <WazeLink adres={club.adres} gemeente={club.gemeente} />
          </div>
          {club.contact_email && (
            <a
              href={`mailto:${club.contact_email}`}
              className={`block ${tekst} text-[0.74rem] text-blauw-3 hover:underline`}
            >
              ✉️ {club.contact_email}
            </a>
          )}
          {club.telefoon && (
            <a
              href={`tel:${club.telefoon.replace(/\s+/g, "")}`}
              className={`block ${tekst} text-[0.74rem] text-blauw-3 hover:underline`}
            >
              📞 {club.telefoon}
            </a>
          )}
        </div>
      </div>
      {/* de uren-knop staat onder de rij, zodat de opengeklapte week de hele kaartbreedte gebruikt */}
      <ClubUrenVoorClub clubId={club.id} />
    </div>
  );
}
