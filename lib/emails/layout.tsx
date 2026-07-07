import { Body, Container, Head, Heading, Html, Section, Text, Hr } from "@react-email/components";

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
      <Body style={{ backgroundColor: "#f4f6fa", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 0" }}>
          <Section style={{ backgroundColor: "#0b1f3a", borderRadius: "10px 10px 0 0", padding: "24px 32px" }}>
            <Text style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700, margin: 0, letterSpacing: "0.02em" }}>
              Le Bouliste<span style={{ color: "#f0b429" }}>.be</span>
            </Text>
          </Section>
          <Section style={{ backgroundColor: "#ffffff", borderRadius: "0 0 10px 10px", padding: "32px" }}>
            <Heading style={{ fontSize: "18px", color: "#0b1220", margin: "0 0 16px" }}>{titel}</Heading>
            {children}
            <Hr style={{ borderColor: "#e2e8f0", margin: "24px 0 16px" }} />
            <Text style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
              Le Bouliste.be — de centrale kalender voor petanquetoernooien in België.
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
  backgroundColor: "#c0392b",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "8px",
  fontWeight: 700,
  fontSize: "14px",
  textDecoration: "none",
  marginTop: "8px",
};
