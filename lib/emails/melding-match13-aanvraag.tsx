import { Text, Button } from "@react-email/components";
import { EmailLayout, tekstStijl, knopStijl } from "./layout";

type Props = {
  club: string;
  naam: string;
  email: string;
  beheerLink: string;
};

export function MeldingMatch13AanvraagEmail({ club, naam, email, beheerLink }: Props) {
  return (
    <EmailLayout titel="Nieuwe Match13-aanvraag">
      <Text style={tekstStijl}>Een club vraagt toegang tot Match13:</Text>
      <Text style={{ ...tekstStijl, fontWeight: 700 }}>
        {club} — {naam} ({email})
      </Text>
      <Button href={beheerLink} style={knopStijl}>
        Bekijk de aanvraag
      </Button>
    </EmailLayout>
  );
}

export const meldingMatch13AanvraagOnderwerp = "Nieuwe Match13-aanvraag — Petanque13";
