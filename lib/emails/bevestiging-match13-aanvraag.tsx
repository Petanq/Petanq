import { Text } from "@react-email/components";
import { EmailLayout, tekstStijl } from "./layout";

type Props = {
  taal: "nl" | "fr";
  club: string;
};

export function BevestigingMatch13AanvraagEmail({ taal, club }: Props) {
  if (taal === "fr") {
    return (
      <EmailLayout titel="Votre demande Match13 est bien reçue">
        <Text style={tekstStijl}>Bonjour,</Text>
        <Text style={tekstStijl}>
          {"Merci pour la demande d'accès à Match13 pour "}
          <strong>{club}</strong>.
        </Text>
        <Text style={tekstStijl}>
          Nous examinons votre demande personnellement et vous recontactons bientôt par e-mail.
        </Text>
      </EmailLayout>
    );
  }

  return (
    <EmailLayout titel="Jouw Match13-aanvraag is ontvangen">
      <Text style={tekstStijl}>Hallo,</Text>
      <Text style={tekstStijl}>
        Bedankt voor de aanvraag om Match13 te gebruiken voor <strong>{club}</strong>.
      </Text>
      <Text style={tekstStijl}>We bekijken je aanvraag persoonlijk en nemen binnenkort contact met je op.</Text>
    </EmailLayout>
  );
}

export function bevestigingMatch13AanvraagOnderwerp(taal: "nl" | "fr"): string {
  return taal === "fr" ? "Votre demande Match13 est bien reçue" : "Jouw Match13-aanvraag is ontvangen";
}
