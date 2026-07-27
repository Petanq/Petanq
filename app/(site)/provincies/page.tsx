import { redirect } from "next/navigation";

// De kaart van België staat sinds kort bovenaan de Clubs-pagina zelf i.p.v.
// op een aparte route — oude links naar /provincies blijven zo toch werken.
export default function ProvinciesPagina() {
  redirect("/clubs");
}
