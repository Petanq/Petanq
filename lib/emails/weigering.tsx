import { Text } from "@react-email/components";
import { EmailLayout, tekstStijl } from "./layout";

type Props = {
  naam: string;
  reden: string | null;
};

// De taal van de indiener wordt niet opgeslagen bij het toernooi, dus deze
// mail toont beide talen (NL + FR) zodat de indiener het zeker begrijpt.
export function WeigeringEmail({ naam, reden }: Props) {
  return (
    <EmailLayout titel="Jouw toernooi is niet gepubliceerd / Votre tournoi n'a pas été publié">
      <Text style={tekstStijl}>Hallo,</Text>
      <Text style={tekstStijl}>
        Jouw toernooi <strong>{naam}</strong> is helaas niet gepubliceerd op Petanque13.
      </Text>
      {reden && (
        <Text style={tekstStijl}>
          <strong>Reden:</strong> {reden}
        </Text>
      )}
      <Text style={tekstStijl}>
        Je kan het toernooi na aanpassing opnieuw indienen, of contact met ons opnemen voor meer uitleg.
      </Text>
      <Text style={{ ...tekstStijl, marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
        Bonjour,
      </Text>
      <Text style={tekstStijl}>
        {"Votre tournoi "}<strong>{naam}</strong>{" n'a malheureusement pas été publié sur Petanque13."}
      </Text>
      {reden && (
        <Text style={tekstStijl}>
          <strong>Motif :</strong> {reden}
        </Text>
      )}
      <Text style={tekstStijl}>
        {"Vous pouvez soumettre à nouveau votre tournoi après correction, ou nous contacter pour plus d'informations."}
      </Text>
    </EmailLayout>
  );
}

export const weigeringOnderwerp = "Jouw toernooi is niet gepubliceerd / Votre tournoi n'a pas été publié";
