import { Club } from "@/lib/types";
import { avatarTintVoor } from "@/lib/initialen";
import { formatKm } from "@/lib/postcodes";
import { ClubUrenVoorClub } from "@/components/club-beheer/ClubBeheerContext";
import { ClubRoute } from "@/components/club-route";
import { ClubWijzigingKnop } from "@/components/club-beheer/ClubWijzigingKnop";

const LIJN = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Pictogram({ kind }: { kind: "pin" | "mail" | "tel" }) {
  return (
    <span className="cb-ic" aria-hidden="true">
      <svg viewBox="0 0 24 24" {...LIJN}>
        {kind === "pin" && (
          <>
            <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </>
        )}
        {kind === "mail" && <path d="M4 6h16v12H4zM4 7l8 6 8-6" />}
        {kind === "tel" && (
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
        )}
      </svg>
    </span>
  );
}

// Een regel met een klein goud pictogram (adres, e-mail of telefoon).
function Regel({ kind, children, href }: { kind: "pin" | "mail" | "tel"; children: React.ReactNode; href?: string }) {
  const inhoud = (
    <>
      <Pictogram kind={kind} />
      <span className="min-w-0 break-words">{children}</span>
    </>
  );
  return href ? (
    <a href={href} className="cb-info-regel hover:underline">
      {inhoud}
    </a>
  ) : (
    <div className="cb-info-regel">{inhoud}</div>
  );
}

// `km` (zoeken op postcode): afstandsbadge naast de naam. Het kaartje toont enkel wat de club
// echt heeft (adres, e-mail, telefoon), met onderaan de uren en één gele routeknop met keuze van de app.
export function ClubCard({ club, km }: { club: Club; km?: number }) {
  const ruim = km !== undefined;
  const telefoonLink = club.telefoon ? `tel:${club.telefoon.replace(/\s+/g, "")}` : undefined;
  return (
    <div
      title={club.openingsuren ?? undefined}
      className="club-kaart rounded-[12px] border-[1.5px] border-rand bg-white p-3.5 transition-shadow"
    >
      <div className="flex items-start gap-3">
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
            <div className="break-words text-[0.9rem] font-extrabold leading-snug text-donker">{club.naam}</div>
            {ruim && (
              <span className="shrink-0 whitespace-nowrap rounded-full bg-[#1f1f1f] px-2.5 py-0.5 text-[0.7rem] font-bold text-geel">
                {formatKm(km)}
              </span>
            )}
          </div>
          <Regel kind="pin">{club.adres || club.gemeente}</Regel>
          {club.contact_email && (
            <Regel kind="mail" href={`mailto:${club.contact_email}`}>
              {club.contact_email}
            </Regel>
          )}
          {club.telefoon && (
            <Regel kind="tel" href={telefoonLink}>
              {club.telefoon}
            </Regel>
          )}
        </div>
      </div>
      {/* onder de rij, zodat de opengeklapte week de hele kaartbreedte gebruikt */}
      <ClubUrenVoorClub clubId={club.id} />
      <ClubRoute adres={club.adres} gemeente={club.gemeente} />
      <ClubWijzigingKnop club={club} />
    </div>
  );
}
