import { Text, Button } from "@react-email/components";
import { EmailLayout, tekstStijl, knopStijl } from "./layout";

type Props = {
  taal: "nl" | "fr";
  naam: string;
  clubnaam: string;
  datum: string;
  gemeente: string;
  provincieNaam: string;
  toernooiLink: string;
};

export function NieuwToernooiNieuwsbriefEmail({
  taal,
  naam,
  clubnaam,
  datum,
  gemeente,
  provincieNaam,
  toernooiLink,
}: Props) {
  if (taal === "fr") {
    return (
      <EmailLayout titel={`Nouveau tournoi en ${provincieNaam}`}>
        <Text style={tekstStijl}>Bonjour,</Text>
        <Text style={tekstStijl}>
          Un nouveau tournoi vient d'être ajouté dans votre province ({provincieNaam}) :
        </Text>
        <Text style={{ ...tekstStijl, fontWeight: 700 }}>
          {naam} — {clubnaam}
        </Text>
        <Text style={tekstStijl}>
          {new Date(datum).toLocaleDateString("fr-BE")} · {gemeente}
        </Text>
        <Button href={toernooiLink} style={knopStijl}>
          Voir le tournoi
        </Button>
      </EmailLayout>
    );
  }

  return (
    <EmailLayout titel={`Nieuw toernooi in ${provincieNaam}`}>
      <Text style={tekstStijl}>Hallo,</Text>
      <Text style={tekstStijl}>
        Er is een nieuw toernooi toegevoegd in jouw provincie ({provincieNaam}):
      </Text>
      <Text style={{ ...tekstStijl, fontWeight: 700 }}>
        {naam} — {clubnaam}
      </Text>
      <Text style={tekstStijl}>
        {new Date(datum).toLocaleDateString("nl-BE")} · {gemeente}
      </Text>
      <Button href={toernooiLink} style={knopStijl}>
        Bekijk het toernooi
      </Button>
    </EmailLayout>
  );
}

export function nieuwToernooiOnderwerp(taal: "nl" | "fr", provincieNaam: string): string {
  return taal === "fr"
    ? `Nouveau tournoi en ${provincieNaam}`
    : `Nieuw toernooi in ${provincieNaam}`;
}
