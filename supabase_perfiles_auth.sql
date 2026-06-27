-- Cuentas de cliente para el sitio público, usando Supabase Auth.
-- El login/registro es siempre opcional: el checkout sigue funcionando
-- 100% como invitado si el usuario no tiene sesión.

create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  telefono text,
  direccion text,
  departamento text,
  ciudad text,
  creado_en timestamptz not null default now()
);

alter table perfiles enable row level security;

create policy "perfiles_propio_select" on perfiles
for select
to authenticated
using (auth.uid() = id);

create policy "perfiles_propio_update" on perfiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- security definer: corre con privilegios elevados para poder insertar en
-- perfiles aunque el usuario recién creado todavía no tenga permisos propios.
create or replace function crear_perfil_nuevo_usuario()
returns trigger as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, new.raw_user_meta_data ->> 'nombre');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_crear_perfil_nuevo_usuario
after insert on auth.users
for each row execute function crear_perfil_nuevo_usuario();
