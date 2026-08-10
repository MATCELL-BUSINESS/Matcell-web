const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const CALLMEBOT_API_KEY = Deno.env.get('CALLMEBOT_API_KEY')!
  const MATCELL_WHATSAPP  = Deno.env.get('MATCELL_WHATSAPP')!

  const { mensaje } = await req.json()

  if (!mensaje) {
    return new Response(JSON.stringify({ error: 'mensaje requerido' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const url = `https://api.callmebot.com/whatsapp.php?phone=${MATCELL_WHATSAPP}&text=${encodeURIComponent(mensaje)}&apikey=${CALLMEBOT_API_KEY}`
  const res = await fetch(url)

  return new Response(JSON.stringify({ ok: res.ok, status: res.status }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
