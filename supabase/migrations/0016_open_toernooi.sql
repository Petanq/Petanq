-- PetanQ - markering voor "open" toernooien die niet door een officiele,
-- gelicentieerde club georganiseerd worden (vrije/losse toernooien).
alter table toernooien add column open_toernooi boolean not null default false;
