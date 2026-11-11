-- Beveiliging, deel 2. DRAAI DIT PAS NADAT de nieuwe versie van de site online staat (de code die
-- via de server inzendt en enkel de openbare kolommen ophaalt), en NIET op een speeldag.
--
--  1. Persoonsgegevens verbergen: niet-ingelogde bezoekers mogen in "toernooien" en "clubs" niet langer
--     lezen wie iets indiende of goedkeurde (ingediend_door bevat e-mailadressen) en niets over
--     verwijderaanvragen. Ingelogde moderatoren zien nog alles.
--  2. De openbare schrijfrechten sluiten: iedereen kon met de openbare sleutel rechtstreeks inzenden in de
--     databank, buiten het formulier (en dus buiten de controles en grenzen) om. Voortaan loopt alles via de
--     server van de site.
--
-- TERUGDRAAIEN (als er iets misgaat) staat onderaan.

-- ── 1. Kolommen verbergen voor niet-ingelogde bezoekers ────────────────────────────────────────
revoke select on toernooien from anon;
grant select (
  id, aangemaakt_op, datum, uur, clubnaam, club_id, naam_nl, naam_fr, gemeente, adres, provincie, regio, categorie, formule,
  speelvorm, aantal_ronden, aantal_poules, inschrijvingsprijs, gratis, max_ploegen, vol, geannuleerd, open_toernooi, finale,
  affiche_url, contact_email, link_inschrijving, opmerking, kwalificatiedata, kwalificatie_uur, status, goedgekeurd_op,
  verwijderd_op, lat, lng, geocoded_provincie
) on toernooien to anon;

revoke select on clubs from anon;
grant select (
  id, naam, gemeente, provincie, regio, website, contact_email, aangemaakt_op, actief, adres, telefoon, openingsuren, foto_url,
  verwijderd_op, lat, lng, geocoded_provincie
) on clubs to anon;

-- ── 2. Openbaar rechtstreeks inzenden sluiten ────────────────────────────────────────────────────
drop policy if exists "toernooien_insert_publiek" on toernooien;
drop policy if exists "clubs_insert_publiek" on clubs;
drop policy if exists "match13_aanvragen_insert_publiek" on match13_aanvragen;
drop policy if exists "nieuwsbrief_insert_publiek" on nieuwsbrief;

-- Let op bij een NIEUWE kolom in toernooien of clubs: geef ze ook leesrecht voor bezoekers,
-- bv.  grant select (nieuwe_kolom) on toernooien to anon;   en voeg ze toe in lib/kolommen.ts.

/* ── TERUGDRAAIEN ──────────────────────────────────────────────────────────────────────────────
grant select on toernooien to anon;
grant select on clubs to anon;
create policy "toernooien_insert_publiek" on toernooien for insert to anon, authenticated with check (status = 'in_behandeling');
create policy "clubs_insert_publiek" on clubs for insert to anon, authenticated with check (actief = false);
create policy "match13_aanvragen_insert_publiek" on match13_aanvragen for insert to anon, authenticated with check (status = 'in_behandeling');
create policy "nieuwsbrief_insert_publiek" on nieuwsbrief for insert to anon, authenticated with check (true);
────────────────────────────────────────────────────────────────────────────────────────────────── */
