import { supabase } from './supabaseClient'

export async function getTiendaConfig() {
  const { data, error } = await supabase
    .from('tienda_config')
    .select(
      'nombre_tienda, whatsapp, instagram_url, facebook_url, tiktok_url, descripcion_footer, mensaje_barra_superior'
    )
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getCategoriasActivas() {
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nombre, slug, activa, orden')
    .eq('activa', true)
    .order('orden', { ascending: true })

  if (error) throw error
  return data
}

// Si las variantes de un producto tienen precios distintos entre sí, el
// catálogo/home debe mostrar "Desde $[el más bajo]" en vez de un precio fijo.
function conPrecioDesde(producto) {
  const preciosEfectivos = (producto.producto_variantes ?? []).map(
    (v) => v.precio ?? producto.precio
  )
  const distintos = new Set(preciosEfectivos)

  return {
    ...producto,
    precioDesde: distintos.size > 1 ? Math.min(...preciosEfectivos) : null,
  }
}

export async function getProductosDestacados(limit = 8) {
  const { data, error } = await supabase
    .from('productos')
    .select(
      `id, nombre, precio, precio_anterior, en_oferta, estado, activo, destacado,
       producto_fotos ( url, orden ),
       producto_variantes ( precio )`
    )
    .eq('activo', true)
    .eq('destacado', true)
    .order('creado_en', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((producto) => ({
    ...conPrecioDesde(producto),
    foto_portada:
      [...(producto.producto_fotos ?? [])].sort((a, b) => a.orden - b.orden)[0]
        ?.url ?? null,
  }))
}

export async function getCategoriaBySlug(slug) {
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nombre, slug')
    .eq('slug', slug)
    .eq('activa', true)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getSubcategorias(categoriaId) {
  if (!categoriaId) return []

  const { data, error } = await supabase
    .from('subcategorias')
    .select('id, nombre, slug')
    .eq('categoria_id', categoriaId)
    .order('nombre', { ascending: true })

  if (error) throw error
  return data
}

export async function getProductosCatalogo({
  categoriaSlug,
  categoriaId,
  subcategoriaId,
  estado,
  precioMin,
  precioMax,
  orden,
} = {}) {
  let query = supabase
    .from('productos')
    .select(
      `id, nombre, precio, precio_anterior, en_oferta, estado, stock,
       categoria_id, subcategoria_id, destacado, creado_en,
       producto_fotos ( url, orden ),
       producto_variantes ( precio )`
    )
    .eq('activo', true)

  if (categoriaSlug === 'ofertas') {
    query = query.eq('en_oferta', true)
  } else if (categoriaId) {
    query = query.eq('categoria_id', categoriaId)
  }

  if (subcategoriaId) query = query.eq('subcategoria_id', subcategoriaId)
  if (estado) query = query.eq('estado', estado)
  if (precioMin != null) query = query.gte('precio', precioMin)
  if (precioMax != null) query = query.lte('precio', precioMax)

  if (orden === 'precio_asc') {
    query = query.order('precio', { ascending: true })
  } else if (orden === 'precio_desc') {
    query = query.order('precio', { ascending: false })
  } else {
    query = query
      .order('destacado', { ascending: false })
      .order('creado_en', { ascending: false })
  }

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((producto) => ({
    ...conPrecioDesde(producto),
    foto_portada:
      [...(producto.producto_fotos ?? [])].sort((a, b) => a.orden - b.orden)[0]
        ?.url ?? null,
  }))
}

export async function getProductoById(id) {
  const { data, error } = await supabase
    .from('productos')
    .select(
      `id, nombre, descripcion, precio, precio_anterior, en_oferta, estado,
       stock, incluye_regalo, caracteristicas,
       almacenamiento, pantalla, procesador, camara, material,
       categoria_id, subcategoria_id,
       categorias ( nombre, slug ),
       subcategorias ( nombre ),
       producto_fotos ( url, orden, color ),
       producto_variantes ( id, color, color_hex, stock, modelo_compatible, almacenamiento, precio )`
    )
    .eq('activo', true)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    ...data,
    fotos: [...(data.producto_fotos ?? [])].sort((a, b) => a.orden - b.orden),
  }
}

export async function getResenasProducto(productoId, limit = 6) {
  const { data: especificas, error: errorEspecificas } = await supabase
    .from('resenas')
    .select('id, nombre_cliente, ciudad, calificacion, comentario, creado_en')
    .eq('estado', 'aprobada')
    .eq('producto_id', productoId)
    .order('creado_en', { ascending: false })
    .limit(limit)

  if (errorEspecificas) throw errorEspecificas
  if (especificas && especificas.length > 0) {
    return { resenas: especificas, esEspecifica: true }
  }

  const generales = await getResenasAprobadas(limit)
  return { resenas: generales, esEspecifica: false }
}

export async function getAccesoriosSugeridos(excludeIds, limit = 4) {
  const idsAExcluir = Array.isArray(excludeIds) ? excludeIds : [excludeIds].filter(Boolean)

  const categoriaAccesorios = await getCategoriaBySlug('accesorios')
  if (!categoriaAccesorios) return []

  const query = supabase
    .from('productos')
    .select(
      `id, nombre, precio, precio_anterior, en_oferta, estado, stock,
       producto_fotos ( url, orden ),
       producto_variantes ( precio )`
    )
    .eq('activo', true)
    .eq('categoria_id', categoriaAccesorios.id)
    .limit(limit + idsAExcluir.length)

  const { data, error } = await query
  if (error) throw error

  return (data ?? [])
    .filter((producto) => !idsAExcluir.includes(producto.id))
    .slice(0, limit)
    .map((producto) => ({
      ...conPrecioDesde(producto),
      foto_portada:
        [...(producto.producto_fotos ?? [])].sort((a, b) => a.orden - b.orden)[0]
          ?.url ?? null,
    }))
}

export async function getBundlesParaCarrito(productoIds) {
  if (!productoIds.length) return {}
  const { data, error } = await supabase
    .from('bundles')
    .select(
      'producto_id, bundle_2_activo, bundle_2_tipo, bundle_2_descuento, bundle_3_activo, bundle_3_tipo, bundle_3_descuento'
    )
    .in('producto_id', productoIds)
    .eq('activo', true)
  if (error) throw error
  const mapa = {}
  for (const b of data ?? []) mapa[b.producto_id] = b
  return mapa
}

export async function getEnvioNacional() {
  const { data, error } = await supabase
    .from('config_envios')
    .select('zona, gratis_desde_monto, dias_min, dias_max, costo')
    .eq('zona', 'nacional')
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getRecogidaLocal() {
  const { data, error } = await supabase
    .from('config_envios')
    .select('zona, gratis_desde_monto, dias_min, dias_max, costo')
    .eq('zona', 'recogida_local')
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getInstagramPosts(limit = 8) {
  const { data, error } = await supabase
    .from('instagram_posts')
    .select('id, ig_media_id, caption, media_type, media_url, thumbnail_url, permalink, orden')
    .order('orden', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getResenasAprobadas(limit = 20) {
  const { data, error } = await supabase
    .from('resenas')
    .select('id, nombre_cliente, ciudad, calificacion, comentario, creado_en')
    .eq('estado', 'aprobada')
    .order('creado_en', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function crearResena({ productoId, nombre, ciudad, calificacion, comentario }) {
  const { error } = await supabase.from('resenas').insert({
    producto_id: productoId ?? null,
    nombre_cliente: nombre,
    ciudad: ciudad || null,
    calificacion,
    comentario,
    estado: 'pendiente',
    aprobada: false,
  })

  if (error) throw error
}

function generarNumeroPedido() {
  const numero = Math.floor(10000 + Math.random() * 90000)
  return `MC-${numero}`
}

export async function crearPedido({
  datosCliente,
  envio,
  items,
  subtotal,
  costoEnvio,
  usuarioId,
}) {
  // El rol público solo tiene permiso de INSERT (nunca SELECT) sobre pedidos,
  // así que no podemos usar .select() después del insert para recuperar el id
  // generado por la base — lo generamos aquí mismo y lo insertamos explícito.
  const pedidoId = crypto.randomUUID()
  const numero_pedido = generarNumeroPedido()
  const total = subtotal + costoEnvio

  const { error: errorPedido } = await supabase.from('pedidos').insert({
    id: pedidoId,
    usuario_id: usuarioId ?? null,
    numero_pedido,
    cliente_nombre: datosCliente.nombre,
    cliente_telefono: datosCliente.telefono,
    cliente_email: datosCliente.email || null,
    direccion: datosCliente.direccion,
    departamento: datosCliente.departamento,
    ciudad: datosCliente.ciudad,
    metodo_envio: envio.metodo,
    costo_envio: costoEnvio,
    subtotal,
    total,
    estado_pedido: 'confirmado',
    estado_pago: 'pendiente',
  })

  if (errorPedido) throw errorPedido

  const filasItems = items.map((item) => ({
    pedido_id: pedidoId,
    producto_id: item.productoId,
    nombre_producto: item.color ? `${item.nombre} (${item.color})` : item.nombre,
    cantidad: item.cantidad,
    precio_unitario: item.precio,
    es_bundle: item.esBundle ?? false,
    bundle_descripcion: item.bundleDescripcion ?? null,
  }))

  const { error: errorItems } = await supabase.from('pedido_items').insert(filasItems)
  if (errorItems) throw errorItems

  return { id: pedidoId, numero_pedido, total, subtotal, costoEnvio }
}

export async function getMisPedidos(usuarioId) {
  const { data, error } = await supabase
    .from('pedidos')
    .select(
      `id, numero_pedido, total, subtotal, costo_envio, metodo_envio,
       estado_pedido, estado_pago, creado_en,
       pedido_items ( id, nombre_producto, cantidad, precio_unitario )`
    )
    .eq('usuario_id', usuarioId)
    .order('creado_en', { ascending: false })

  if (error) throw error
  return data
}

export async function getConfirmacionPedido(numeroPedido) {
  const { data, error } = await supabase.rpc('obtener_confirmacion_pedido', {
    p_numero_pedido: numeroPedido,
  })

  if (error) throw error
  return data?.[0] ?? null
}

export async function getWishlistIds(usuarioId) {
  const { data, error } = await supabase
    .from('lista_deseos')
    .select('producto_id')
    .eq('usuario_id', usuarioId)

  if (error) throw error
  return (data ?? []).map((row) => row.producto_id)
}

export async function getWishlistProductos(usuarioId) {
  const { data, error } = await supabase
    .from('lista_deseos')
    .select(
      `producto_id,
       productos ( id, nombre, precio, precio_anterior, en_oferta, estado, stock, activo,
         producto_fotos ( url, orden ), producto_variantes ( precio ) )`
    )
    .eq('usuario_id', usuarioId)
    .order('creado_en', { ascending: false })

  if (error) throw error

  return (data ?? [])
    .map((row) => row.productos)
    .filter((producto) => producto?.activo)
    .map((producto) => ({
      ...conPrecioDesde(producto),
      foto_portada:
        [...(producto.producto_fotos ?? [])].sort((a, b) => a.orden - b.orden)[0]
          ?.url ?? null,
    }))
}

export async function agregarAWishlist(usuarioId, productoId) {
  const { error } = await supabase
    .from('lista_deseos')
    .insert({ usuario_id: usuarioId, producto_id: productoId })

  if (error) throw error
}

export async function quitarDeWishlist(usuarioId, productoId) {
  const { error } = await supabase
    .from('lista_deseos')
    .delete()
    .eq('usuario_id', usuarioId)
    .eq('producto_id', productoId)

  if (error) throw error
}
