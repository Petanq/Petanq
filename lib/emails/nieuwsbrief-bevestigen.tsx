import { Button, Text } from "@react-email/components";
import { EmailLayout, tekstStijl } from "./layout";

type Props = { taal: "nl" | "fr"; link: string };

const knopStijl = {
  backgroundColor: "#F4C430",
  color: "#1F1F1F",
  fontWeight: 700,
  fontSize: "14px",
  borderRadius: "8px",
  padding: "12px 22px",
  textDecoration: "none",
  display: "inline-block",
};

// Bevestigingsmail voor de nieuwsbrief: pas na een klik op de link is de inschrijving actief.
export function NieuwsbriefBevestigenEmail({ taal, link }: Props) {
  if (taal === "fr") {
    return (
      <EmailLayout titel="Confirmez votre inscription">
        <Text style={tekstStijl}>Bonjour,</Text>
        <Text style={tekstStijl}>
          {"Quelqu'un (vous, nous l'espérons) a demandé à recevoir la newsletter de Petanque13. Cliquez sur le bouton ci-dessous pour confirmer votre inscription."}
        </Text>
        <Button href={link} style={knopStijl}>
          Confirmer mon inscription
        </Button>
        <Text style={{ ...tekstStijl, marginTop: "16px" }}>
          {"Ce n'était pas vous ? Ignorez simplement cet e-mail : sans confirmation, vous ne recevrez rien."}
        </Text>
      </EmailLayout>
    );
  }

  return (
    <EmailLayout titel="Bevestig je inschrijving">
      <Text style={tekstStijl}>Hallo,</Text>
      <Text style={tekstStijl}>
        Iemand (hopelijk jij) vroeg om de nieuwsbrief van Petanque13 te ontvangen. Klik op de knop hieronder om je inschrijving te bevestigen.
      </Text>
      <Button href={link} style={knopStijl}>
        Bevestig mijn inschrijving
      </Button>
      <Text style={{ ...tekstStijl, marginTop: "16px" }}>
        Was jij het niet? Negeer deze mail dan gewoon: zonder bevestiging ontvang je niets.
      </Text>
    </EmailLayout>
  );
}

export function nieuwsbriefBevestigenOnderwerp(taal: "nl" | "fr"): string {
  return taal === "fr" ? "Confirmez votre inscription à la newsletter" : "Bevestig je inschrijving op de nieuwsbrief";
}
