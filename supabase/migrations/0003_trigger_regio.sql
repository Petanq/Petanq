-- Le Bouliste.be - regio wordt altijd afgeleid van provincie.
-- Voorkomt inconsistente data (bv. provincie=luik met regio=vlaanderen)
-- ongeacht wat de client meestuurt.

create or replace function set_regio_from_provincie()
returns trigger
language plpgsql
as $$
begin
  new.regio := case new.provincie
    when 'antwerpen' then 'vlaanderen'
    when 'oost-vlaanderen' then 'vlaanderen'
    when 'west-vlaanderen' then 'vlaanderen'
    when 'limburg' then 'vlaanderen'
    when 'vlaams-brabant' then 'vlaanderen'
    when 'henegouwen' then 'wallonie'
    when 'luik' then 'wallonie'
    when 'namen' then 'wallonie'
    when 'waals-brabant' then 'wallonie'
    when 'luxemburg' then 'wallonie'
    when 'brussel' then 'brussel'
  end::regio_enum;
  return new;
end;
$$;

create trigger trg_toernooien_regio
  before insert or update of provincie on toernooien
  for each row execute function set_regio_from_provincie();

create trigger trg_clubs_regio
  before insert or update of provincie on clubs
  for each row execute function set_regio_from_provincie();
