-- A producto_variantes le faltaba una policy pública de lectura (solo existía
-- la de admin "for all to authenticated"). Sin esto, el sitio público nunca
-- puede ver colores ni stock por variante, aunque los datos existan.
--
-- Igual que con producto_fotos, solo expone variantes de productos activos.

create policy "variantes_publicas" on producto_variantes
for select
to public
using (
  exists (
    select 1 from productos p
    where p.id = producto_variantes.producto_id
      and p.activo = true
  )
);
