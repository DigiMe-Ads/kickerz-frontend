/**
 * Match data helpers, shared by the public Match Centre and the scores admin.
 *
 * A match, as this app reads it (camelCase - see rowToMatch/matchToRow in
 * lib/db.js for the snake_case columns it's actually stored as in the
 * `matches` table, supabase/schema.sql):
 *   {
 *     home:        { name, logo },
 *     away:        { name, logo },
 *     homeScore:   number | null,
 *     awayScore:   number | null,
 *     status:      'upcoming' | 'live' | 'ft',
 *     kickoff:     'YYYY-MM-DDTHH:mm',
 *     venue:       string,
 *     competition: string   (optional, e.g. "Kickerz Cup")
 *     ageGroup:    string   (optional, e.g. "U12")
 *   }
 *
 * `kickoff` is deliberately the wall-clock time as the admin typed it, not a
 * timestamp. Matches are entered by someone standing at the venue, and a
 * parent reading "4:00 PM" wants the venue's 4:00 PM - converting to each
 * visitor's timezone would show a family watching from Dubai the wrong time
 * for a match in Colombo, and vice versa on tour. A fixed-format string also
 * still sorts correctly as plain text, which is all a `text` column needs.
 */

export const MATCH_STATUSES = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'live', label: 'Live' },
  { value: 'ft', label: 'Full time' },
];

/** How many matches the public section shows. */
export const DISPLAY_LIMIT = 6;

/**
 * An "upcoming" fixture whose kickoff passed this long ago is almost
 * certainly one nobody got round to updating, and "Upcoming - last month" on
 * the public site reads as broken. Hide it rather than guess the score.
 */
const STALE_UPCOMING_MS = 12 * 60 * 60 * 1000;

function kickoffParts(kickoff) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(kickoff || '');
  if (!m) return null;
  return m.slice(1).map(Number);
}

/**
 * The kickoff as an absolute time, reading the stored wall-clock value as
 * the viewer's own local time. Only used for the "is this stale?" check,
 * where being a timezone out either way doesn't matter over a 12h window.
 */
function kickoffAsLocalDate(kickoff) {
  const p = kickoffParts(kickoff);
  return p ? new Date(p[0], p[1] - 1, p[2], p[3], p[4]) : null;
}

/** "Sat 14 Sep" / "4:00 PM", exactly as entered - no timezone conversion. */
export function formatKickoff(kickoff) {
  const p = kickoffParts(kickoff);
  if (!p) return { date: '', time: '' };
  // Formatting a UTC instant *in* UTC reproduces the typed digits exactly.
  const d = new Date(Date.UTC(p[0], p[1] - 1, p[2], p[3], p[4]));
  const date = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(d);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(d);
  return { date, time };
}

export function hasScore(match) {
  return Number.isFinite(match?.homeScore) && Number.isFinite(match?.awayScore);
}

/**
 * Public display order: anything live first, then upcoming fixtures soonest
 * first, then results newest first - capped at DISPLAY_LIMIT.
 */
export function sortMatchesForDisplay(matches, now = Date.now()) {
  const byKickoff = (a, b) => (a.kickoff || '').localeCompare(b.kickoff || '');

  const live = matches.filter((m) => m.status === 'live').sort(byKickoff);
  const upcoming = matches
    .filter((m) => m.status === 'upcoming')
    .filter((m) => {
      const at = kickoffAsLocalDate(m.kickoff);
      return !at || now - at.getTime() < STALE_UPCOMING_MS;
    })
    .sort(byKickoff);
  const results = matches.filter((m) => m.status === 'ft').sort((a, b) => byKickoff(b, a));

  return [...live, ...upcoming, ...results].slice(0, DISPLAY_LIMIT);
}

/** A kickoff string for "now", rounded to the next quarter hour - the form's default. */
export function defaultKickoff(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
