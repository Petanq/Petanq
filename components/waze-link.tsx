import { wazeUrl } from "@/lib/locatie";

export function WazeLink({ adres, gemeente }: { adres: string | null; gemeente: string }) {
  return (
    <a
      href={wazeUrl(adres, gemeente)}
      target="_blank"
      rel="noopener noreferrer"
      title="Waze"
      aria-label="Waze"
      className="inline-block align-middle"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/waze-icon.jpg" alt="Waze" className="inline-block h-4 w-4 rounded-full align-middle" />
    </a>
  );
}
