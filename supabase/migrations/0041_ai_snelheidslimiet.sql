-- Houdt bij hoe vaak elk IP-adres de AI-affichelezer (betaalde Anthropic-aanroep)
-- gebruikt heeft, zodat een script dat de knop spamt niet onbeperkt kosten kan
-- veroorzaken. Enkel bereikbaar via de service-role key (server-side), dus geen
-- publieke RLS-policies nodig.
create table ai_afbeelding_pogingen (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  aangemaakt_op timestamptz not null default now()
);

create index ai_afbeelding_pogingen_ip_tijd_idx on ai_afbeelding_pogingen (ip, aangemaakt_op);

alter table ai_afbeelding_pogingen enable row level security;
