import { Text, Button } from "@react-email/components";
import { EmailLayout, tekstStijl, knopStijl } from "./layout";

type Props = {
  naam: string;
  gemeente: string;
  beheerLink: string;
};

export function MeldingNieuweClubEmail({ naam, gemeente, beheerLink }: Props) {
  return (
    <EmailLayout titel="Nieuwe club wacht op goedkeuring">
      <Text style={tekstStijl}>Er is een nieuwe club voorgesteld en wacht op goedkeuring:</Text>
      <Text style={{ ...tekstStijl, fontWeight: 700 }}>
        {naam} — {gemeente}
      </Text>
      <Button href={beheerLink} style={knopStijl}>
        Bekijk in het beheerspaneel
      </Button>
      <Text style={{ ...tekstStijl, marginTop: "20px", color: "#94a3b8", fontSize: "12px" }}>
        {"Un nouveau club a été proposé et attend une approbation. Consultez le panneau d'administration."}
      </Text>
    </EmailLayout>
  );
}

export const meldingNieuweClubOnderwerp = "Nieuwe club wacht op goedkeuring — PetanQ";
