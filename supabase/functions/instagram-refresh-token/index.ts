// Edge Function: instagram-refresh-token
//
// Renueva el access_token de larga duración de Instagram antes de que
// caduque (dura ~60 días, hay que renovarlo al menos cada 60 días).
// Pensada para ser invocada por un cron job cada ~50 días.

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const cronSecret = Deno.env.get('CRON_SECRET')
    if (cronSecret && req.headers.get('x-cron-secret') !== cronSecret) {
      return new Response(JSON.stringify({ ok: false, error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Faltan variables de entorno de Supabase')
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: config, error: configError } = await supabase
      .from('instagram_config')
      .select('id, access_token, actualizado_en')
      .limit(1)
      .maybeSingle()

    if (configError) throw configError
    if (!config?.access_token) {
      throw new Error('instagram_config no tiene access_token')
    }

    // El cron corre a diario, pero el token de Instagram solo necesita
    // renovarse cada ~60 días. Renovamos a partir de los 45 días para
    // dejar margen de sobra antes de que caduque.
    const DIAS_MIN_ENTRE_RENOVACIONES = 45
    if (config.actualizado_en) {
      const diasDesdeUltimaRenovacion =
        (Date.now() - new Date(config.actualizado_en).getTime()) / 86_400_000
      if (diasDesdeUltimaRenovacion < DIAS_MIN_ENTRE_RENOVACIONES) {
        return new Response(
          JSON.stringify({
            ok: true,
            renovado: false,
            mensaje: `Aún no toca renovar (${Math.floor(diasDesdeUltimaRenovacion)} días desde la última renovación)`,
          }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${config.access_token}`
    const igResponse = await fetch(url)
    const igData = await igResponse.json()

    if (!igResponse.ok || !igData.access_token) {
      throw new Error(
        `Error al renovar el token de Instagram: ${JSON.stringify(igData)}`
      )
    }

    const { error: updateError } = await supabase
      .from('instagram_config')
      .update({
        access_token: igData.access_token,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', config.id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ ok: true, renovado: true, expires_in: igData.expires_in ?? null }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
