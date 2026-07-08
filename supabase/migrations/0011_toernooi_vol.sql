-- PetanQ - "vol" veld: moderator/organisator kan een toernooi manueel als
-- volzet markeren (geen automatische telling van inschrijvingen aanwezig).
alter table toernooien add column vol boolean not null default false;
