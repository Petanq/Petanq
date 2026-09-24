import { Text, Button } from "@react-email/components";
import { EmailLayout, tekstStijl, knopStijl } from "./layout";

type Props = {
  taal: "nl" | "fr";
  club: string;
  link: string;
};

export function Match13ToegangLinkEmail({ taal, club, link }: Props) {
  if (taal === "fr") {
    return (
      <EmailLayout titel="Votre accès à Match13">
        <Text style={tekstStijl}>Bonjour,</Text>
        <Text style={tekstStijl}>
          {"Votre demande d'accès à Match13 pour "}
          <strong>{club}</strong>
          {" est approuvée. Cliquez sur le lien ci-dessous pour choisir votre mot de passe et vous connecter."}
        </Text>
        <Button href={link} style={knopStijl}>
          Activer mon accès
        </Button>
        <Text style={tekstStijl}>Ce lien reste valable 7 jours.</Text>
      </EmailLayout>
    );
  }

  return (
    <EmailLayout titel="Jouw toegang tot Match13">
      <Text style={tekstStijl}>Hallo,</Text>
      <Text style={tekstStijl}>
        Je aanvraag om Match13 te gebruiken voor <strong>{club}</strong> is goedgekeurd. Klik op onderstaande link om
        je wachtwoord in te stellen en in te loggen.
      </Text>
      <Button href={link} style={knopStijl}>
        Toegang activeren
      </Button>
      <Text style={tekstStijl}>Deze link blijft 7 dagen geldig.</Text>
    </EmailLayout>
  );
}

export function match13ToegangLinkOnderwerp(taal: "nl" | "fr"): string {
  return taal === "fr" ? "Votre accès à Match13" : "Jouw toegang tot Match13";
}
