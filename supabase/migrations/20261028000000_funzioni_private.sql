-- Le funzioni di supporto non devono essere chiamabili dall'API REST (/rpc):
--  - is_guide_owner / is_guide_public servono solo alle policy RLS: le spostiamo
--    nello schema "private", non esposto da PostgREST (le policy continuano a
--    funzionare perché fanno riferimento alla funzione, non al suo nome);
--  - handle_new_user è solo un trigger;
--  - guide_stats resta chiamabile, ma solo dagli utenti loggati (controlla già
--    che la guida sia dell'host).
create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

alter function public.is_guide_owner(uuid) set schema private;
alter function public.is_guide_public(uuid) set schema private;

revoke execute on function private.is_guide_owner(uuid) from public;
revoke execute on function private.is_guide_public(uuid) from public;
grant execute on function private.is_guide_owner(uuid) to authenticated, service_role;
grant execute on function private.is_guide_public(uuid) to anon, authenticated, service_role;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

revoke execute on function public.guide_stats(uuid) from public, anon;
grant execute on function public.guide_stats(uuid) to authenticated;

-- guide_stats chiamava public.is_guide_owner: aggiorna il riferimento.
create or replace function public.guide_stats(p_guide_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if not private.is_guide_owner(p_guide_id) then
    raise exception 'Accesso negato';
  end if;

  select jsonb_build_object(
    'visite_totali', (select count(*) from public.views v where v.guide_id = p_guide_id and v.sezione is null),
    'visite_30_giorni', (select count(*) from public.views v
                          where v.guide_id = p_guide_id and v.sezione is null and v.data > now() - interval '30 days'),
    'sezioni', coalesce((
      select jsonb_agg(jsonb_build_object('sezione', s.sezione, 'visite', s.visite) order by s.visite desc)
      from (
        select v.sezione, count(*) as visite
        from public.views v
        where v.guide_id = p_guide_id and v.sezione is not null
        group by v.sezione
      ) s
    ), '[]'::jsonb),
    'per_giorno', coalesce((
      select jsonb_agg(jsonb_build_object('giorno', d.giorno, 'visite', d.visite) order by d.giorno)
      from (
        select date_trunc('day', v.data)::date as giorno, count(*) as visite
        from public.views v
        where v.guide_id = p_guide_id and v.sezione is null and v.data > now() - interval '30 days'
        group by 1
      ) d
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;
