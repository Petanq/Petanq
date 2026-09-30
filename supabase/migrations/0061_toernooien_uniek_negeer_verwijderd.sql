-- De unieke index uit 0022 hield geen rekening met verwijderde toernooien:
-- een toernooi dat hernoemd en daarna verwijderd werd, bleef die naam+datum+
-- club toch nog "bezet" houden, waardoor een latere, volledig legitieme
-- nieuwe inzending met dezelfde combinatie werd geweigerd als "dubbel" —
-- zichtbaar voor de indiener als een onduidelijke algemene foutmelding.
-- De structurele index uit 0057 sluit verwijderde toernooien wel al uit
-- (where verwijderd_op is null); deze migratie trekt dat gelijk.
drop index if exists toernooien_uniek;
create unique index if not exists toernooien_uniek
  on toernooien (lower(clubnaam), datum, lower(naam_nl))
  where verwijderd_op is null;
