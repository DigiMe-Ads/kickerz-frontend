-- =============================================================================
-- Colombo Kickerz website - Supabase schema
-- =============================================================================
-- Run this whole file once, in the Supabase dashboard: SQL Editor -> New query
-- -> paste -> Run. It is safe to re-run (every statement is idempotent), which
-- is how you pick up a newer copy of this file after a `git pull`.
--
-- What this sets up:
--   1. admins    - who is allowed to write (an allowlist, not a role)
--   2. content   - one row per editable section of the site (src/admin/schema.js)
--   3. matches   - the Match Centre
--   4. grant_admin(email) / revoke_admin(email) - manage the allowlist by email
--   5. The "uploads" Storage bucket, with the same admin-only write rule
--
-- Every table gets Row Level Security: public read, admin-only write.
--
-- See README "Admin & Supabase" for the parts of setup that happen outside
-- SQL (creating accounts, environment variables, Auth redirect URLs).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. admins - the allowlist. Not a role: a plain table of who may write.
--    Created first: content and matches below both reference it in their
--    own RLS policies.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);

alter table public.admins enable row level security;

-- A signed-in user may check *their own* row (that's how the admin app
-- decides which screen to show). No insert/update/delete policy exists for
-- any client role, on purpose: the only way in is the SQL editor (or
-- grant_admin below), run as the project owner. See src/admin/auth.jsx.
drop policy if exists "users can see their own admin record" on public.admins;
create policy "users can see their own admin record"
  on public.admins for select
  using (auth.uid() = id);

-- A small helper the RLS policies below share. Deliberately NOT security
-- definer: it only ever checks the caller's own row, so it should compose
-- with admins' own RLS policy above rather than bypass it - if that policy
-- is ever tightened, this stays correct without changes.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- 2. content - one document per section, mirrors src/content/defaults.js
-- ---------------------------------------------------------------------------
create table if not exists public.content (
  key         text primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  text
);

-- Pins writes to real sections, so a compromised or buggy client can't
-- scatter arbitrary rows into this table. Keep this list in sync with
-- CONTENT_KEYS in src/content/defaults.js.
alter table public.content drop constraint if exists content_key_check;
alter table public.content add constraint content_key_check check (key in (
  'site', 'announcement', 'hero', 'stats', 'about', 'whyUs', 'programs',
  'testimonials', 'results', 'events', 'team', 'partners', 'gallery', 'contact'
));

-- Fills updated_at / updated_by itself from the request's own session, so a
-- client can't backdate a save or claim someone else made it.
create or replace function public.set_content_meta()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.jwt() ->> 'email', new.updated_by, 'unknown');
  return new;
end;
$$;

drop trigger if exists content_set_meta on public.content;
create trigger content_set_meta
  before insert or update on public.content
  for each row execute function public.set_content_meta();

alter table public.content enable row level security;

drop policy if exists "content is publicly readable" on public.content;
create policy "content is publicly readable"
  on public.content for select
  using (true);

drop policy if exists "only admins can write content" on public.content;
create policy "only admins can write content"
  on public.content for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. matches - the Match Centre (src/admin/pages/Scores.jsx)
