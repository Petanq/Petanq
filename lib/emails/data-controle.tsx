import { Text, Link } from "@react-email/components";
import { EmailLayout, tekstStijl } from "./layout";
import { siteUrl } from "@/lib/site-url";

export type DubbelBevinding = { naam: string; datum: string; club: string };
export type AdresBevinding = { naam: string; datum: string; club: string };
export type OpenstaandBevinding = { naam: string; club: string; dagen: number };
export type ProvincieMismatchBevinding = { naam: string; opgegeven: string; gevonden: string };

type Props = {
  dubbels: DubbelBevinding[];
  ontbrekendAdres: AdresBevinding[];
  langOpenstaand: OpenstaandBevinding[];
  provincieMismatch: ProvincieMismatchBevinding[];
  aantalZonderClub: number;
};

const lijstItemStijl = { ...tekstStijl, margin: "0 0 6px" };

function formatDatum(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-BE", { day: "numeric", month: "short", year: "numeric" });
}

export function DataControleEmail({
  dubbels,
  ontbrekendAdres,
  langOpenstaand,
  provincieMismatch,
  aantalZonderClub,
}: Props) {
  const niksGevonden =
    dubbels.length === 0 &&
    ontbrekendAdres.length === 0 &&
    langOpenstaand.length === 0 &&
    provincieMismatch.length === 0;

  return (
    <EmailLayout titel="Automatische controle — Petanque13">
      {niksGevonden ? (
        <Text style={tekstStijl}>
          Niets te melden deze keer — geen dubbels, ontbrekende adressen of lang openstaande tornooien gevonden. 👍
        </Text>
      ) : (
        <>
          {dubbels.length > 0 && (
            <>
              <Text style={{ ...tekstStijl, fontWeight: 700, margin: "0 0 6px" }}>
                Mogelijk dubbel ingegeven ({dubbels.length})
              </Text>
              {dubbels.map((d, i) => (
                <Text key={i} style={lijstItemStijl}>
                  • {d.naam} — {formatDatum(d.datum)} — {d.club}
                </Text>
              ))}
              <Text style={{ ...tekstStijl, margin: "0 0 16px", fontSize: "12px", color: "#64748b" }}>
                Controleer in het beheerpaneel of dit écht om hetzelfde tornooi gaat.
              </Text>
            </>
          )}

          {ontbrekendAdres.length > 0 && (
            <>
              <Text style={{ ...tekstStijl, fontWeight: 700, margin: "0 0 6px" }}>
                Tornooi zonder adres, terwijl de club er wél één heeft ({ontbrekendAdres.length})
              </Text>
              {ontbrekendAdres.map((d, i) => (
                <Text key={i} style={lijstItemStijl}>
                  • {d.naam} — {formatDatum(d.datum)} — {d.club}
                </Text>
              ))}
              <Text style={{ ...tekstStijl, margin: "0 0 16px" }} />
            </>
          )}

          {langOpenstaand.length > 0 && (
            <>
              <Text style={{ ...tekstStijl, fontWeight: 700, margin: "0 0 6px" }}>
                Al meer dan 3 dagen in behandeling ({langOpenstaand.length})
              </Text>
              {langOpenstaand.map((d, i) => (
                <Text key={i} style={lijstItemStijl}>
                  • {d.naam} — {d.club} — {d.dagen} dagen
                </Text>
              ))}
            </>
          )}

          {provincieMismatch.length > 0 && (
            <>
              <Text style={{ ...tekstStijl, fontWeight: 700, margin: "16px 0 6px" }}>
                Mogelijk verkeerde provincie ({provincieMismatch.length})
              </Text>
              {provincieMismatch.map((d, i) => (
                <Text key={i} style={lijstItemStijl}>
                  • {d.naam} — ingevuld als &quot;{d.opgegeven}&quot;, adres wijst op &quot;{d.gevonden}&quot;
                </Text>
              ))}
              <Text style={{ ...tekstStijl, margin: "0 0 16px", fontSize: "12px", color: "#64748b" }}>
                Gebaseerd op het opgezochte adres — controleer zeker voor je iets aanpast.
              </Text>
            </>
          )}
        </>
      )}

      {aantalZonderClub > 0 && (
        <Text style={{ ...tekstStijl, marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
          Nog <strong>{aantalZonderClub}</strong> tornooi{aantalZonderClub === 1 ? "" : "en"} zonder gekoppelde club
          in de directory.
        </Text>
      )}

      <Link href={`${siteUrl()}/beheer`} style={{ ...tekstStijl, display: "inline-block", marginTop: "16px" }}>
        Naar het beheerpaneel →
      </Link>
    </EmailLayout>
  );
}

export const dataControleOnderwerp = "Automatische controle — Petanque13";
