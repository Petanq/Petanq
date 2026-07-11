import { Resend } from "resend";

let client: Resend | null = null;

export function getResendClient(): Resend {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

export const AFZENDER = process.env.RESEND_AFZENDER ?? "Petanque13 <onboarding@resend.dev>";
