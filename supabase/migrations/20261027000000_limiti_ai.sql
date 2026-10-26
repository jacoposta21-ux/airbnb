-- Registro delle richieste all'AI (generazione e traduzione), per limitare
-- l'uso giornaliero di ogni host e tenere sotto controllo i costi.
create table public.ai_richieste (
  id         bigint generated always as identity primary key,
  host_id    uuid not null references public.hosts (id) on delete cascade,
  tipo       text not null check (tipo in ('generazione', 'traduzione')),
  creato_il  timestamptz not null default now()
);

create index ai_richieste_host_data_idx on public.ai_richieste (host_id, creato_il desc);

alter table public.ai_richieste enable row level security;

create policy "host registra le proprie richieste AI" on public.ai_richieste
  for insert to authenticated with check (host_id = (select auth.uid()));
create policy "host legge le proprie richieste AI" on public.ai_richieste
  for select to authenticated using (host_id = (select auth.uid()));
