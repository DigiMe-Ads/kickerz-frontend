-- =============================================================================
-- Colombo Kickerz website - Instagram -> Gallery auto-sync
-- =============================================================================
-- Optional add-on to schema.sql. Run this once you have an Instagram access
-- token (see README "Instagram auto-sync" for how to get one) - paste it
-- into step 2 below before running the whole file.
--
-- What this sets up:
--   1. private.settings   - the Instagram token, off-limits to the REST API
--      (PostgREST only ever exposes the `public` schema, so this is never
--      reachable from the browser regardless of RLS - the RLS below is
--      belt-and-braces in case that ever changes)
--   2. private.sync_instagram_gallery() - fetches your latest posts and
--      writes them into content.gallery.images (public.content, key
--      'gallery'), same shape src/data/gallery.js already uses. Everything
--      else in that section (title, subtitle, instagramUrl) is left alone.
--   3. private.refresh_instagram_token() - Instagram's long-lived tokens
--      expire after 60 days but can be refreshed before then without asking
--      you to sign in again; this does that monthly so nobody has to.
--   4. Two pg_cron schedules to run both automatically.
--
-- Needs the `http` and `pg_cron` extensions, both of which Supabase lets any
-- project enable straight from the SQL Editor - no dashboard toggle needed.
--
-- Once this runs, any photos added by hand in the admin's Gallery section
-- will be overwritten by the next sync - see the help text added next to
-- that field in src/admin/schema.js.
-- =============================================================================

create extension if not exists http with schema extensions;
create extension if not exists pg_cron;

-- ---------------------------------------------------------------------------
-- 1. Where the token lives. A schema PostgREST never exposes, not a table -
--    keeping it out of `public` altogether is the real protection; RLS here
--    only matters if that ever changes.
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.settings (
  key    text primary key,
  value  text not null
);

alter table private.settings enable row level security;
-- No policies: nothing with anon/authenticated ever reads this table. Only
-- the SECURITY DEFINER functions below (and the SQL Editor) can.

-- ---------------------------------------------------------------------------
-- 2. Paste your long-lived access token and numeric Instagram user id here,
--    then run this whole file. Re-running later with a new token (e.g.
--    after re-authorizing) just replaces these two rows.
-- ---------------------------------------------------------------------------
insert into private.settings (key, value) values
  ('instagram_access_token', 'PASTE_YOUR_LONG_LIVED_TOKEN_HERE'),
  ('instagram_user_id', 'PASTE_YOUR_INSTAGRAM_USER_ID_HERE')
on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------------
-- 3. The sync itself.
-- ---------------------------------------------------------------------------
create or replace function private.sync_instagram_gallery()
returns void
language plpgsql
security definer
set search_path = private, public, extensions
as $$
declare
  token       text;
  ig_user_id  text;
  resp        extensions.http_response;
  body        jsonb;
  images      jsonb;
  current_data jsonb;
begin
  select value into token      from private.settings where key = 'instagram_access_token';
  select value into ig_user_id from private.settings where key = 'instagram_user_id';

  if token is null or token = 'PASTE_YOUR_LONG_LIVED_TOKEN_HERE'
     or ig_user_id is null or ig_user_id = 'PASTE_YOUR_INSTAGRAM_USER_ID_HERE' then
    raise notice 'Instagram sync skipped: no token configured yet (private.settings).';
    return;
  end if;

  resp := extensions.http_get(
    format(
      'https://graph.instagram.com/%s/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=9&access_token=%s',
      ig_user_id, token
    )
  );

  if resp.status <> 200 then
    -- Logged, not raised - a failed sync should never take the site's
    -- gallery down, just leave it as it was until the next attempt.
    raise warning 'Instagram sync failed: HTTP % - %', resp.status, left(resp.content, 500);
    return;
  end if;

  body := resp.content::jsonb;

  select coalesce(jsonb_agg(jsonb_build_object(
    'src', case when item ->> 'media_type' = 'VIDEO'
                then item ->> 'thumbnail_url'
                else item ->> 'media_url' end,
    'alt', coalesce(nullif(left(regexp_replace(item ->> 'caption', '\s+', ' ', 'g'), 140), ''), 'Photo from Instagram'),
    'permalink', item ->> 'permalink'
  )), '[]'::jsonb)
  into images
  from jsonb_array_elements(body -> 'data') item
  where item ->> 'media_type' in ('IMAGE', 'CAROUSEL_ALBUM', 'VIDEO')
    and coalesce(item ->> 'media_url', item ->> 'thumbnail_url') is not null;

  select data into current_data from public.content where key = 'gallery';

  -- Merge: only the `images` key changes, title/subtitle/instagramUrl (and
  -- anything else an admin has saved on this section) are left exactly as
  -- they were.
  insert into public.content (key, data, updated_by)
  values ('gallery', coalesce(current_data, '{}'::jsonb) || jsonb_build_object('images', images), 'instagram-sync')
  on conflict (key) do update
    set data = coalesce(public.content.data, '{}'::jsonb) || jsonb_build_object('images', images),
        updated_by = 'instagram-sync';
end;
$$;

revoke all on function private.sync_instagram_gallery() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Token refresh - Instagram allows refreshing a long-lived token any time
--    it's more than 24h old and not yet expired, extending it another 60
--    days. Run monthly, this means nobody ever has to redo the sign-in step.
-- ---------------------------------------------------------------------------
create or replace function private.refresh_instagram_token()
returns void
language plpgsql
security definer
set search_path = private, extensions
as $$
declare
  token text;
  resp  extensions.http_response;
  body  jsonb;
begin
  select value into token from private.settings where key = 'instagram_access_token';
  if token is null or token = 'PASTE_YOUR_LONG_LIVED_TOKEN_HERE' then
    return;
  end if;

  resp := extensions.http_get(
    format('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=%s', token)
  );

  if resp.status <> 200 then
    raise warning 'Instagram token refresh failed: HTTP % - %', resp.status, left(resp.content, 500);
    return;
  end if;

  body := resp.content::jsonb;
  if body ? 'access_token' then
    update private.settings set value = body ->> 'access_token' where key = 'instagram_access_token';
  end if;
end;
$$;

revoke all on function private.refresh_instagram_token() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. Schedules. Times are UTC. Adjust the cron expressions to taste - e.g.
--    '0 */6 * * *' for every 6 hours instead of every 3.
-- ---------------------------------------------------------------------------
select cron.unschedule(jobid) from cron.job where jobname = 'instagram-gallery-sync';
select cron.schedule('instagram-gallery-sync', '20 */3 * * *', $$select private.sync_instagram_gallery();$$);

select cron.unschedule(jobid) from cron.job where jobname = 'instagram-token-refresh';
select cron.schedule('instagram-token-refresh', '30 4 1,15 * *', $$select private.refresh_instagram_token();$$);

-- =============================================================================
-- Done. To run the sync right now instead of waiting for the schedule:
--   select private.sync_instagram_gallery();
-- To check what the last run actually did:
--   select jobname, status, return_message, end_time
--   from cron.job_run_details order by end_time desc limit 10;
-- =============================================================================
