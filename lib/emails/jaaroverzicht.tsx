import { Text } from "@react-email/components";
import { EmailLayout, tekstStijl } from "./layout";

type Props = {
  naam: string;
  aantal: number;
  jaar: number;
};

// De taal van de vrijwilliger wordt nergens opgeslagen, dus ook deze mail
// toont beide talen (NL + FR), net als de weigeringsmail.
export function JaaroverzichtEmail({ naam, aantal, jaar }: Props) {
  return (
    <EmailLayout titel={`Jouw ${jaar} in cijfers / Ton ${jaar} en chiffres`}>
      <Text style={tekstStijl}>Hallo {naam},</Text>
      <Text style={tekstStijl}>
        Dankzij jou keurde Petanque13 in {jaar} maar liefst <strong>{aantal}</strong> toernooi
        {aantal === 1 ? "" : "en"} goed voor de kalender. Dankzij vrijwilligers zoals jij blijft de kalender
        betrouwbaar en up-to-date voor alle petanquespelers in België.
      </Text>
      <Text style={tekstStijl}>Bedankt voor je inzet, en op naar een even mooi {jaar + 1}! 🎉</Text>
      <Text style={{ ...tekstStijl, marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
        Bonjour {naam},
      </Text>
      <Text style={tekstStijl}>
        {"Grâce à toi, Petanque13 a approuvé pas moins de "}
        <strong>{aantal}</strong>
        {` tournoi${aantal === 1 ? "" : "s"} en ${jaar}. Grâce à des bénévoles comme toi, le calendrier reste fiable et à jour pour tous les joueurs de pétanque en Belgique.`}
      </Text>
      <Text style={tekstStijl}>{`Merci pour ton engagement, et à une aussi belle année ${jaar + 1} ! 🎉`}</Text>
    </EmailLayout>
  );
}

export function jaaroverzichtOnderwerp(jaar: number): string {
  return `Jouw ${jaar} in cijfers / Ton ${jaar} en chiffres`;
}
