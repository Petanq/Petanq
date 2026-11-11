import { Text } from "@react-email/components";
import { EmailLayout, tekstStijl } from "./layout";

type Props = {
  taal: "nl" | "fr";
  clubNaam: string;
  soort: "ontvangen" | "goedgekeurd" | "afgewezen";
  reden?: string;
};

// Mail aan de bezoeker die een aanpassing voor een club voorstelde: ontvangen, goedgekeurd of afgewezen.
export function ClubVoorstelBezoekerEmail({ taal, clubNaam, soort, reden }: Props) {
  if (taal === "fr") {
    return (
      <EmailLayout titel={clubVoorstelBezoekerOnderwerp(taal, soort)}>
        <Text style={tekstStijl}>Bonjour,</Text>
        {soort === "ontvangen" && (
          <Text style={tekstStijl}>
            {"Merci ! Nous avons bien reçu votre proposition de modification pour le club "}
            <strong>{clubNaam}</strong>
            {". Un bénévole la vérifie avant publication ; vous recevrez un e-mail dès que ce sera fait."}
          </Text>
        )}
        {soort === "goedgekeurd" && (
          <Text style={tekstStijl}>
            {"Votre proposition pour le club "}
            <strong>{clubNaam}</strong>
            {" est maintenant en ligne sur Petanque13. Merci de votre aide !"}
          </Text>
        )}
        {soort === "afgewezen" && (
          <>
            <Text style={tekstStijl}>
              {"Nous n'avons pas pu publier votre proposition pour le club "}
              <strong>{clubNaam}</strong>
              {"."}
            </Text>
            {reden ? <Text style={tekstStijl}>Raison : {reden}</Text> : null}
            <Text style={tekstStijl}>Vous pouvez toujours soumettre une nouvelle proposition.</Text>
          </>
        )}
      </EmailLayout>
    );
  }

  return (
    <EmailLayout titel={clubVoorstelBezoekerOnderwerp(taal, soort)}>
      <Text style={tekstStijl}>Hallo,</Text>
      {soort === "ontvangen" && (
        <Text style={tekstStijl}>
          Bedankt! We hebben je voorstel om de gegevens van club <strong>{clubNaam}</strong> aan te passen ontvangen. Een
          vrijwilliger bekijkt het voor het online komt; je krijgt een mail zodra dat gebeurd is.
        </Text>
      )}
      {soort === "goedgekeurd" && (
        <Text style={tekstStijl}>
          Je voorstel voor club <strong>{clubNaam}</strong> staat nu online op Petanque13. Bedankt voor je hulp!
        </Text>
      )}
      {soort === "afgewezen" && (
        <>
          <Text style={tekstStijl}>
            We konden je voorstel voor club <strong>{clubNaam}</strong> helaas niet online zetten.
          </Text>
          {reden ? <Text style={tekstStijl}>Reden: {reden}</Text> : null}
          <Text style={tekstStijl}>Je mag altijd een nieuw voorstel indienen.</Text>
        </>
      )}
    </EmailLayout>
  );
}

export function clubVoorstelBezoekerOnderwerp(taal: "nl" | "fr", soort: "ontvangen" | "goedgekeurd" | "afgewezen"): string {
  if (taal === "fr") {
    return soort === "ontvangen"
      ? "Votre proposition pour un club a bien été reçue"
      : soort === "goedgekeurd"
        ? "Votre proposition est en ligne"
        : "Votre proposition n'a pas pu être publiée";
  }
  return soort === "ontvangen"
    ? "Je voorstel voor een club is ontvangen"
    : soort === "goedgekeurd"
      ? "Je voorstel staat online"
      : "Je voorstel kon niet online";
}
