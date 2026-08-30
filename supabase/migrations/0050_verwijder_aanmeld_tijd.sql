-- Vraag 3 ("hoeveel tijd per maand") bleek toch niet gewenst, meteen na het
-- toevoegen van migratie 0049 — nog vóór er echte aanmeldingen mee waren.
alter table moderatoren drop column aanmeld_tijd;
