-- =============================================================================
-- Schema iniziale: host, guide, sezioni, luoghi consigliati, pagamenti, visite.
-- Row Level Security: ogni host vede e modifica solo le proprie guide; le guide
-- pubblicate E pagate sono leggibili da chiunque (ospiti senza login).
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tipi enumerati
-- -----------------------------------------------------------------------------
create type public.stato_guida as enum ('bozza', 'pubblicata');

create type public.tipo_sezione as enum (
  'benvenuto',
  'arrivo',
  'wifi',
  'casa',
  'regole',
  'differenziata',
  'tassa',
  'parcheggio',
  'consigli',
  'emergenze',
  'checkout'
);

create type public.categoria_luogo as enum (
  'ristorante',
  'bar',
  'supermercato',
  'farmacia',
  'attrazione',
  'altro'
);

create type public.stato_pagamento as enum ('in_attesa', 'pagato', 'fallito', 'rimborsato');

-- -----------------------------------------------------------------------------
-- hosts: profilo dell'host, 1:1 con auth.users
-- -----------------------------------------------------------------------------
create table public.hosts (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  nome       text,
  telefono   text,
  creato_il  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- guides: una guida per appartamento
-- -----------------------------------------------------------------------------
create table public.guides (
  id              uuid primary key default gen_random_uuid(),
  host_id         uuid not null references public.hosts (id) on delete cascade,
  slug            text not null unique
                  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 80),
  nome_struttura  text not null check (char_length(nome_struttura) between 1 and 120),
  citta           text not null default '',
  stato           public.stato_guida not null default 'bozza',
  pagata          boolean not null default false,
  colore          text not null default '#C4572E' check (colore ~ '^#[0-9A-Fa-f]{6}$'),
  logo_url        text,
  cover_url       text,
  -- Lingue mostrate all'ospite. L'italiano è la lingua di partenza dell'host.
  lingue_attive   text[] not null default array['it']
                  check (lingue_attive <@ array['it','en','fr','de','es'] and 'it' = any (lingue_attive)),
  -- Contatto mostrato nei pulsanti rapidi (chiama / WhatsApp). Pubblico per
  -- scelta dell'host, per questo vive sulla guida e non nella tabella hosts.
  contatto_nome      text,
  contatto_telefono  text,
  contatto_whatsapp  text,
  creato_il       timestamptz not null default now(),
  aggiornato_il   timestamptz not null default now(),
  pubblicata_il   timestamptz
);

create index guides_host_id_idx on public.guides (host_id);

-- -----------------------------------------------------------------------------
-- sections: le sezioni della guida. `contenuto` è un JSON per lingua:
--   { "it": { ...campi... }, "en": { ... }, ... }
-- La forma dei campi dipende dal `tipo` (vedi src/types/guide.ts).
-- -----------------------------------------------------------------------------
create table public.sections (
  id         uuid primary key default gen_random_uuid(),
  guide_id   uuid not null references public.guides (id) on delete cascade,
  tipo       public.tipo_sezione not null,
  ordine     integer not null default 0,
  attiva     boolean not null default true,
  contenuto  jsonb not null default '{}'::jsonb check (jsonb_typeof(contenuto) = 'object'),
  unique (guide_id, tipo)
);

create index sections_guide_ordine_idx on public.sections (guide_id, ordine);

-- -----------------------------------------------------------------------------
-- places: consigli locali (ristoranti, bar, farmacie, ...)
-- -----------------------------------------------------------------------------
create table public.places (
  id           uuid primary key default gen_random_uuid(),
  guide_id     uuid not null references public.guides (id) on delete cascade,
  categoria    public.categoria_luogo not null default 'altro',
  nome         text not null,
  descrizione  jsonb not null default '{}'::jsonb check (jsonb_typeof(descrizione) = 'object'),
  maps_url     text,
  ordine       integer not null default 0
);

create index places_guide_idx on public.places (guide_id, ordine);

-- -----------------------------------------------------------------------------
-- payments: una riga per sessione Stripe Checkout. Scritta solo dal server
-- (service role) tramite il webhook Stripe.
-- -----------------------------------------------------------------------------
create table public.payments (
  id                 uuid primary key default gen_random_uuid(),
  guide_id           uuid not null references public.guides (id) on delete cascade,
  stripe_session_id  text not null unique,
  importo            integer not null check (importo >= 0), -- in centesimi di euro
  stato              public.stato_pagamento not null default 'in_attesa',
  creato_il          timestamptz not null default now()
);

create index payments_guide_idx on public.payments (guide_id);

-- -----------------------------------------------------------------------------
-- views: visite alla guida. `sezione` null = apertura della guida.
-- -----------------------------------------------------------------------------
create table public.views (
  id        bigint generated always as identity primary key,
  guide_id  uuid not null references public.guides (id) on delete cascade,
  sezione   public.tipo_sezione,
  data      timestamptz not null default now()
);

