-- De bestaande unieke index (0022) vergelijkt enkel exacte naamtekst, en
-- mist daardoor dubbele inzendingen met een lichtjes andere bewoording
-- (typo, ander lidwoord, ...). Als backstop tegen gelijktijdige dubbele
-- inzendingen (de eigenlijke controle gebeurt in actions/toernooien.ts)
-- voegen we een tweede unieke index toe op de structurele velden, enkel
-- voor tornooien met een gekoppelde club (club_id): zelfde club, datum,
-- categorie, formule, speelvorm en rondes/poules kan dan niet meer dubbel,
-- tenzij het vorige exemplaar geweigerd of verwijderd is.
--
-- Categorie "circuit" is bewust uitgesloten: circuit-tornooien (bv.
-- Zomercircuit 50+) draaien vaak een aparte Dames- en Herenreeks die verder
-- exact dezelfde club/datum/formule/rondes delen — enkel het volgnummer in
-- de naam (bv. "- 27 (Heren)" vs "- 28 (Dames)") maakt het verschil, en dat
-- zit niet in een apart veld. Voor die categorie blijft enkel de
-- exacte-naam-index (0022) als vangnet gelden.
create unique index if not exists toernooien_uniek_structureel
  on toernooien (club_id, datum, categorie, formule, speelvorm, coalesce(aantal_ronden, -1), coalesce(aantal_poules, -1))
  where club_id is not null and status <> 'geweigerd' and verwijderd_op is null and categorie <> 'circuit';
