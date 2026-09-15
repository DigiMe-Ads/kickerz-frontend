import { PostgrestClient } from '@supabase/postgrest-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config';

/**
 * Content + matches, read the same shape by the public site
 * (content/ContentProvider.jsx) and written the same shape by the admin
 * (admin/pages/Dashboard.jsx, admin/pages/Scores.jsx). One HTTP round trip
 * each - Supabase's REST layer (PostgREST) over the two tables in
 * supabase/schema.sql, both protected by Row Level Security: public read,
 * admin-only write.
 *
 * This talks to PostgREST directly via @supabase/postgrest-js, rather than
 * through the full @supabase/supabase-js client every other file in
 * admin/ uses. That client bundles Auth, Storage and Realtime together with
 * no way to import just the database piece, and unlike those, this module
 * is on the public site's critical path - every visitor's first paint, not
 * just an admin's. postgrest-js is the piece of supabase-js that actually
 * does `.from()` queries; importing it directly gets the exact same
 * chainable API at a fraction of the download.
 */

export const CONTENT_TABLE = 'content';
export const MATCHES_TABLE = 'matches';

let client;

/**
 * Read-only: this always authenticates as the anon key, never a signed-in
 * user, which is correct here - only the admin bundle ever needs to write,
 * and it uses lib/supabase.js's full client (with a real session) for that.
 */
function getRestClient() {
  if (!client) {
    client = new PostgrestClient(`${SUPABASE_URL}/rest/v1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
  }
  return client;
}

/**
 * All saved sections, as { [key]: sectionData }. `_updatedAt` / `_updatedBy`
 * are bookkeeping columns the `content_set_meta` trigger fills in server-side
 * (see schema.sql) - kept on the object with an underscore prefix, same
 * convention as the old Firestore version, so the site's merge-with-defaults
 * logic (which drops underscore keys) doesn't need to change.
 */
export async function fetchAllContent() {
  const { data, error } = await getRestClient()
    .from(CONTENT_TABLE)
    .select('key, data, updated_at, updated_by');
  if (error) throw error;

  const content = {};
  for (const row of data) {
    content[row.key] = { ...row.data, _updatedAt: row.updated_at, _updatedBy: row.updated_by };
  }
  return content;
}

/** A match row from Postgres (snake_case) as the app reads it (camelCase). */
export function rowToMatch(row) {
  return {
    id: row.id,
    home: row.home,
    away: row.away,
    homeScore: row.home_score,
    awayScore: row.away_score,
    status: row.status,
    kickoff: row.kickoff,
    venue: row.venue,
    competition: row.competition,
    ageGroup: row.age_group,
  };
}

/** The reverse: what the admin edits, as the columns matches actually has. */
export function matchToRow(m) {
  return {
    home: m.home,
    away: m.away,
    home_score: m.homeScore,
    away_score: m.awayScore,
    status: m.status,
    kickoff: m.kickoff,
    venue: m.venue,
    competition: m.competition,
    age_group: m.ageGroup,
  };
}

export async function fetchMatches(limitCount = 100) {
  const { data, error } = await getRestClient()
    .from(MATCHES_TABLE)
    .select('id, home, away, home_score, away_score, status, kickoff, venue, competition, age_group')
    .order('kickoff', { ascending: false })
    .limit(limitCount);
  if (error) throw error;
  return data.map(rowToMatch);
}

export default { fetchAllContent, fetchMatches, rowToMatch, matchToRow };
