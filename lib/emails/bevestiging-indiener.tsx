import { Text } from "@react-email/components";
import { EmailLayout, tekstStijl } from "./layout";

type Props = {
  taal: "nl" | "fr";
  naam: string;
  datum: string;
  gemeente: string;
};

export function BevestigingIndienerEmail({ taal, naam, datum, gemeente }: Props) {
  if (taal === "fr") {
    return (
      <EmailLayout titel="Votre tournoi a bien été reçu">
        <Text style={tekstStijl}>Bonjour,</Text>
        <Text style={tekstStijl}>
          Merci d'avoir soumis votre tournoi <strong>{naam}</strong> ({new Date(datum).toLocaleDateString("fr-BE")}, {gemeente}).
        </Text>
        <Text style={tekstStijl}>
          Un bénévole vérifiera votre demande sous 48 heures. Vous recevrez un e-mail dès que votre tournoi sera publié sur Le Bouliste.be.
        </Text>
      </EmailLayout>
    );
  }

  return (
    <EmailLayout titel="Jouw toernooi is ontvangen">
      <Text style={tekstStijl}>Hallo,</Text>
      <Text style={tekstStijl}>
        Bedankt voor het aanmelden van je toernooi <strong>{naam}</strong> ({new Date(datum).toLocaleDateString("nl-BE")}, {gemeente}).
      </Text>
      <Text style={tekstStijl}>
        Een vrijwilliger bekijkt je aanmelding binnen 48 uur. Je ontvangt een e-mail zodra je toernooi op Le Bouliste.be verschijnt.
      </Text>
    </EmailLayout>
  );
}

export function bevestigingIndienerOnderwerp(taal: "nl" | "fr"): string {
  return taal === "fr" ? "Votre tournoi a bien été reçu" : "Jouw toernooi is ontvangen";
}
