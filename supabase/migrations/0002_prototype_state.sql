-- Persistencia compartida del prototipo por negocio.
-- Ejecutar una sola vez en Supabase > SQL Editor después de 0001_initial_schema.sql.

create table if not exists public.prototype_state (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists prototype_state_updated on public.prototype_state;
create trigger prototype_state_updated
before update on public.prototype_state
for each row execute function public.set_updated_at();

alter table public.prototype_state enable row level security;

drop policy if exists "members read prototype state" on public.prototype_state;
create policy "members read prototype state"
on public.prototype_state for select
using (public.is_business_member(business_id));

drop policy if exists "members create prototype state" on public.prototype_state;
create policy "members create prototype state"
on public.prototype_state for insert
with check (public.is_business_member(business_id) and updated_by = auth.uid());

drop policy if exists "members update prototype state" on public.prototype_state;
create policy "members update prototype state"
on public.prototype_state for update
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id) and updated_by = auth.uid());

comment on table public.prototype_state is 'Estado persistente temporal del prototipo. Se reemplazará gradualmente por escrituras en las tablas normalizadas.';
