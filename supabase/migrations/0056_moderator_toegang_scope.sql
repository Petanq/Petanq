-- Vervangt het relatieve 3-niveau systeem (eigen_provincie/eigen_regio/
-- heel_belgie, afhankelijk van waar de moderator zelf woont) door een
-- rechtstreeks te kiezen toegangsgebied, los van hun eigen provincie: een
-- specifieke provincie ("oost-vlaanderen"), een regio ("vlaanderen" /
-- "wallonie", Brussel telt bij "wallonie" zoals voorheen), of "heel_belgie".
alter table moderatoren add column toegang_scope text default 'heel_belgie';

update moderatoren
set toegang_scope = case
  when toegangsniveau = 'heel_belgie' then 'heel_belgie'
  when toegangsniveau = 'eigen_regio' and provincie in
    ('antwerpen', 'oost-vlaanderen', 'west-vlaanderen', 'limburg', 'vlaams-brabant') then 'vlaanderen'
  when toegangsniveau = 'eigen_regio' then 'wallonie'
  when provincie is not null then provincie
  -- Een moderator zonder provincie en zonder regio-niveau had voorheen
  -- feitelijk NERGENS toegang toe (heeftToegangTotProvincie gaf altijd
  -- false terug). Dat "niets"-geval bestaat niet meer in het nieuwe model
  -- (een scope geeft altijd ergens toegang toe) — dit zet zo iemand op
  -- "heel_belgie" zodat er zeker geen moderator per ongeluk volledig
  -- vergrendeld blijft. Controleer na deze migratie of dit geval zich
  -- voordeed (in de praktijk had elke moderator al een provincie).
  else 'heel_belgie'
end;

alter table moderatoren alter column toegang_scope set not null;
alter table moderatoren drop column toegangsniveau;
drop type if exists moderator_toegang_enum;
