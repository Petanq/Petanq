import { Toernooi } from "./types";

const STANDAARD_DUUR_UUR = 4;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function tijdstippen(datum: string, uur: string, duurUur: number) {
  const [jaar, maand, dag] = datum.split("-").map(Number);
  const [h, m] = uur.split(":").map(Number);
  const start = new Date(jaar, maand - 1, dag, h, m);
  const eind = new Date(start.getTime() + duurUur * 60 * 60 * 1000);
  const fmt = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  return { start: fmt(start), eind: fmt(eind) };
}

function locatie(toernooi: Toernooi): string {
  return toernooi.adres ? `${toernooi.adres}, ${toernooi.gemeente}` : toernooi.gemeente;
}

export function googleAgendaLink(toernooi: Toernooi, naam: string): string {
  const { start, eind } = tijdstippen(toernooi.datum, toernooi.uur, STANDAARD_DUUR_UUR);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${naam} - ${toernooi.clubnaam}`,
    dates: `${start}/${eind}`,
    location: locatie(toernooi),
    ctz: "Europe/Brussels",
  });
  if (toernooi.opmerking) params.set("details", toernooi.opmerking);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcs(toernooi: Toernooi, naam: string): void {
  const { start, eind } = tijdstippen(toernooi.datum, toernooi.uur, STANDAARD_DUUR_UUR);
  const regels = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:${naam} - ${toernooi.clubnaam}`,
    `DTSTART:${start}`,
    `DTEND:${eind}`,
    `LOCATION:${locatie(toernooi)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([regels.join("\r\n")], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "toernooi.ics";
  a.click();
  URL.revokeObjectURL(url);
}
