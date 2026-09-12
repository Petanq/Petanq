-- Zelfde als bij tornooien (zie de "Jouw naam"-aanpassing): ook bij een
-- nieuwe clubaanmelding willen we weten wie het indiende, niet enkel een
-- optioneel e-mailadres.
alter table clubs add column if not exists ingediend_door text;
