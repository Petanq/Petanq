create table if not exists korte_links (
  code text primary key,
  doel_link text not null,
  aangemaakt_op timestamptz not null default now(),
  vervalt_op timestamptz not null
);

alter table korte_links enable row level security;
