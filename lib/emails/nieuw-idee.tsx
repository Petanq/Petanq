import { Text, Button } from "@react-email/components";
import { EmailLayout, tekstStijl, knopStijl } from "./layout";

type Props = {
  moderatorNaam: string;
  tekst: string;
  beheerLink: string;
};

export function NieuwIdeeEmail({ moderatorNaam, tekst, beheerLink }: Props) {
  return (
    <EmailLayout titel="Nieuw idee van een vrijwilliger">
      <Text style={tekstStijl}>
        {moderatorNaam} heeft een idee doorgegeven:
      </Text>
      <Text style={{ ...tekstStijl, fontStyle: "italic" }}>&quot;{tekst}&quot;</Text>
      <Button href={beheerLink} style={knopStijl}>
        Bekijk alle ideeën
      </Button>
    </EmailLayout>
  );
}

export const nieuwIdeeOnderwerp = "Nieuw idee van een vrijwilliger — Petanque13";
