-- Cache de publicaciones de Instagram, alimentado por la Edge Function
-- "instagram-sync". El sitio público solo lee de aquí, nunca llama
-- directamente a la API de Instagram ni ve el access_token.

create table instagram_posts (
  id uuid primary key default gen_random_uuid(),
  ig_media_id text not null unique,
  caption text,
  media_type text,
  media_url text not null,
  thumbnail_url text,
  permalink text not null,
  orden integer not null default 0,
  creado_en timestamptz not null default now()
);

alter table instagram_posts enable row level security;

create policy "instagram_posts_publicos" on instagram_posts
for select
to anon
using (true);

-- La Edge Function usa la service role key, que ignora RLS,
-- así que no necesita una policy de escritura explícita aquí.
