-- Geplande datum per Match13-tornooi: zodat het overzicht "Gepland" /
-- "Lopende tornooien" / "Afgewerkt" kan indelen i.p.v. één platte lijst.
alter table match13_toernooien
  add column if not exists geplande_datum date;
