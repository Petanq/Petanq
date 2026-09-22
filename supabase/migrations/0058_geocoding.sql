-- Coördinaten (lat/lng) per club en tornooi, zodat toekomstige functies zoals
-- "tornooien dichtbij mij" en een kaartweergave hierop kunnen bouwen. Meteen
-- ook een "geocoded_provincie": de provincie die uit het geocode-adres zelf
-- blijkt (via OpenStreetMap), los van wat er manueel werd ingevuld — zo kan
-- de automatische controle (2x/week) een verkeerd ingevulde provincie/
-- gemeente detecteren zonder dat iemand dat met de hand moet opsporen.
alter table clubs
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists geocoded_provincie text;

alter table toernooien
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists geocoded_provincie text;
