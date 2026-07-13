alter table moderatoren add column if not exists goedgekeurd boolean not null default false;

-- Bestaande vrijwilligers (via de oude uitnodigingslink) zijn al aanvaard.
update moderatoren set goedgekeurd = true;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from moderatoren where user_id = auth.uid() and rol = 'admin' and goedgekeurd = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_moderator()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from moderatoren where user_id = auth.uid() and goedgekeurd = true
  );
$function$;
