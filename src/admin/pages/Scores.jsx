import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftRight, CalendarDays, Flag, Loader2, MapPin, Minus, Pencil, Play, Plus, RefreshCw, Trash2, Upload, X,
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { MATCHES_TABLE, rowToMatch, matchToRow } from '../../lib/db';
import { DEFAULT_CONTENT } from '../../content/defaults';
import { MATCH_STATUSES, defaultKickoff, formatKickoff } from '../../content/matches';
import { prepareImage, uploadFile, friendlyUploadError } from '../upload';
import TeamBadge from '../../components/ui/TeamBadge';
import { Btn, FieldShell, inputClass, Spinner, useToast, friendlyDbError } from '../components/ui';
import { cn } from '../../lib/cn';

const HOME_TEAM = { name: DEFAULT_CONTENT.site.fullName.replace(/ Football Academy$/, ''), logo: DEFAULT_CONTENT.site.logo };

/** Wait for a burst of score taps to settle before writing. */
const SCORE_SAVE_DELAY = 700;

function blankMatch(lastVenue) {
  return {
    competition: '',
    ageGroup: '',
    home: { ...HOME_TEAM },
    away: { name: '', logo: '' },
    status: 'upcoming',
    homeScore: null,
    awayScore: null,
    kickoff: defaultKickoff(),
    venue: lastVenue || DEFAULT_CONTENT.site.contact.address,
  };
}

/** Exactly the fields supabase/schema.sql accepts - nothing else goes to the server. */
function toDoc(m) {
  const upcoming = m.status === 'upcoming';
  const score = (v) => (upcoming || v === null || v === '' || !Number.isFinite(Number(v)) ? null : Math.max(0, Math.min(99, Math.round(Number(v)))));
  return {
    competition: (m.competition || '').trim(),
    ageGroup: (m.ageGroup || '').trim(),
    home: { name: (m.home?.name || '').trim(), logo: m.home?.logo || '' },
    away: { name: (m.away?.name || '').trim(), logo: m.away?.logo || '' },
    status: m.status,
    homeScore: score(m.homeScore),
    awayScore: score(m.awayScore),
    kickoff: m.kickoff,
    venue: (m.venue || '').trim(),
  };
}

/** Columns to read back after a write, so local state matches the server exactly. */
const SELECT_COLUMNS = 'id, home, away, home_score, away_score, status, kickoff, venue, competition, age_group';

/** A camelCase score patch (the only kind of partial update Scores makes) as row columns. */
function scorePatchToRow({ homeScore, awayScore, ...rest }) {
  const row = { ...rest };
  if (homeScore !== undefined) row.home_score = homeScore;
  if (awayScore !== undefined) row.away_score = awayScore;
  return row;
}

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

function Stepper({ value, onChange, label }) {
  const n = Number.isFinite(value) ? value : 0;
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, n - 1))}
        disabled={n <= 0}
        aria-label={`${label}: one less`}
        className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-ink-900 transition-colors active:bg-slate-200 disabled:opacity-30"
      >
        <Minus className="h-5 w-5" />
      </button>
      <span className="w-10 text-center font-display text-3xl font-black tabular-nums text-ink-900" aria-live="polite">
        {n}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(99, n + 1))}
        aria-label={`${label}: one more`}
        className="grid h-12 w-12 place-items-center rounded-xl bg-brand-600 text-white transition-colors active:bg-brand-700"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}

function StatusPill({ status }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-red-600 ring-1 ring-red-200">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> Live
      </span>
    );
  }
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ring-1',
        status === 'ft' ? 'bg-slate-100 text-slate-600 ring-slate-200' : 'bg-gold-500/10 text-gold-600 ring-gold-500/30',
      )}
    >
      {status === 'ft' ? 'Full time' : 'Upcoming'}
    </span>
  );
}

