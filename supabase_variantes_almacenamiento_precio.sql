-- Extiende producto_variantes para que el almacenamiento (GB) funcione como
-- variante seleccionable (igual que el color), con precio propio opcional.
-- Si precio es null, la ficha usa el precio base de productos.

alter table producto_variantes add column almacenamiento text;
alter table producto_variantes add column precio numeric;

-- Permite asociar cada foto a un color específico. Si color es null, es una
-- foto "general" que se muestra por defecto cuando no hay fotos para el
-- color actualmente seleccionado en la ficha.
alter table producto_fotos add column color text;