create index views_guide_data_idx on public.views (guide_id, data desc);

-- =============================================================================
-- Funzioni di supporto
-- =============================================================================

-- La guida appartiene all'utente autenticato?
create or replace function public.is_guide_owner(p_guide_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.guides g
    where g.id = p_guide_id and g.host_id = (select auth.uid())
  );
$$;

-- La guida è visibile al pubblico (pubblicata e pagata)?
create or replace function public.is_guide_public(p_guide_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.guides g
    where g.id = p_guide_id and g.stato = 'pubblicata' and g.pagata
  );
$$;

-- Crea automaticamente il profilo host alla registrazione (email o Google).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.hosts (id, email, nome)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'nome', new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Protegge i campi legati al pagamento: solo il service role (webhook Stripe)
-- può segnare una guida come pagata. Un host può pubblicare/ritirare una guida
-- solo se è già stata pagata.
create or replace function public.protect_guide_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  is_service boolean := coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
                        or coalesce((current_setting('request.jwt.claims', true)::jsonb ->> 'role'), '') = 'service_role'
                        or current_user in ('postgres', 'supabase_admin', 'service_role');
begin
  if not is_service then
    if tg_op = 'INSERT' then
      new.pagata := false;
      new.stato := 'bozza';
      new.pubblicata_il := null;
    else
      new.pagata := old.pagata;
      new.host_id := old.host_id;
      if new.stato = 'pubblicata' and not new.pagata then
        new.stato := old.stato;
      end if;
    end if;
  end if;

  if new.stato = 'pubblicata' and new.pubblicata_il is null then
    new.pubblicata_il := now();
  end if;
  new.aggiornato_il := now();
  return new;
end;
$$;

create trigger guides_protect_fields
  before insert or update on public.guides
  for each row execute function public.protect_guide_fields();

-- Statistiche: visite totali, ultimi 30 giorni e sezioni più consultate.
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
  if not public.is_guide_owner(p_guide_id) then
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

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.hosts    enable row level security;
alter table public.guides   enable row level security;
alter table public.sections enable row level security;
alter table public.places   enable row level security;
alter table public.payments enable row level security;
alter table public.views    enable row level security;

-- hosts: solo il proprio profilo
create policy "host legge il proprio profilo" on public.hosts
  for select to authenticated using (id = (select auth.uid()));
create policy "host aggiorna il proprio profilo" on public.hosts
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- guides
create policy "host gestisce le proprie guide" on public.guides
  for all to authenticated
  using (host_id = (select auth.uid()))
  with check (host_id = (select auth.uid()));
create policy "guide pubblicate e pagate sono pubbliche" on public.guides
  for select to anon, authenticated
  using (stato = 'pubblicata' and pagata);

-- sections
create policy "host gestisce le sezioni delle proprie guide" on public.sections
  for all to authenticated
  using (public.is_guide_owner(guide_id))
  with check (public.is_guide_owner(guide_id));
create policy "sezioni attive delle guide pubbliche" on public.sections
  for select to anon, authenticated
  using (attiva and public.is_guide_public(guide_id));

-- places
create policy "host gestisce i luoghi delle proprie guide" on public.places
  for all to authenticated
  using (public.is_guide_owner(guide_id))
  with check (public.is_guide_owner(guide_id));
create policy "luoghi delle guide pubbliche" on public.places
  for select to anon, authenticated
  using (public.is_guide_public(guide_id));

-- payments: l'host legge i pagamenti delle proprie guide; scrive solo il server
create policy "host legge i pagamenti delle proprie guide" on public.payments
  for select to authenticated
  using (public.is_guide_owner(guide_id));

-- views: chiunque può registrare una visita a una guida pubblica; l'host le legge
create policy "visite su guide pubbliche" on public.views
  for insert to anon, authenticated
  with check (public.is_guide_public(guide_id));
create policy "host legge le visite delle proprie guide" on public.views
  for select to authenticated
  using (public.is_guide_owner(guide_id));

-- =============================================================================
-- Storage: bucket pubblico per foto di copertina, loghi e foto delle istruzioni.
-- Ogni host scrive solo nella cartella col proprio id: <host_id>/<file>
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('guide-media', 'guide-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "media leggibili da tutti" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'guide-media');
create policy "host carica nella propria cartella" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'guide-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "host aggiorna i propri file" on storage.objects
  for update to authenticated
  using (bucket_id = 'guide-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "host elimina i propri file" on storage.objects
  for delete to authenticated
  using (bucket_id = 'guide-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Permessi sulle funzioni
revoke execute on function public.guide_stats(uuid) from anon;
grant execute on function public.guide_stats(uuid) to authenticated;
