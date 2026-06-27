// Edge Function: instagram-sync
//
// Trae las últimas publicaciones del feed de Instagram (Graph API) y las
// cachea en la tabla `instagram_posts`, para que el sitio público nunca
// llame directamente a la API de Instagram ni tenga acceso al access_token.
//
// Requiere las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
// (ya disponibles por defecto en todo proyecto de Supabase Edge Functions).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const MEDIA_LIMIT = 8

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
      .select('access_token, ig_user_id')
      .limit(1)
      .maybeSingle()

    if (configError) throw configError
    if (!config?.access_token || !config?.ig_user_id) {
      throw new Error('instagram_config no tiene access_token o ig_user_id')
    }

    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink'
    const url = `https://graph.instagram.com/${config.ig_user_id}/media?fields=${fields}&access_token=${config.access_token}&limit=${MEDIA_LIMIT}`

    const igResponse = await fetch(url)
    const igData = await igResponse.json()

    if (!igResponse.ok) {
      throw new Error(
        `Error de la API de Instagram: ${JSON.stringify(igData)}`
      )
    }

    const posts = (igData.data ?? []).slice(0, MEDIA_LIMIT)

    const rows = posts.map((post: Record<string, string>, index: number) => ({
      ig_media_id: post.id,
      caption: post.caption ?? null,
      media_type: post.media_type ?? null,
      media_url: post.media_url,
      thumbnail_url: post.thumbnail_url ?? null,
      permalink: post.permalink,
      orden: index,
    }))

    if (rows.length > 0) {
      const { error: upsertError } = await supabase
        .from('instagram_posts')
        .upsert(rows, { onConflict: 'ig_media_id' })

      if (upsertError) throw upsertError

      // Limpiamos publicaciones cacheadas que ya no vienen en el feed actual.
      const idsActuales = rows.map((row) => row.ig_media_id)
      const { error: deleteError } = await supabase
        .from('instagram_posts')
        .delete()
        .not('ig_media_id', 'in', `(${idsActuales.map((id) => `"${id}"`).join(',')})`)

      if (deleteError) throw deleteError
    }

    return new Response(
      JSON.stringify({ ok: true, sincronizados: rows.length }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
