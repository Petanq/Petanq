import { Text } from "@react-email/components";
import { EmailLayout, tekstStijl } from "./layout";

type Props = {
  taal: "nl" | "fr";
  naam: string;
  gemeente: string;
};

export function BevestigingClubIndienerEmail({ taal, naam, gemeente }: Props) {
  if (taal === "fr") {
    return (
      <EmailLayout titel="Votre club a bien été reçu">
        <Text style={tekstStijl}>Bonjour,</Text>
        <Text style={tekstStijl}>
          {"Merci d'avoir proposé le club "}<strong>{naam}</strong> ({gemeente}).
        </Text>
        <Text style={tekstStijl}>
          Un bénévole vérifiera votre proposition sous peu. Vous recevrez un e-mail dès que le club sera publié sur Qpetanque.
        </Text>
      </EmailLayout>
    );
  }

  return (
    <EmailLayout titel="Jouw club is ontvangen">
      <Text style={tekstStijl}>Hallo,</Text>
      <Text style={tekstStijl}>
        Bedankt voor het voorstellen van club <strong>{naam}</strong> ({gemeente}).
      </Text>
      <Text style={tekstStijl}>
        Een vrijwilliger bekijkt je voorstel binnenkort. Je ontvangt een e-mail zodra de club op Qpetanque verschijnt.
      </Text>
    </EmailLayout>
  );
}

export function bevestigingClubIndienerOnderwerp(taal: "nl" | "fr"): string {
  return taal === "fr" ? "Votre club a bien été reçu" : "Jouw club is ontvangen";
}
