-- Koppelt Match13's (vrije-tekst) club aan de echte, publieke clubs-tabel.
-- Voorheen typte je bij het uitnodigen zelf een clubnaam in, zonder enige
-- link naar de bestaande clubdirectory — vandaar dat "Pc Alosta" (Match13)
-- en "KPC Alosta" (de echte club) nooit als dezelfde club herkend werden.
-- Vanaf nu kies je bij het uitnodigen uit de bestaande clublijst, en leggen
-- we die koppeling vast.
alter table match13_gebruikers add column club_id uuid references clubs (id);

-- Best-effort backfill voor bestaande rijen: enkel exacte (hoofdletter- en
-- spatie-ongevoelige) naamovereenkomsten worden automatisch gekoppeld. De
-- rest (zoals "Pc Alosta" vs "KPC Alosta") moet je zelf even opnieuw
-- kiezen via "bewerken".
update match13_gebruikers g
set club_id = c.id
from clubs c
where g.club_id is null and lower(trim(g.club)) = lower(trim(c.naam));