-- ---------------------------------------------------------------------------
create table if not exists public.matches (
  id           uuid primary key default gen_random_uuid(),
  home         jsonb not null,
  away         jsonb not null,
  home_score   int,
  away_score   int,
  status       text not null,
  kickoff      text not null,
  venue        text not null default '',
  competition  text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- {name, logo}, matching what the admin form and the public Match Centre
-- both read - see content/matches.js.
create or replace function public.is_valid_team(t jsonb)
returns boolean
language sql
immutable
as $$
  select
    jsonb_typeof(t) = 'object'
    and (select coalesce(array_agg(k), array[]::text[]) from jsonb_object_keys(t) k) <@ array['name', 'logo']
    and t ? 'name' and t ? 'logo'
    and jsonb_typeof(t -> 'name') = 'string'
    and jsonb_typeof(t -> 'logo') = 'string'
    and char_length(t ->> 'name') between 1 and 80
    and char_length(t ->> 'logo') <= 2048;
$$;

alter table public.matches drop constraint if exists matches_home_valid;
alter table public.matches add constraint matches_home_valid check (public.is_valid_team(home));
alter table public.matches drop constraint if exists matches_away_valid;
alter table public.matches add constraint matches_away_valid check (public.is_valid_team(away));

alter table public.matches drop constraint if exists matches_status_check;
alter table public.matches add constraint matches_status_check check (status in ('upcoming', 'live', 'ft'));

-- 'YYYY-MM-DDTHH:mm', the venue's own local time - see the note in
-- content/matches.js on why this is a plain string, not a timestamp.
alter table public.matches drop constraint if exists matches_kickoff_format;
alter table public.matches add constraint matches_kickoff_format
  check (kickoff ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$');

alter table public.matches drop constraint if exists matches_home_score_range;
alter table public.matches add constraint matches_home_score_range
  check (home_score is null or home_score between 0 and 99);
alter table public.matches drop constraint if exists matches_away_score_range;
alter table public.matches add constraint matches_away_score_range
  check (away_score is null or away_score between 0 and 99);

alter table public.matches drop constraint if exists matches_venue_length;
alter table public.matches add constraint matches_venue_length check (char_length(venue) <= 160);
alter table public.matches drop constraint if exists matches_competition_length;
alter table public.matches add constraint matches_competition_length check (char_length(competition) <= 120);

create or replace function public.set_match_meta()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists matches_set_meta on public.matches;
create trigger matches_set_meta
  before insert or update on public.matches
  for each row execute function public.set_match_meta();

create index if not exists matches_kickoff_idx on public.matches (kickoff desc);
create index if not exists matches_status_idx on public.matches (status);

alter table public.matches enable row level security;

drop policy if exists "matches are publicly readable" on public.matches;
create policy "matches are publicly readable"
  on public.matches for select
  using (true);

drop policy if exists "only admins can write matches" on public.matches;
create policy "only admins can write matches"
  on public.matches for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. grant_admin(email) / revoke_admin(email) - manage the allowlist by
--    email instead of hand-typing a user id.
--
--    In the SQL Editor:  select public.grant_admin('coach@kickerz.test');
--
--    SECURITY DEFINER so it can look the user up in auth.users (normal
--    accounts can't read that table), but the two revokes below each
--    function are what actually make this safe: without them, ANY signed-in
--    visitor could call this over the API and make themselves an admin.
--    Only the SQL Editor (and anything else connecting as the
--    postgres/service_role, which bypasses grants entirely) can call it.
-- ---------------------------------------------------------------------------
create or replace function public.grant_admin(user_email text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_id uuid;
begin
  select id into target_id from auth.users where email = user_email;
  if target_id is null then
    raise exception 'No account found for %. Create it first in Authentication -> Users.', user_email;
  end if;
  insert into public.admins (id, email) values (target_id, user_email)
    on conflict (id) do update set email = excluded.email;
  return target_id::text;
end;
$$;

revoke all on function public.grant_admin(text) from public, anon, authenticated;

create or replace function public.revoke_admin(user_email text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  delete from public.admins where id in (select id from auth.users where email = user_email);
end;
$$;

revoke all on function public.revoke_admin(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. Storage - the "uploads" bucket for images and the hero video.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads', 'uploads', true, 209715200, array['image/*', 'video/*']) -- 200MB, matches src/admin/upload.js
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Supabase enables Row Level Security on storage.buckets and
-- storage.objects by default on every project (confirmed against a real
-- project while writing this - `postgres` doesn't even own either table, so
-- it can't be toggled here even defensively; Supabase's own storage_admin
-- role manages it). Both need their own policy - a bucket's own `public`
-- flag only governs whether *files in it* need a signed URL, not whether
-- its metadata row is visible, and with RLS on and no policy the default is
-- deny, same as everywhere else in this file.
drop policy if exists "the uploads bucket is publicly visible" on storage.buckets;
create policy "the uploads bucket is publicly visible"
  on storage.buckets for select
  using (id = 'uploads');

drop policy if exists "uploads are publicly readable" on storage.objects;
create policy "uploads are publicly readable"
  on storage.objects for select
  using (bucket_id = 'uploads');

drop policy if exists "only admins can write uploads" on storage.objects;
create policy "only admins can write uploads"
  on storage.objects for all
  using (bucket_id = 'uploads' and public.is_admin())
  with check (bucket_id = 'uploads' and public.is_admin());

-- =============================================================================
-- Done. Next: create an account for yourself in Authentication -> Users, then
-- run   select public.grant_admin('you@example.com');   and sign in at /admin.
-- =============================================================================
