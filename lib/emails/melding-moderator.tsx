import { Text, Button } from "@react-email/components";
import { EmailLayout, tekstStijl, knopStijl } from "./layout";

type Props = {
  naam: string;
  clubnaam: string;
  datum: string;
  gemeente: string;
  beheerLink: string;
};

export function MeldingModeratorEmail({ naam, clubnaam, datum, gemeente, beheerLink }: Props) {
  return (
    <EmailLayout titel="Nieuw toernooi in behandeling">
      <Text style={tekstStijl}>
        Er is een nieuw toernooi aangemeld en wacht op goedkeuring:
      </Text>
      <Text style={{ ...tekstStijl, fontWeight: 700 }}>
        {naam} — {clubnaam}
      </Text>
      <Text style={tekstStijl}>
        {new Date(datum).toLocaleDateString("nl-BE")} · {gemeente}
      </Text>
      <Button href={beheerLink} style={knopStijl}>
        Bekijk in het beheerspaneel
      </Button>
      <Text style={{ ...tekstStijl, marginTop: "20px", color: "#94a3b8", fontSize: "12px" }}>
        {"Un nouveau tournoi est en attente d'approbation. Consultez le panneau d'administration pour le vérifier."}
      </Text>
    </EmailLayout>
  );
}

export const meldingModeratorOnderwerp = "Nieuw toernooi in behandeling — Petanque13";
