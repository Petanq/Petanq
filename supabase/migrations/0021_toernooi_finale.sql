-- Qpetanque - sommige toernooien spelen minder rondes maar sluiten af met een
-- finale tussen de beste ploegen (bv. 4 rondes + finale).
alter table toernooien add column finale boolean not null default false;
