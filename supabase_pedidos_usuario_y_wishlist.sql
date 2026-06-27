-- Vincula pedidos a un usuario autenticado (opcional: queda null si el
-- cliente compró como invitado).

alter table pedidos add column usuario_id uuid references auth.users(id);

-- El checkout público sigue insertando sin sesión (usuario_id null), pero si
-- hay sesión activa, el id debe coincidir con el propio usuario autenticado
-- (nunca se puede insertar un pedido a nombre de otra persona).
drop policy "pedidos_publico_insertar" on pedidos;

create policy "pedidos_publico_insertar" on pedidos
for insert
to public
with check (
  estado_pago = 'pendiente'
  and estado_pedido = 'confirmado'
  and (usuario_id is null or usuario_id = auth.uid())
);

-- "Mis pedidos": cada usuario autenticado solo puede leer sus propios pedidos.
create policy "pedidos_propio_select" on pedidos
for select
to authenticated
using (auth.uid() = usuario_id);

create policy "pedido_items_propio_select" on pedido_items
for select
to authenticated
using (
  exists (
    select 1 from pedidos p
    where p.id = pedido_items.pedido_id
      and p.usuario_id = auth.uid()
  )
);

-- Lista de deseos: cada usuario gestiona únicamente sus propios ítems.
create table lista_deseos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  producto_id uuid not null references productos(id) on delete cascade,
  creado_en timestamptz not null default now(),
  unique (usuario_id, producto_id)
);

alter table lista_deseos enable row level security;

create policy "lista_deseos_propia_select" on lista_deseos
for select
to authenticated
using (auth.uid() = usuario_id);

create policy "lista_deseos_propia_insertar" on lista_deseos
for insert
to authenticated
with check (auth.uid() = usuario_id);

create policy "lista_deseos_propia_eliminar" on lista_deseos
for delete
to authenticated
using (auth.uid() = usuario_id);
