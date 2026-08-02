import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const HEKA_HOST    = Deno.env.get('HEKA_HOST')!
  const HEKA_API_KEY = Deno.env.get('HEKA_API_KEY')!
  const CITY_ORIGIN  = Deno.env.get('HEKA_CITY_ORIGIN') ?? '47189000'

  const { city_name, declared_value } = await req.json()

  if (!city_name) {
    return new Response(JSON.stringify({ error: 'city_name requerido' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // ── 1. Buscar código DANE de la ciudad destino ───────────────────
  const cityRes = await fetch(
    `${HEKA_HOST}/api/v1/geolocation/city?label=${encodeURIComponent(city_name)}`,
    { headers: { 'api-key': HEKA_API_KEY } }
  )
  if (!cityRes.ok) {
    return new Response(JSON.stringify({ error: 'No se pudo buscar la ciudad en Heka' }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const cityData = await cityRes.json()
  const ciudades: Record<string, unknown>[] = cityData.response?.rows ?? []
  if (!Array.isArray(ciudades) || ciudades.length === 0) {
    return new Response(JSON.stringify({ error: 'Ciudad no encontrada en Heka' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const cityCode = String(ciudades[0].dane)

  // ── 2. Cotizar ───────────────────────────────────────────────────
  const quoterRes = await fetch(`${HEKA_HOST}/api/v1/shipping/quoter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': HEKA_API_KEY },
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
  const cotizaciones: Record<string, unknown>[] = quoterData.response ?? []

  // ── 3. Normalizar y ordenar por precio ──────────────────────────
  const resultado = (Array.isArray(cotizaciones) ? cotizaciones : [])
    .filter((c) => c.total && Number(c.total) > 0)
    .map((c) => ({
      transportadora: String(c.distributor_id ?? ''),
      precio: Number(c.total),
      tiempo: String(c.deliveryTime ?? c.delivery_time ?? ''),
    }))
    .sort((a, b) => a.precio - b.precio)

  return new Response(JSON.stringify({ cotizaciones: resultado }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
