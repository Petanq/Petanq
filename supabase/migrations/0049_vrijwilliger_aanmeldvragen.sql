-- Extra vragen bij het zelf-aanmelden als vrijwilliger, zodat een admin een
-- aanvraag kan beoordelen op geschiktheid/meerwaarde vóór goedkeuring. Enkel
-- ingevuld bij zelf-aanmelden (niet bij een admin-uitnodiging), dus nullable.
alter table moderatoren add column aanmeld_motivatie text null;
alter table moderatoren add column aanmeld_club text null;
alter table moderatoren add column aanmeld_tijd text null;
alter table moderatoren add column aanmeld_regiokennis text null;
