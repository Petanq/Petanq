-- Moderator/organisator kan een toernooi manueel als geannuleerd markeren,
-- zonder het te verwijderen — het blijft zichtbaar met een duidelijk label,
-- zodat bezoekers die het al kenden weten dat het niet doorgaat.
alter table toernooien add column geannuleerd boolean not null default false;
