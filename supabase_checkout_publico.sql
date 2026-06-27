-- El checkout público necesita poder crear pedidos, pero hasta ahora solo
-- existía la policy de admin ("for all to authenticated"). Sin esto, el sitio
-- público nunca podría insertar un pedido, sin importar el código del checkout.
--
-- Importante: esto es SOLO INSERT, nunca SELECT/UPDATE/DELETE para el rol
-- público — así nadie puede leer ni modificar pedidos ajenos desde el cliente.
-- La confirmación se muestra con los datos que el propio checkout ya tiene en
-- memoria (no se vuelve a leer desde la base con la clave pública).
--
-- El WITH CHECK fuerza que todo pedido nuevo nazca en un estado seguro
-- (pendiente de pago, recién confirmado) sin importar lo que el cliente envíe.

create policy "pedidos_publico_insertar" on pedidos
for insert
to public
with check (
  estado_pago = 'pendiente'
  and estado_pedido = 'confirmado'
);

create policy "pedido_items_publico_insertar" on pedido_items
for insert
to public
with check (true);
