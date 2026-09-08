-- Koppelt tornooien aan de echte clubs-tabel, zelfde aanpak als eerder bij
-- Match13 (0050_match13_club_koppeling.sql). Voorheen typte je bij het
-- aanmelden zelf een clubnaam in, zonder koppeling naar de bestaande
-- clubdirectory — vandaar dat "PC De Evers", "PK De Evers" en "pc de evers"
-- nooit als dezelfde club herkend werden en er dubbels ontstonden.
alter table toernooien add column club_id uuid references clubs (id);

-- Best-effort backfill voor bestaande rijen: enkel exacte (hoofdletter- en
-- spatie-ongevoelige) naamovereenkomsten worden automatisch gekoppeld. De
-- rest (zoals de PC/PK-varianten) blijft ongekoppeld — dat is geen probleem,
-- clubnaam blijft gewoon staan zoals het was.
update toernooien t
set club_id = c.id
from clubs c
where t.club_id is null and lower(trim(t.clubnaam)) = lower(trim(c.naam));
