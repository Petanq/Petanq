-- Optionele lijst van kwalificatiedata voor tornooien met een schiftingensysteem
-- (meerdere data om je te kwalificeren, die samen naar 1 finale leiden). De
-- hoofddatum ("datum") blijft de belangrijkste/finale datum die op de kalender
-- verschijnt; dit veld is puur extra info op de detailpagina van dat tornooi.
alter table toernooien add column if not exists kwalificatiedata date[] null;
