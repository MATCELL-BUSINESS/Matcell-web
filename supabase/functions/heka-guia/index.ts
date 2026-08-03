import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HEKA_HOST     = Deno.env.get('HEKA_HOST')!
const HEKA_EMAIL    = Deno.env.get('HEKA_EMAIL')!
const HEKA_PASSWORD = Deno.env.get('HEKA_PASSWORD')!
const HEKA_API_KEY  = Deno.env.get('HEKA_API_KEY')!
const CITY_ORIGIN   = Deno.env.get('HEKA_CITY_ORIGIN') ?? '47189000'

const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// ── Token Bearer cacheado en tabla heka_token ─────────────────────────────────
async function getToken(): Promise<string> {
  const { data: cached } = await sb
    .from('heka_token')
    .select('token, expires_at')
    .eq('id', 1)
    .maybeSingle()

  if (cached && new Date(cached.expires_at) > new Date(Date.now() + 60_000)) {
    return cached.token
  }

  const loginRes = await fetch(`${HEKA_HOST}/api/v1/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': HEKA_API_KEY },
    body: JSON.stringify({ email: HEKA_EMAIL, password: HEKA_PASSWORD }),
  })
  if (!loginRes.ok) throw new Error('No se pudo autenticar con Heka')
  const loginData = await loginRes.json()
  const token: string = loginData.response?.token ?? loginData.token
  if (!token) throw new Error('Heka no devolvió token de autenticación')

  const expiresAt = new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString()
  await sb.from('heka_token').upsert({ id: 1, token, expires_at: expiresAt })
  return token
}

// ── Resuelve código DANE: directo si existe, fallback por nombre ──────────────
async function resolveCityDane(pedido: Record<string, unknown>): Promise<string> {
  if (pedido.ciudad_dane) return String(pedido.ciudad_dane)

  const cityRes = await fetch(
    `${HEKA_HOST}/api/v1/geolocation/city?label=${encodeURIComponent(String(pedido.ciudad ?? ''))}`,
    { headers: { 'api-key': HEKA_API_KEY } },
  )
  if (!cityRes.ok) throw new Error('No se pudo buscar la ciudad en Heka')
  const cityData = await cityRes.json()
  const rows: Record<string, unknown>[] = cityData.response?.rows ?? []
  if (rows.length === 0) throw new Error(`Ciudad "${pedido.ciudad}" no encontrada en Heka`)
  return String(rows[0].dane)
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ── Handler ───────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { action } = body

    // ── 1. Listar bodegas ─────────────────────────────────────────────────────
    if (action === 'listar_bodegas') {
      const token = await getToken()
      const res = await fetch(`${HEKA_HOST}/api/v1/warehouse`, {
        headers: { Authorization: `Bearer ${token}`, 'api-key': HEKA_API_KEY },
      })
      if (!res.ok) throw new Error('No se pudieron obtener las bodegas de Heka')
      const data = await res.json()
      const bodegas: Record<string, unknown>[] = data.response ?? data ?? []
      return json({ bodegas })
    }

    // ── 2. Listar transportadoras disponibles para el pedido ──────────────────
    if (action === 'listar_transportadoras') {
      const { pedido_id } = body
      const { data: pedido, error: pe } = await sb
        .from('pedidos')
        .select('ciudad, ciudad_dane, subtotal')
        .eq('id', pedido_id)
        .single()
      if (pe || !pedido) throw new Error('Pedido no encontrado')

      const cityDestination = await resolveCityDane(pedido)

      const quoterRes = await fetch(`${HEKA_HOST}/api/v1/shipping/quoter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': HEKA_API_KEY },
        body: JSON.stringify({
          city_origin: CITY_ORIGIN,
          city_destination: cityDestination,
          type_payment: 3,
          declared_value: pedido.subtotal ?? 0,
          weight: 1, height: 16, long: 22, width: 11,
          withshipping_cost: true,
          collection_value: 0,
        }),
      })
      if (!quoterRes.ok) throw new Error('Error al cotizar transportadoras con Heka')
      const qData = await quoterRes.json()
      const transportadoras = ((qData.response ?? []) as Record<string, unknown>[])
        .filter((c) => Number(c.total) > 0)
        .map((c) => ({
          distributor_id: String(c.distributor_id ?? ''),
          nombre: String(c.distributor ?? c.name ?? c.distributor_id ?? ''),
          precio: Number(c.total),
          tiempo: String(c.deliveryTime ?? c.delivery_time ?? ''),
        }))
        .sort((a, b) => a.precio - b.precio)

      return json({ transportadoras })
    }

    // ── 3. Crear guía ─────────────────────────────────────────────────────────
    if (action === 'crear_guia') {
      const { pedido_id, distributor_id, warehouse_id } = body
      if (!pedido_id || !distributor_id || !warehouse_id) {
        return json({ error: 'Faltan campos requeridos: pedido_id, distributor_id, warehouse_id' }, 400)
      }

      const { data: pedido, error: pe } = await sb
        .from('pedidos')
        .select('*')
        .eq('id', pedido_id)
        .single()
      if (pe || !pedido) throw new Error('Pedido no encontrado')

      const { data: items } = await sb
        .from('pedido_items')
        .select('nombre_producto')
        .eq('pedido_id', pedido_id)
      const primerProducto: string = items?.[0]?.nombre_producto ?? 'Producto'

      const cityDestination = await resolveCityDane(pedido)

      const nombreParts = String(pedido.cliente_nombre ?? '').trim().split(/\s+/)
      const firstName = nombreParts[0] ?? ''
      const lastName  = nombreParts.slice(1).join(' ') || firstName

      const token = await getToken()

      const guideRes = await fetch(`${HEKA_HOST}/api/v1/shipments/guide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'api-key': HEKA_API_KEY,
        },
        body: JSON.stringify({
          type: 1,
          city_origin: CITY_ORIGIN,
          city_destination: cityDestination,
          type_payment: 3,
          total: pedido.costo_envio ?? 0,
          declared_value: pedido.subtotal ?? 0,
          weight: 1, height: 16, long: 22, width: 11,
          withshipping_cost: true,
          collection_value: 0,
          distributor_id,
          warehouse: warehouse_id,
          quantity: 1,
          product: primerProducto,
          client: {
            name: firstName,
            last_name: lastName,
            address: pedido.direccion ?? '',
            phone: String(pedido.cliente_telefono ?? ''),
            neighborhood: pedido.ciudad ?? '',
            type_document: 'CC',
            document: '000000',
          },
        }),
      })

      const guideData = await guideRes.json()
      if (!guideRes.ok) {
        const msg = guideData?.message ?? guideData?.error ?? JSON.stringify(guideData)
        throw new Error(`Heka: ${msg}`)
      }

      const guideNumber = String(
        guideData.response?.guide_number ??
        guideData.response?.number ??
        guideData.guide_number ??
        '',
      )
      const shipmentId = String(guideData.response?.id ?? guideData.id ?? '')
      if (!guideNumber) throw new Error('Heka no devolvió número de guía en la respuesta')

      await sb.from('pedidos').update({
        heka_guide_number: guideNumber,
        heka_shipment_id:  shipmentId,
        numero_guia:       guideNumber,
        estado_pedido:     'enviado',
      }).eq('id', pedido_id)

      return json({ guide_number: guideNumber, shipment_id: shipmentId })
    }

    return json({ error: 'Acción no reconocida' }, 400)

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return json({ error: msg }, 500)
  }
})
