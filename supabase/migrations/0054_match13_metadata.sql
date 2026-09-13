-- Extra beheer-metadata voor Match13-tornooien: zodat de eigenaar in zijn
-- overzichtslijst kan bijhouden welke tornooien testjes zijn, welke al
-- afgewerkt zijn, en wie het organiseert — zonder daarvoor elk tornooi te
-- moeten openen.
alter table match13_toernooien
  add column if not exists is_test boolean not null default false,
  add column if not exists afgewerkt boolean not null default false,
  add column if not exists organisator text;
