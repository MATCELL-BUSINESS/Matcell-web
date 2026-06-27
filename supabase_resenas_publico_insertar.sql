-- Permite que cualquier cliente (con o sin cuenta) envíe una reseña pública,
-- que siempre entra como pendiente de revisión por el admin.
create policy "resenas_publico_insertar" on resenas
for insert
to public
with check (estado = 'pendiente' and aprobada = false);
