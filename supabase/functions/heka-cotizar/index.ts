const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const HEKA_HOST    = Deno.env.get('HEKA_HOST')!
  const HEKA_API_KEY = Deno.env.get('HEKA_API_KEY')!
  const CITY_ORIGIN  = Deno.env.get('HEKA_CITY_ORIGIN') ?? '47189000'

  const { city_name, city_dane, declared_value, accion, query } = await req.json()

  // ── Acción: buscar ciudades ──────────────────────────────────────────
  if (accion === 'buscar') {
    if (!query || String(query).length < 2) {
      return new Response(JSON.stringify({ ciudades: [] }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const res = await fetch(
      `${HEKA_HOST}/api/v1/geolocation/city?label=${encodeURIComponent(String(query))}`,
      { headers: { 'api-key': HEKA_API_KEY } }
    )
    if (!res.ok) return new Response(JSON.stringify({ ciudades: [] }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
    const d = await res.json()
    const rows: Record<string, unknown>[] = d.response?.rows ?? []

    const DEPT: Record<string, string> = {
      '05': 'Antioquia',          '08': 'Atlántico',            '11': 'Bogotá D.C.',
      '13': 'Bolívar',            '15': 'Boyacá',               '17': 'Caldas',
      '18': 'Caquetá',            '19': 'Cauca',                '20': 'Cesar',
      '23': 'Córdoba',            '25': 'Cundinamarca',         '27': 'Chocó',
      '41': 'Huila',              '44': 'La Guajira',           '47': 'Magdalena',
      '50': 'Meta',               '52': 'Nariño',               '54': 'Norte de Santander',
      '63': 'Quindío',            '66': 'Risaralda',            '68': 'Santander',
      '70': 'Sucre',              '73': 'Tolima',               '76': 'Valle del Cauca',
      '81': 'Arauca',             '85': 'Casanare',             '86': 'Putumayo',
      '88': 'San Andrés y Providencia', '91': 'Amazonas',       '94': 'Guainía',
      '95': 'Guaviare',           '97': 'Vaupés',               '99': 'Vichada',
    }

    const ciudades = rows.slice(0, 10).map((r) => {
      const dane = String(r.dane ?? '')
      const depto = DEPT[dane.slice(0, 2)] ?? ''
      return {
        label: depto ? `${r.label} (${depto})` : String(r.label ?? ''),
        dane,
      }
    })

    return new Response(JSON.stringify({ ciudades }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // ── Acción: cotizar envío ────────────────────────────────────────────
  let cityCode: string

  if (city_dane) {
    cityCode = String(city_dane)
  } else if (city_name) {
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
    cityCode = String(ciudades[0].dane)
  } else {
    return new Response(JSON.stringify({ error: 'city_dane o city_name requerido' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

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
