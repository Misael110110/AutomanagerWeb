-- AutoManager: esquema inicial de producción para Supabase/PostgreSQL.
-- Ejecutar una sola vez en SQL Editor o mediante Supabase CLI después de crear el proyecto.

create extension if not exists pgcrypto;

create type public.member_role as enum ('ENCARGADO', 'MECANICO');
create type public.member_status as enum ('ACTIVO', 'INACTIVO');
create type public.order_status as enum ('RECIBIDA', 'DIAGNOSTICO', 'PLANIFICADA', 'EN_PROCESO', 'ESPERANDO_REPUESTO', 'EN_REVISION', 'LISTA', 'ENTREGADA', 'CANCELADA');
create type public.task_status as enum ('PENDIENTE', 'ASIGNADA', 'EN_PROCESO', 'PAUSADA', 'COMPLETADA');
create type public.priority_level as enum ('ALTA', 'NORMAL', 'BAJA');
create type public.tool_status as enum ('DISPONIBLE', 'ASIGNADA', 'MANTENIMIENTO');
create type public.movement_type as enum ('ENTRADA', 'SALIDA', 'AJUSTE');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) >= 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  join_code text not null unique,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'MECANICO',
  status public.member_status not null default 'ACTIVO',
  joined_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  unique (business_id, full_name, phone)
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  plate text not null,
  brand text not null,
  model text not null,
  year smallint check (year between 1900 and 2100),
  mileage integer check (mileage >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, plate)
);

create table public.work_orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  code text not null,
  reported_problem text not null,
  diagnosis text,
  status public.order_status not null default 'RECIBIDA',
  priority public.priority_level not null default 'NORMAL',
  due_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, code)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  title text not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  status public.task_status not null default 'PENDIENTE',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  code text,
  stock numeric(12,2) not null default 0 check (stock >= 0),
  minimum_stock numeric(12,2) not null default 0 check (minimum_stock >= 0),
  unit text not null default 'unidad',
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, code)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  work_order_id uuid references public.work_orders(id) on delete set null,
  kind public.movement_type not null,
  quantity numeric(12,2) not null check (quantity > 0),
  note text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.tools (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  code text,
  location text,
  status public.tool_status not null default 'DISPONIBLE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, code)
);

create table public.tool_loans (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.tools(id) on delete restrict,
  work_order_id uuid references public.work_orders(id) on delete set null,
  borrower_id uuid not null references public.profiles(id) on delete restrict,
  returned_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace function public.set_join_code() returns trigger language plpgsql as $$
begin
  if new.join_code is null or trim(new.join_code) = '' then
    new.join_code := 'AUTO-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  end if;
  new.join_code := upper(trim(new.join_code));
  return new;
end;
$$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)));
  return new;
end;
$$;

create or replace function public.add_business_owner() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.memberships (business_id, user_id, role) values (new.id, new.owner_id, 'ENCARGADO');
  return new;
end;
$$;

create or replace function public.is_business_member(target_business uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships where business_id = target_business and user_id = auth.uid() and status = 'ACTIVO');
$$;

create or replace function public.is_business_manager(target_business uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships where business_id = target_business and user_id = auth.uid() and role = 'ENCARGADO' and status = 'ACTIVO');
$$;

create or replace function public.join_business_by_code(code text, requested_role public.member_role default 'MECANICO') returns public.memberships language plpgsql security definer set search_path = public as $$
declare target public.businesses; membership public.memberships;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión.'; end if;
  select * into target from public.businesses where join_code = upper(trim(code));
  if target.id is null then raise exception 'Código de negocio inválido.'; end if;
  insert into public.memberships (business_id, user_id, role)
  values (target.id, auth.uid(), requested_role)
  on conflict (business_id, user_id) do update set status = 'ACTIVO'
  returning * into membership;
  return membership;
end;
$$;

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger businesses_code before insert or update of join_code on public.businesses for each row execute function public.set_join_code();
create trigger businesses_updated before update on public.businesses for each row execute function public.set_updated_at();
create trigger vehicles_updated before update on public.vehicles for each row execute function public.set_updated_at();
create trigger orders_updated before update on public.work_orders for each row execute function public.set_updated_at();
create trigger tasks_updated before update on public.tasks for each row execute function public.set_updated_at();
create trigger inventory_updated before update on public.inventory_items for each row execute function public.set_updated_at();
create trigger tools_updated before update on public.tools for each row execute function public.set_updated_at();
create trigger auth_user_profile after insert on auth.users for each row execute function public.handle_new_user();
create trigger business_owner_membership after insert on public.businesses for each row execute function public.add_business_owner();

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.memberships enable row level security;
alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.work_orders enable row level security;
alter table public.tasks enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.tools enable row level security;
alter table public.tool_loans enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles visible to self or colleagues" on public.profiles for select using (id = auth.uid() or exists (select 1 from public.memberships mine join public.memberships theirs on mine.business_id = theirs.business_id where mine.user_id = auth.uid() and theirs.user_id = profiles.id));
create policy "profiles update self" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "members read business" on public.businesses for select using (public.is_business_member(id));
create policy "user creates owned business" on public.businesses for insert with check (owner_id = auth.uid());
create policy "manager updates business" on public.businesses for update using (public.is_business_manager(id));
create policy "members read memberships" on public.memberships for select using (public.is_business_member(business_id));
create policy "manager manages memberships" on public.memberships for all using (public.is_business_manager(business_id)) with check (public.is_business_manager(business_id));

create policy "members manage customers" on public.customers for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "members manage vehicles" on public.vehicles for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "members read orders" on public.work_orders for select using (public.is_business_member(business_id));
create policy "managers manage orders" on public.work_orders for all using (public.is_business_manager(business_id)) with check (public.is_business_manager(business_id));
create policy "members read tasks" on public.tasks for select using (exists (select 1 from public.work_orders o where o.id = work_order_id and public.is_business_member(o.business_id)));
create policy "managers manage tasks" on public.tasks for all using (exists (select 1 from public.work_orders o where o.id = work_order_id and public.is_business_manager(o.business_id))) with check (exists (select 1 from public.work_orders o where o.id = work_order_id and public.is_business_manager(o.business_id)));
create policy "members manage inventory" on public.inventory_items for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "members manage movements" on public.inventory_movements for all using (exists (select 1 from public.inventory_items i where i.id = inventory_item_id and public.is_business_member(i.business_id))) with check (exists (select 1 from public.inventory_items i where i.id = inventory_item_id and public.is_business_member(i.business_id)));
create policy "members manage tools" on public.tools for all using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "members manage tool loans" on public.tool_loans for all using (exists (select 1 from public.tools t where t.id = tool_id and public.is_business_member(t.business_id))) with check (exists (select 1 from public.tools t where t.id = tool_id and public.is_business_member(t.business_id)));
create policy "members read audit" on public.audit_events for select using (public.is_business_member(business_id));
create policy "members insert audit" on public.audit_events for insert with check (public.is_business_member(business_id) and actor_id = auth.uid());

create index vehicles_business_plate_idx on public.vehicles (business_id, plate);
create index orders_business_status_idx on public.work_orders (business_id, status, created_at desc);
create index tasks_order_idx on public.tasks (work_order_id, status);
create index inventory_business_idx on public.inventory_items (business_id);
create index audit_business_created_idx on public.audit_events (business_id, created_at desc);
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