/** Compact logo picker for the match form: badge preview, upload, or link. */
function LogoPicker({ team, onLogo }) {
  const fileRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [showLink, setShowLink] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    try {
      setProgress(0);
      const url = await uploadFile(await prepareImage(file, 'logo'), 'teams', setProgress);
      onLogo(url);
    } catch (err) {
      setError(friendlyUploadError(err));
      setShowLink(true);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="relative">
          <TeamBadge name={team.name} logo={team.logo} className="h-14 w-14 text-base ring-slate-200" />
          {progress !== null && (
            <span className="absolute inset-0 grid place-items-center rounded-full bg-white/85 text-[11px] font-bold text-brand-700">
              {Math.round(progress * 100)}%
            </span>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="sr-only" tabIndex={-1} />
        <Btn size="sm" variant="secondary" className="whitespace-nowrap" onClick={() => fileRef.current?.click()} disabled={progress !== null}>
          <Upload className="h-4 w-4" /> {team.logo ? 'Change logo' : 'Add logo'}
        </Btn>
        <button type="button" onClick={() => setShowLink((v) => !v)} className="text-xs font-semibold text-brand-600 hover:underline">
          or paste link
        </button>
        {team.logo && (
          <button type="button" onClick={() => onLogo('')} aria-label="Remove logo" className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {showLink && (
        <input
          type="url"
          inputMode="url"
          value={team.logo || ''}
          onChange={(e) => onLogo(e.target.value.trim())}
          placeholder="https://…/logo.png"
          className={cn(inputClass, 'mt-2')}
          aria-label="Logo link"
        />
      )}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function TeamEditor({ label, team, onChange, recentTeams, opponent }) {
  // Don't offer the team already in this slot, or the one it's playing.
  const skip = new Set([team.name, opponent?.name].map((n) => (n || '').trim().toLowerCase()));
  const suggestions = recentTeams.filter((t) => !skip.has(t.name.toLowerCase())).slice(0, 8);
  return (
    <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-3.5">
      <legend className="px-1.5 text-sm font-bold text-ink-900">{label}</legend>
      <input
        value={team.name}
        onChange={(e) => onChange({ ...team, name: e.target.value })}
        placeholder="Team name"
        className={inputClass}
        aria-label={`${label} name`}
      />
      {suggestions.length > 0 && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {suggestions.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => onChange({ name: t.name, logo: t.logo })}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-1 pr-3 text-xs font-semibold text-ink-900 hover:bg-brand-50 hover:text-brand-700"
            >
              <TeamBadge name={t.name} logo={t.logo} className="h-6 w-6 text-[9px] ring-slate-200" />
              {t.name}
            </button>
          ))}
        </div>
      )}
      <LogoPicker team={team} onLogo={(logo) => onChange({ ...team, logo })} />
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */
/*  Add / edit sheet                                                          */
/* -------------------------------------------------------------------------- */

function MatchSheet({ initial, isNew, recentTeams, recentVenues, recentCompetitions, recentAgeGroups, onClose, onSave, onDelete }) {
  const [m, setM] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (patch) => setM((x) => ({ ...x, ...patch }));

  const setStatus = (status) => {
    // Going live starts the clock at 0-0 rather than blank.
    if (status !== 'upcoming' && !Number.isFinite(m.homeScore)) set({ status, homeScore: 0, awayScore: 0 });
    else set({ status });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!m.home.name.trim() || !m.away.name.trim()) {
      setError('Both teams need a name.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(m.kickoff || '')) {
      setError('Pick a date and kick-off time.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSave(toDoc(m));
    } catch (err) {
      setError(friendlyDbError(err));
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${m.home.name} vs ${m.away.name}? This can’t be undone.`)) return;
    setBusy(true);
    try {
      await onDelete();
    } catch (err) {
      setError(friendlyDbError(err));
      setBusy(false);
    }
  };

  // Escape closes, like every other dialog.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'Add match' : 'Edit match'}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        noValidate
        className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-display text-lg font-black uppercase text-ink-900">{isNew ? 'Add match' : 'Edit match'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <FieldShell label="Competition (optional)" htmlFor="m-comp">
              <input
                id="m-comp"
                list="m-comp-list"
                value={m.competition}
                onChange={(e) => set({ competition: e.target.value })}
                placeholder="e.g. Kickerz Cup"
                className={inputClass}
              />
              <datalist id="m-comp-list">
                {recentCompetitions.map((c) => <option key={c} value={c} />)}
              </datalist>
            </FieldShell>

            <FieldShell label="Age group (optional)" htmlFor="m-age">
              <input
                id="m-age"
                list="m-age-list"
                value={m.ageGroup}
                onChange={(e) => set({ ageGroup: e.target.value })}
                placeholder="e.g. U12"
                className={inputClass}
              />
              <datalist id="m-age-list">
                {recentAgeGroups.map((a) => <option key={a} value={a} />)}
              </datalist>
            </FieldShell>
          </div>

          <TeamEditor label="Home team" team={m.home} opponent={m.away} onChange={(home) => set({ home })} recentTeams={recentTeams} />

          <div className="flex justify-center">
            <Btn size="sm" variant="ghost" onClick={() => set({ home: m.away, away: m.home, homeScore: m.awayScore, awayScore: m.homeScore })}>
              <ArrowLeftRight className="h-4 w-4" /> Swap home & away
            </Btn>
          </div>

          <TeamEditor label="Away team" team={m.away} opponent={m.home} onChange={(away) => set({ away })} recentTeams={recentTeams} />

          <FieldShell label="Status">
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
              {MATCH_STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  aria-pressed={m.status === s.value}
                  className={cn(
                    'min-h-11 rounded-lg text-sm font-bold transition-colors',
                    m.status === s.value ? (s.value === 'live' ? 'bg-red-600 text-white' : 'bg-white text-ink-900 shadow-sm') : 'text-slate-500',
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </FieldShell>

          {m.status !== 'upcoming' && (
            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-bold text-ink-900">{m.home.name || 'Home'}</span>
                <Stepper value={m.homeScore} onChange={(v) => set({ homeScore: v })} label={`${m.home.name || 'Home'} score`} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-bold text-ink-900">{m.away.name || 'Away'}</span>
                <Stepper value={m.awayScore} onChange={(v) => set({ awayScore: v })} label={`${m.away.name || 'Away'} score`} />
              </div>
            </div>
          )}

          <FieldShell label="Date & kick-off time" htmlFor="m-kickoff" help="Local time at the venue - shown on the site exactly as entered.">
            <input id="m-kickoff" type="datetime-local" value={m.kickoff} onChange={(e) => set({ kickoff: e.target.value })} className={inputClass} />
          </FieldShell>

          <FieldShell label="Venue" htmlFor="m-venue">
            <input id="m-venue" list="m-venue-list" value={m.venue} onChange={(e) => set({ venue: e.target.value })} className={inputClass} />
            <datalist id="m-venue-list">
              {recentVenues.map((v) => <option key={v} value={v} />)}
            </datalist>
          </FieldShell>

          {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3.5">
          {!isNew && (
            <Btn variant="danger" onClick={remove} disabled={busy} aria-label="Delete match">
              <Trash2 className="h-4 w-4" />
            </Btn>
          )}
          <Btn variant="ghost" onClick={onClose} disabled={busy} className="ml-auto">
            Cancel
          </Btn>
          <Btn type="submit" disabled={busy} className="min-w-32">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isNew ? 'Add match' : 'Save'}
          </Btn>
        </div>
      </motion.form>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Match card with the quick actions                                         */
/* -------------------------------------------------------------------------- */

function MatchRow({ match, onQuick, onScore, onEdit, pending }) {
  const { date, time } = formatKickoff(match.kickoff);
  const live = match.status === 'live';

  return (
    <li className={cn('rounded-2xl bg-white p-4 shadow-sm ring-1', live ? 'ring-red-200' : 'ring-slate-200')}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 truncate text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span className="truncate">{match.competition || 'Match'}</span>
          {match.ageGroup && (
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-600">
              {match.ageGroup}
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {pending && <Spinner className="h-3.5 w-3.5 text-slate-400" />}
          <StatusPill status={match.status} />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {[
          ['home', 'homeScore'],
          ['away', 'awayScore'],
        ].map(([side, scoreKey]) => (
          <div key={side} className="flex items-center gap-3">
            <TeamBadge name={match[side]?.name} logo={match[side]?.logo} className="h-10 w-10 text-xs ring-slate-200" />
            <span className="line-clamp-2 min-w-0 flex-1 font-bold leading-tight text-ink-900">{match[side]?.name}</span>
            {live ? (
              <Stepper value={match[scoreKey]} onChange={(v) => onScore(match, scoreKey, v)} label={`${match[side]?.name} score`} />
            ) : match.status === 'ft' ? (
              <span className="w-10 text-center font-display text-2xl font-black tabular-nums text-ink-900">{match[scoreKey] ?? '-'}</span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" /> {date} · {time}
        </span>
        {match.venue && (
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{match.venue}</span>
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        {match.status === 'upcoming' && (
          <Btn className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => onQuick(match, { status: 'live', homeScore: match.homeScore ?? 0, awayScore: match.awayScore ?? 0 })}>
            <Play className="h-4 w-4" /> Kick off
          </Btn>
        )}
        {live && (
          <Btn variant="gold" className="flex-1" onClick={() => onQuick(match, { status: 'ft' })}>
            <Flag className="h-4 w-4" /> Full time
          </Btn>
        )}
        <Btn variant="secondary" onClick={() => onEdit(match)} className={match.status === 'ft' ? 'flex-1' : ''}>
          <Pencil className="h-4 w-4" /> Edit
        </Btn>
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Match entry, built to be used on a phone at the side of the pitch.
 *
 * The common jobs are one tap from the list, no form needed: "Kick off" an
 * upcoming fixture, tap +/- as goals go in, "Full time" at the end. The form
 * is for creating fixtures and fixing mistakes. Teams used before are
 * offered as chips, so an opponent's logo only ever has to be uploaded once.
 */
export default function Scores() {
  const toast = useToast();
  const [matches, setMatches] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [sheet, setSheet] = useState(null); // { match, isNew }
  const [pending, setPending] = useState({}); // id -> true while a score is unsaved
  const timers = useRef({}); // id -> debounce timer for score taps
  const latest = useRef({}); // id -> newest scores tapped, waiting to be written
  const chains = useRef({}); // id -> tail of that match's write queue
  const inflight = useRef({}); // id -> writes sent but not yet acknowledged

  // "Unsaved" means a tap is still waiting out its debounce, or a write is
  // still on its way to the server - either one.
  const refreshPending = useCallback((id) => {
    setPending((p) => ({ ...p, [id]: Boolean(timers.current[id]) || (inflight.current[id] || 0) > 0 }));
  }, []);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const { data, error } = await getSupabase()
        .from(MATCHES_TABLE)
        .select(SELECT_COLUMNS)
        .order('kickoff', { ascending: false })
        .limit(100);
      if (error) throw error;
      setMatches(data.map(rowToMatch));
      setLoadState('ready');
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      toast(friendlyDbError(error), 'error');
      setLoadState('error');
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Writes to one match run strictly one after another, so a burst of taps
   * can never land out of order and leave the wrong score on the site.
   */
  const write = useCallback(
    (id, patch) => {
      inflight.current[id] = (inflight.current[id] || 0) + 1;
      refreshPending(id);
      // updated_at isn't sent - the matches_set_meta trigger (schema.sql)
      // fills it in. .select().single() both confirms the row actually
      // changed (an update() the admin allowlist has since lost access to
      // would otherwise just silently match zero rows, with no error) and
      // hands back the server's own copy, in case it differs from ours.
      const run = async () => {
        const { error } = await getSupabase()
          .from(MATCHES_TABLE)
          .update(scorePatchToRow(patch))
          .eq('id', id)
          .select('id')
          .single();
        if (error) throw error;
      };
      const next = (chains.current[id] || Promise.resolve()).then(run, run);
      chains.current[id] = next.catch(() => {});
      next
        .catch((error) => {
          toast(friendlyDbError(error), 'error');
          load(); // put the list back to what the server actually has
        })
        .finally(() => {
          inflight.current[id] -= 1;
          refreshPending(id);
        });
      return next;
    },
    [toast, load, refreshPending],
  );

  const flushScore = useCallback(
    (id) => {
      clearTimeout(timers.current[id]);
      timers.current[id] = null;
      const scores = latest.current[id];
      if (scores) {
        delete latest.current[id];
        write(id, scores);
      }
    },
    [write],
  );

  // Leaving the page mid-debounce must still save the last goal tapped -
  // send anything waiting now rather than dropping it.
  const flushRef = useRef(flushScore);
  flushRef.current = flushScore;
  useEffect(
    () => () => Object.keys(latest.current).forEach((id) => flushRef.current(id)),
    [],
  );

  // And closing the tab with a score unsaved asks first.
  const anyPending = Object.values(pending).some(Boolean);
  useEffect(() => {
    if (!anyPending) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [anyPending]);

  const quick = (match, patch) => {
    // A goal tapped just before "Full time" goes out first, not after.
    flushScore(match.id);
    setMatches((all) => all.map((m) => (m.id === match.id ? { ...m, ...patch } : m)));
    write(match.id, patch).then(() => {
      if (patch.status === 'live') toast(`${match.home.name} vs ${match.away.name} is live on the site.`);
      if (patch.status === 'ft') toast('Full time - result saved.');
    }, () => {});
  };

  const score = (match, key, value) => {
    // `match` is what's on screen, which already includes every earlier tap
    // (each one re-renders), so this is the true newest pair of scores.
    const updated = { ...match, [key]: value };
    latest.current[match.id] = { homeScore: updated.homeScore ?? 0, awayScore: updated.awayScore ?? 0 };
    setMatches((all) => all.map((m) => (m.id === match.id ? updated : m)));

    clearTimeout(timers.current[match.id]);
    timers.current[match.id] = setTimeout(() => flushScore(match.id), SCORE_SAVE_DELAY);
    refreshPending(match.id);
  };

  const saveSheet = async (data) => {
    // created_at / updated_at aren't sent - matches_set_meta (schema.sql)
    // fills both in.
    if (sheet.isNew) {
      const { data: row, error } = await getSupabase()
        .from(MATCHES_TABLE)
        .insert(matchToRow(data))
        .select(SELECT_COLUMNS)
        .single();
      if (error) throw error;
      setMatches((all) => [rowToMatch(row), ...all]);
      toast('Match added - it’s on the site now.');
    } else {
      const { error } = await getSupabase()
        .from(MATCHES_TABLE)
        .update(matchToRow(data))
        .eq('id', sheet.match.id)
        .select('id')
        .single(); // throws if RLS matched zero rows, rather than silently no-op'ing
      if (error) throw error;
      setMatches((all) => all.map((m) => (m.id === sheet.match.id ? { ...m, ...data } : m)));
      toast('Match updated.');
    }
    setSheet(null);
  };

  const deleteSheet = async () => {
    const { error } = await getSupabase()
      .from(MATCHES_TABLE)
      .delete()
      .eq('id', sheet.match.id)
      .select('id')
      .single(); // same reasoning: confirm a row actually went, don't assume it
    if (error) throw error;
    setMatches((all) => all.filter((m) => m.id !== sheet.match.id));
    setSheet(null);
    toast('Match deleted.');
  };

  // Everything the form can suggest, drawn from matches already entered.
  const { recentTeams, recentVenues, recentCompetitions, recentAgeGroups } = useMemo(() => {
    const teams = new Map([[HOME_TEAM.name.toLowerCase(), HOME_TEAM]]);
    const venues = new Set();
    const comps = new Set();
    const ageGroups = new Set();
    for (const m of matches) {
      for (const t of [m.home, m.away]) {
        const key = t?.name?.trim().toLowerCase();
        if (key && !teams.has(key)) teams.set(key, { name: t.name.trim(), logo: t.logo || '' });
        // Keep the most recent logo for a team, in case it was only added later.
        if (key && teams.has(key) && !teams.get(key).logo && t.logo) teams.set(key, { ...teams.get(key), logo: t.logo });
      }
      if (m.venue) venues.add(m.venue);
      if (m.competition) comps.add(m.competition);
      if (m.ageGroup) ageGroups.add(m.ageGroup);
    }
    return { recentTeams: [...teams.values()], recentVenues: [...venues], recentCompetitions: [...comps], recentAgeGroups: [...ageGroups] };
  }, [matches]);

  const groups = useMemo(
    () => [
      { key: 'live', title: 'Live now', items: matches.filter((m) => m.status === 'live') },
      { key: 'upcoming', title: 'Upcoming', items: matches.filter((m) => m.status === 'upcoming').sort((a, b) => a.kickoff.localeCompare(b.kickoff)) },
      { key: 'ft', title: 'Results', items: matches.filter((m) => m.status === 'ft') },
    ],
    [matches],
  );

  return (
    <div className="mx-auto max-w-2xl px-3 pb-16 pt-4 sm:px-5 sm:pt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black uppercase text-ink-900">Scores</h1>
          <p className="text-sm text-slate-500">Changes show on the site straight away.</p>
        </div>
        <Btn variant="ghost" onClick={load} aria-label="Refresh" disabled={loadState === 'loading'}>
          <RefreshCw className={cn('h-4 w-4', loadState === 'loading' && 'animate-spin')} />
        </Btn>
      </div>

      <Btn
        size="lg"
        className="mt-4 w-full"
        onClick={() => setSheet({ match: blankMatch(matches[0]?.venue), isNew: true })}
        disabled={loadState === 'loading'}
      >
        <Plus className="h-5 w-5" /> Add match
      </Btn>

      {loadState === 'loading' && matches.length === 0 && (
        <div className="grid place-items-center py-16 text-slate-400">
          <Spinner />
        </div>
      )}

      {loadState !== 'loading' && matches.length === 0 && (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center">
          <p className="font-semibold text-ink-900">No matches yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Add your first fixture and the Match Centre section appears on the site.
          </p>
        </div>
      )}

      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <section key={g.key} className="mt-7">
              <h2 className="mb-2.5 px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                {g.title} <span className="text-slate-400">({g.items.length})</span>
              </h2>
              <ul className="space-y-3">
                {g.items.map((m) => (
                  <MatchRow
                    key={m.id}
                    match={m}
                    pending={pending[m.id]}
                    onQuick={quick}
                    onScore={score}
                    onEdit={(match) => setSheet({ match: { ...blankMatch(), ...match }, isNew: false })}
                  />
                ))}
              </ul>
            </section>
          ),
      )}

      <AnimatePresence>
        {sheet && (
          <MatchSheet
            key={sheet.match.id || 'new'}
            initial={sheet.match}
            isNew={sheet.isNew}
            recentTeams={recentTeams}
            recentVenues={recentVenues}
            recentCompetitions={recentCompetitions}
            recentAgeGroups={recentAgeGroups}
            onClose={() => setSheet(null)}
            onSave={saveSheet}
            onDelete={deleteSheet}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
