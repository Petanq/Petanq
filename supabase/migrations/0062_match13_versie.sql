-- Match13: versienummer per toernooi, zodat twee toestellen (bv. gsm en pc)
-- elkaars wijzigingen niet meer stilletjes overschrijven.
--
-- Bij elke opslag verhoogt de app het nummer met 1, en enkel als het nummer in
-- de database nog gelijk is aan het nummer waarvan het toestel vertrok. Is dat
-- niet zo, dan heeft intussen een ander toestel opgeslagen: de app voegt dan
-- beide wijzigingen samen (zie lib/match13/samenvoegen.ts) en slaat opnieuw op.
--
-- Veilig om vóór of na de nieuwe code uit te voeren: zolang de kolom ontbreekt,
-- slaat de app gewoon op zoals voorheen.

alter table match13_toernooien
  add column if not exists versie integer not null default 0;
