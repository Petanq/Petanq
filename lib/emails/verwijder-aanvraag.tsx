import { Text, Button } from "@react-email/components";
import { EmailLayout, tekstStijl, knopStijl } from "./layout";

type Props = {
  soort: "toernooi" | "club";
  naam: string;
  aanvragerNaam: string;
  reden: string;
  beheerLink: string;
};

export function VerwijderAanvraagEmail({ soort, naam, aanvragerNaam, reden, beheerLink }: Props) {
  return (
    <EmailLayout titel={`Verwijdering aangevraagd: ${soort === "toernooi" ? "toernooi" : "club"}`}>
      <Text style={tekstStijl}>
        {aanvragerNaam} vraagt om {soort === "toernooi" ? "een toernooi" : "een club"} te verwijderen:
      </Text>
      <Text style={{ ...tekstStijl, fontWeight: 700 }}>{naam}</Text>
      <Text style={{ ...tekstStijl, fontStyle: "italic" }}>&quot;{reden}&quot;</Text>
      <Text style={tekstStijl}>
        Enkel een admin kan dit definitief bevestigen of afwijzen.
      </Text>
      <Button href={beheerLink} style={knopStijl}>
        Bekijk verwijderingsaanvragen
      </Button>
    </EmailLayout>
  );
}

export function verwijderAanvraagOnderwerp(soort: "toernooi" | "club"): string {
  return `Verwijdering aangevraagd — ${soort === "toernooi" ? "toernooi" : "club"} — Petanque13`;
}
