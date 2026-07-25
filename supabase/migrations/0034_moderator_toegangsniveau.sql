-- Vervangt de simpele mag_heel_belgie-vlag door een 3-niveau toegangsschaal:
-- eigen provincie (standaard) -> eigen regio (heel Vlaanderen, of heel
-- Wallonië inclusief Brussel) -> heel België. Brussel telt voor dit doeleinde
-- mee als Wallonië (zie lib/provincies.ts PROVINCIE_TOEGANGSREGIO) — enkel
-- voor deze goedkeuringsrechten, de algemene regio-indeling elders (bv.
-- statistieken) houdt Brussel nog steeds apart.
create type moderator_toegang_enum as enum ('eigen_provincie', 'eigen_regio', 'heel_belgie');

alter table moderatoren add column toegangsniveau moderator_toegang_enum not null default 'eigen_provincie';

update moderatoren set toegangsniveau = 'heel_belgie' where mag_heel_belgie = true;

alter table moderatoren drop column mag_heel_belgie;
