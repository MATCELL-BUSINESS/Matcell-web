import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const HEKA_HOST     = Deno.env.get('HEKA_HOST')!
  const HEKA_EMAIL    = Deno.env.get('HEKA_EMAIL')!
  const HEKA_PASSWORD = Deno.env.get('HEKA_PASSWORD')!
  const HEKA_API_KEY  = Deno.env.get('HEKA_API_KEY')!
  const CITY_ORIGIN   = Deno.env.get('HEKA_CITY_ORIGIN') ?? '47189000'

  // ── 1. Token con caché en heka_token ────────────────────────────
  let token: string

  const { data: cached } = await supabase
    .from('heka_token')
    .select('token, expires_at')
    .eq('id', 1)
    .maybeSingle()

  const ahora = new Date()
  const expirado = !cached || new Date(cached.expires_at) <= ahora

  if (expirado) {
    const loginRes = await fetch(`${HEKA_HOST}/api/v1/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': HEKA_API_KEY },
      body: JSON.stringify({ email: HEKA_EMAIL, password: HEKA_PASSWORD, channel: 'hekaentrega' }),
    })
    if (!loginRes.ok) {
      const txt = await loginRes.text()
      return new Response(JSON.stringify({ error: 'Login Heka falló', detail: txt }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const loginData = await loginRes.json()
    token = loginData.response?.token ?? loginData.data?.token ?? loginData.token
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token no encontrado en respuesta Heka' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const expiresAt = new Date(ahora.getTime() + 23 * 60 * 60 * 1000).toISOString()
    await supabase.from('heka_token').upsert({ id: 1, token, expires_at: expiresAt })
  } else {
    token = cached!.token
  }

  // ── 2. Body del frontend ─────────────────────────────────────────
  const { city_name, declared_value } = await req.json()

  if (!city_name) {
    return new Response(JSON.stringify({ error: 'city_name requerido' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // ── 3. Buscar código DANE ────────────────────────────────────────
  const cityRes = await fetch(
    `${HEKA_HOST}/api/v1/geolocation/city?label=${encodeURIComponent(city_name)}`,
    { headers: { Authorization: `Bearer ${token}`, 'api-key': HEKA_API_KEY } }
  )
  if (!cityRes.ok) {
    return new Response(JSON.stringify({ error: 'No se pudo buscar la ciudad en Heka' }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const cityData = await cityRes.json()
  const ciudades: Record<string, unknown>[] = cityData.response?.rows ?? cityData.data ?? cityData
  if (!Array.isArray(ciudades) || ciudades.length === 0) {
    return new Response(JSON.stringify({ error: 'Ciudad no encontrada en Heka' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const cityCode = ciudades[0].dane ?? ciudades[0].code ?? ciudades[0].id ?? ciudades[0].dane_code

  // ── 4. Cotizar ───────────────────────────────────────────────────
  const quoterRes = await fetch(`${HEKA_HOST}/api/v1/shipping/quoter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'api-key': HEKA_API_KEY,
    },
    body: JSON.stringify({
      city_origin: CITY_ORIGIN,
      city_destination: cityCode,
      type_payment: 3,
      declared_value: declared_value ?? 0,
      weight: 1,
      height: 16,
      long: 22,
      width: 11,
      withshipping_cost: true,
      collection_value: 0,
    }),
  })

  if (!quoterRes.ok) {
    return new Response(JSON.stringify({ error: 'Error al cotizar con Heka' }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const quoterData = await quoterRes.json()
  const cotizaciones: Record<string, unknown>[] = quoterData.response ?? quoterData.data ?? quoterData ?? []

  // ── 5. Normalizar y ordenar por precio ──────────────────────────
  const resultado = (Array.isArray(cotizaciones) ? cotizaciones : [])
    .map((c) => ({
      transportadora: String(c.distributor_id ?? c.carrier_name ?? c.name ?? c.carrier ?? ''),
      precio: Number(c.total_price ?? c.shipping_cost ?? c.price ?? c.cost ?? 0),
      tiempo: String(c.delivery_time ?? c.days ?? c.estimated_days ?? c.message ?? ''),
    }))
    .filter((c) => c.transportadora && c.precio > 0)
    .sort((a, b) => a.precio - b.precio)

  return new Response(JSON.stringify({ cotizaciones: resultado }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
