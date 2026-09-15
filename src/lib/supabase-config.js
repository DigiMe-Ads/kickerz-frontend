/**
 * Supabase project config.
 *
 * Fill in the two values below once you have a project (Supabase dashboard
 * -> Project Settings -> API -> "Project URL" and "anon public" key) - see
 * README "Admin & Supabase". They're the direct replacement for the
 * hardcoded Firebase config this file used to hold: neither value is
 * secret, so committing them here is fine. The anon key only identifies
 * the project to Supabase and is meant to ship in client code (visible in
 * any browser's network tab either way); what actually protects the data is
 * Row Level Security - see supabase/schema.sql - which must be run in the
 * Supabase SQL Editor before any of this works.
 *
 * An environment variable, if set, wins over the value here - handy for
 * pointing a local checkout at a different project without editing this
 * file. See .env.example.
 */
const PROJECT_URL = 'https://lcgzwdfpkemzqqhlflkj.supabase.co';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjZ3p3ZGZwa2VtenFxaGxmbGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDAzMzMsImV4cCI6MjEwNTAxNjMzM30.cXIQN7aNPcCUX0_-lXqL-6ucrFeiMeN30vQ7nqdH63o'; // "anon public" - checked: role is "anon", not "service_role"

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || PROJECT_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ANON_KEY;

/** False until both values above are filled in (directly or via env vars). */
export const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (import.meta.env.DEV && !SUPABASE_CONFIGURED) {
  // A missing config isn't fatal - every read falls back to the site's
  // built-in content (see content/ContentProvider.jsx) - but it's easy to
  // mistake for a bug if nothing says so.
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Not configured - fill in PROJECT_URL/ANON_KEY in src/lib/supabase-config.js ' +
      '(or set VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY). The site will run on its built-in ' +
      'content, and /admin will not be able to sign in.',
  );
}
