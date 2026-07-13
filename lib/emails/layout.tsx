import { Body, Container, Head, Heading, Html, Img, Section, Text, Hr } from "@react-email/components";

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.petanq.be";

export function EmailLayout({
  titel,
  children,
}: {
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#F5F5F5", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 0" }}>
          <Section style={{ backgroundColor: "#1F1F1F", borderRadius: "10px 10px 0 0", padding: "20px 32px" }}>
            <table role="presentation" cellPadding={0} cellSpacing={0}>
              <tr>
                <td style={{ verticalAlign: "middle", paddingRight: "10px" }}>
                  <Img
                    src={`${siteUrl()}/images/logo-icon.png`}
                    width="32"
                    height="32"
                    alt="Petanque13"
                    style={{ borderRadius: "50%", display: "block" }}
                  />
                </td>
                <td style={{ verticalAlign: "middle" }}>
                  <Text style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700, margin: 0, letterSpacing: "0.02em" }}>
                    Petanque13
                  </Text>
                </td>
              </tr>
            </table>
          </Section>
          <Section style={{ backgroundColor: "#ffffff", borderRadius: "0 0 10px 10px", padding: "32px" }}>
            <Heading style={{ fontSize: "18px", color: "#1F1F1F", margin: "0 0 16px" }}>{titel}</Heading>
            {children}
            <Hr style={{ borderColor: "#e5e5e5", margin: "24px 0 16px" }} />
            <Text style={{ fontSize: "12px", color: "#555555", margin: 0 }}>
              Petanque13 — de centrale kalender voor petanquetoernooien in België.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const tekstStijl = { fontSize: "14px", color: "#334155", lineHeight: "1.6" };
export const knopStijl = {
  display: "inline-block",
  backgroundColor: "#D62828",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "10px",
  fontWeight: 700,
  fontSize: "14px",
  textDecoration: "none",
  marginTop: "8px",
};
