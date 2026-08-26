alter table match13_gebruikers add column club text not null default '';

-- Bestaande rijen hadden enkel één naamveld, vaak eigenlijk al de clubnaam.
-- Zet die over als startpunt zodat er geen lege club-kolom verschijnt; kan
-- nadien per rij aangepast worden via de bewerk-knop.
update match13_gebruikers set club = naam where club = '';
