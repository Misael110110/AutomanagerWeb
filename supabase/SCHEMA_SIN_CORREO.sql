-- ==============================================================================
-- AutoManager: Esquema Simplificado para Taller Mecánico (SIN CORREOS NI AUTH)
-- ==============================================================================
-- Ejecuta este script en Supabase:
-- 1. Ve a tu proyecto de Supabase (https://supabase.com/dashboard)
-- 2. Haz clic en "SQL Editor" en el menú lateral izquierdo
-- 3. Haz clic en "New query"
-- 4. Pega todo este código y haz clic en "Run" (botón verde)
-- ==============================================================================

-- 1. Tabla de Talleres / Negocios
create table if not exists public.workshop_businesses (
  code text primary key,
  name text not null,
  manager_name text not null,
  created_at timestamptz default now()
);

-- 2. Tabla de Usuarios / Perfiles del Taller (Encargados y Mecánicos)
create table if not exists public.workshop_profiles (
  id text primary key,
  business_code text not null references public.workshop_businesses(code) on delete cascade,
  name text not null,
  pin text not null,
  role text not null check (role in ('ENCARGADO', 'MECANICO')),
  created_at timestamptz default now()
);

-- 3. Tabla de Estado Completo del Taller (Órdenes, Vehículos, Inventario, Herramientas, Historial)
create table if not exists public.workshop_state (
  business_code text primary key references public.workshop_businesses(code) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 4. Habilitar permisos directos con la clave de acceso público (anon key)
alter table public.workshop_businesses enable row level security;
alter table public.workshop_profiles enable row level security;
alter table public.workshop_state enable row level security;

-- Políticas abiertas: cualquier cliente con la clave del proyecto puede leer y guardar
drop policy if exists "permitir_todo_negocios" on public.workshop_businesses;
create policy "permitir_todo_negocios" on public.workshop_businesses for all using (true) with check (true);

drop policy if exists "permitir_todo_perfiles" on public.workshop_profiles;
create policy "permitir_todo_perfiles" on public.workshop_profiles for all using (true) with check (true);

drop policy if exists "permitir_todo_estado" on public.workshop_state;
create policy "permitir_todo_estado" on public.workshop_state for all using (true) with check (true);

-- 5. Insertar datos iniciales por defecto (Taller Los Ángeles y usuarios demo)
insert into public.workshop_businesses (code, name, manager_name)
values ('ANGELES-4K7P', 'Los Ángeles Mecánica Automotriz', 'Ángel Martínez')
on conflict (code) do nothing;

insert into public.workshop_profiles (id, business_code, name, pin, role)
values 
  ('1', 'ANGELES-4K7P', 'Ángel Martínez', '1234', 'ENCARGADO'),
  ('2', 'ANGELES-4K7P', 'Carlos Méndez', '1234', 'MECANICO')
on conflict (id) do nothing;
