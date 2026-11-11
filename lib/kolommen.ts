// De kolommen die een gewone bezoeker (niet ingelogd) uit de databank mag lezen.
//
// Bewust NIET openbaar: wie een tornooi indiende of goedkeurde (ingediend_door bevat vaak een e-mailadres,
// goedgekeurd_door de naam van een moderator) en alles over verwijderaanvragen. Met SQL 0070 geeft de
// databank aan niet-ingelogde bezoekers enkel nog leesrecht op precies deze kolommen.
//
// BELANGRIJK bij een nieuwe kolom in "toernooien" of "clubs": voeg ze hier toe én geef ze leesrecht
// (grant select (kolom) on ... to anon), anders zien bezoekers ze niet en geeft de pagina een fout.
// Ingelogde moderatoren lezen nog steeds alle kolommen ("select *" in de beheerschermen).

export const TOERNOOI_PUBLIEK =
  "id, aangemaakt_op, datum, uur, clubnaam, club_id, naam_nl, naam_fr, gemeente, adres, provincie, regio, categorie, formule, " +
  "speelvorm, aantal_ronden, aantal_poules, inschrijvingsprijs, gratis, max_ploegen, vol, geannuleerd, open_toernooi, finale, " +
  "affiche_url, contact_email, link_inschrijving, opmerking, kwalificatiedata, kwalificatie_uur, status, goedgekeurd_op, " +
  "verwijderd_op, lat, lng, geocoded_provincie";

export const CLUB_PUBLIEK =
  "id, naam, gemeente, provincie, regio, website, contact_email, aangemaakt_op, actief, adres, telefoon, openingsuren, foto_url, " +
  "verwijderd_op, lat, lng, geocoded_provincie";

export const TOERNOOI_PUBLIEKE_KOLOMLIJST = TOERNOOI_PUBLIEK.split(", ");
export const CLUB_PUBLIEKE_KOLOMLIJST = CLUB_PUBLIEK.split(", ");
