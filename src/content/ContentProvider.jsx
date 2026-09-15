import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_CONTENT, CONTENT_KEYS } from './defaults';
import { sortMatchesForDisplay } from './matches';

const ContentContext = createContext(null);

const CACHE_KEY = 'ck:content:v1';

/**
 * How long a visitor waits on Supabase before the site gives up and shows
 * what it has. Deliberately short: this is the first load's critical path,
 * and the built-in content is a complete, good-looking fallback.
 */
const FETCH_TIMEOUT = 4000;

/** Matches visible in the Match Centre, and how often to recheck a live one. */
const MATCH_LIMIT = 24;
const LIVE_POLL_MS = 60_000;

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(value) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    /* storage full or blocked - the cache is an optimisation, not a need */
  }
}

/**
 * A section saved from the admin is laid over its default with a shallow
 * merge. Saves always write the whole section, so in practice this only
 * matters for fields added to the site after a section was last saved:
 * those fall back to their default instead of rendering as undefined.
 */
function mergeContent(remote) {
  const merged = {};
  for (const key of CONTENT_KEYS) {
    const override = remote?.[key];
    merged[key] =
      override && typeof override === 'object' && !Array.isArray(override)
        ? { ...DEFAULT_CONTENT[key], ...override }
        : DEFAULT_CONTENT[key];
  }
  return merged;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

async function fetchRemote() {
  // Imported on demand so Supabase is its own chunk, fetched in parallel
  // with the rest of the page instead of weighing down the main bundle.
  const { fetchAllContent, fetchMatches } = await import('../lib/db');

  const [rawContent, matches] = await Promise.all([fetchAllContent(), fetchMatches(MATCH_LIMIT)]);

  // _updatedAt / _updatedBy are the admin's save bookkeeping, not content -
  // and neither is meaningful once round-tripped through the JSON cache.
  const content = {};
  for (const [key, value] of Object.entries(rawContent)) {
    if (!CONTENT_KEYS.includes(key)) continue;
    const data = {};
    for (const [k, v] of Object.entries(value)) if (!k.startsWith('_')) data[k] = v;
    content[key] = data;
  }

  return { content, matches };
}

/**
 * Site content, from Supabase where the admin has saved it and from the
 * built-in defaults everywhere else.
 *
 * Load order, so nobody watches text swap in front of them:
 *   1. Render immediately from the last successful fetch (localStorage), or
 *      from the defaults on a first visit.
 *   2. Fetch from Supabase in the background and swap in anything newer.
 *      On a first visit that swap happens behind the splash screen, which
 *      waits for `ready` (see Preloader).
 *
 * If Supabase refuses (RLS not deployed yet), is unreachable, or is slow,
 * the site keeps whatever it rendered in step 1. It never blanks.
 */
export function ContentProvider({ children }) {
  const [state, setState] = useState(() => {
    const cached = readCache();
    return {
      content: mergeContent(cached?.content),
      matches: cached?.matches ?? [],
      ready: false,
      source: cached ? 'cache' : 'defaults',
    };
  });

  useEffect(() => {
    let cancelled = false;

    const load = () =>
      withTimeout(fetchRemote(), FETCH_TIMEOUT)
        .then((remote) => {
          if (cancelled) return;
          writeCache(remote);
          setState({
            content: mergeContent(remote.content),
            matches: remote.matches,
            ready: true,
            source: 'supabase',
          });
        })
        .catch((error) => {
          if (cancelled) return;
          if (import.meta.env.DEV) {
            console.info('[content] using built-in/cached content:', error?.code || error?.message);
          }
          setState((s) => ({ ...s, ready: true }));
        });

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // While a match is marked live, recheck the scores every minute. Supabase
  // does offer realtime subscriptions, but plain polling is enough here and
  // keeps this file dependency-free of that layer; a "LIVE" badge on a stale
  // score would be worse than no badge at all, which is the thing to avoid.
  const hasLive = state.matches.some((m) => m.status === 'live');
  useEffect(() => {
    if (!hasLive) return undefined;
    const timer = setInterval(() => {
      withTimeout(fetchRemote(), FETCH_TIMEOUT)
        .then((remote) => {
          writeCache(remote);
          setState((s) => ({ ...s, matches: remote.matches, content: mergeContent(remote.content) }));
        })
        .catch(() => {});
    }, LIVE_POLL_MS);
    return () => clearInterval(timer);
  }, [hasLive]);

  const value = useMemo(
    () => ({ ...state, displayMatches: sortMatchesForDisplay(state.matches) }),
    [state],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/** One section's content, e.g. useContent('hero'). */
export function useContent(key) {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>');
  return ctx.content[key];
}

/** Matches in display order: live, then upcoming (soonest first), then results. */
export function useMatches() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useMatches must be used inside <ContentProvider>');
  return ctx.displayMatches;
}

/** True once the Supabase fetch has settled either way. */
export function useContentReady() {
  return useContext(ContentContext)?.ready ?? true;
}
