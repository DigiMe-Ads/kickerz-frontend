import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_CONFIGURED } from './supabase-config';

export { SUPABASE_CONFIGURED } from './supabase-config';

/**
 * The Supabase client. One instance for the whole app - public site and
 * admin alike, since Supabase Auth's session lives on this same client and
 * every table/query call needs to see it.
 *
 * Built even when env vars are missing (with placeholder values) rather
 * than left null, so calling code never has to null-check it - a request
 * just fails at the network layer instead, which every caller here already
 * catches and treats the same as "unreachable" (see ContentProvider,
 * admin/auth.jsx).
 */
let client;

export function getSupabase() {
  if (!client) {
    client = createClient(
      SUPABASE_URL || 'https://not-configured.supabase.co',
      SUPABASE_ANON_KEY || 'not-configured',
      { auth: { persistSession: true, autoRefreshToken: true } },
    );
  }
  return client;
}

export default getSupabase;
