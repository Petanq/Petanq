import { Text, Button } from "@react-email/components";
import { EmailLayout, tekstStijl, knopStijl } from "./layout";

type Props = {
  clubNaam: string;
  onderdelen: string[]; // bv. ["gegevens", "openingsuren"]
  beheerLink: string;
};

export function MeldingClubWijzigingEmail({ clubNaam, onderdelen, beheerLink }: Props) {
  return (
    <EmailLayout titel="Een club wil iets aanpassen">
      <Text style={tekstStijl}>Er is een wijziging voorgesteld en ze wacht op jouw goedkeuring:</Text>
      <Text style={{ ...tekstStijl, fontWeight: 700 }}>{clubNaam}</Text>
      <Text style={tekstStijl}>Aangepast: {onderdelen.join(" en ")}.</Text>
      <Button href={beheerLink} style={knopStijl}>
        Bekijk en keur goed
      </Button>
      <Text style={{ ...tekstStijl, marginTop: "20px", color: "#94a3b8", fontSize: "12px" }}>
        Tot je goedkeurt, blijven de oude gegevens op de site staan. Je ziet het voor en na naast elkaar.
      </Text>
    </EmailLayout>
  );
}

export const meldingClubWijzigingOnderwerp = (clubNaam: string) => `${clubNaam} wil iets aanpassen: keur goed — Petanque13`;
