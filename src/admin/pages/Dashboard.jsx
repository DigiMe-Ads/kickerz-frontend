import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Check, Loader2, RotateCcw, Save, Trophy } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { fetchAllContent, CONTENT_TABLE } from '../../lib/db';
import { DEFAULT_CONTENT } from '../../content/defaults';
import { SECTIONS, SECTION_BY_KEY } from '../schema';
import { Fields, LinkSuggestions } from '../components/Field';
import { Btn, Spinner, useToast, friendlyDbError } from '../components/ui';
import { cn } from '../../lib/cn';

/** Save bookkeeping lives in underscore fields; the site ignores them. */
function stripMeta(data) {
  if (!data) return data;
  const clean = {};
  for (const [k, v] of Object.entries(data)) if (!k.startsWith('_')) clean[k] = v;
  return clean;
}

/** jsonb has no `undefined`; JSON.stringify quietly drops those keys instead. */
const toPlain = (value) => JSON.parse(JSON.stringify(value ?? {}));

/** What a section looks like right now: saved version over the default. */
function currentValue(key, remote) {
  const saved = remote[key];
  return toPlain(saved ? { ...DEFAULT_CONTENT[key], ...stripMeta(saved) } : DEFAULT_CONTENT[key]);
}

function formatSaved(saved) {
  if (!saved?._updatedAt) return null;
  const at = new Date(saved._updatedAt);
  if (Number.isNaN(at.getTime())) return null;
  const when = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(at);
  return saved._updatedBy ? `${when} by ${saved._updatedBy}` : when;
}

/**
 * The content dashboard: every section of the site, one editor each.
 *
 * Each section is one row in the `content` table (see supabase/schema.sql)
 * saved whole, so a save can never leave a section half-updated. `updated_at`
 * / `updated_by` are filled in by a database trigger, not sent from here -
 * a client can't backdate a save or claim someone else made it.
 * "Restore defaults" deletes the row, and the site falls back to its
 * built-in content.
 */
export default function Dashboard() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const activeKey = SECTION_BY_KEY[params.get('section')] ? params.get('section') : SECTIONS[0].key;
  const section = SECTION_BY_KEY[activeKey];

  const [remote, setRemote] = useState({});
  const [loadState, setLoadState] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);

  // The editor's working copy, tagged with the section and saved version it
  // was made from. It's re-seeded *during render* when either changes - an
  // effect would run a frame late, mounting the new section's fields over
  // the old section's data (lists would open empty and stay collapsed).
  const [editor, setEditor] = useState(() => {
    const value = currentValue(activeKey, {});
    return { key: activeKey, saved: undefined, draft: value, baseline: JSON.stringify(value) };
  });
  if (editor.key !== activeKey || editor.saved !== remote[activeKey]) {
    const value = currentValue(activeKey, remote);
    setEditor({ key: activeKey, saved: remote[activeKey], draft: value, baseline: JSON.stringify(value) });
  }
  const { draft, baseline } = editor;
  const setDraft = useCallback((next) => setEditor((e) => ({ ...e, draft: next })), []);

  const dirty = JSON.stringify(draft) !== baseline;

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      setRemote(await fetchAllContent());
      setLoadState('ready');
    } catch (error) {
      setLoadError(error);
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Closing the tab with unsaved edits asks first.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const selectSection = (key) => {
    if (key === activeKey) return;
    if (dirty && !window.confirm('You have unsaved changes in this section. Leave without saving?')) return;
    setParams({ section: key });
    window.scrollTo({ top: 0 });
  };

  const save = async () => {
    setSaving(true);
    try {
      // updated_at / updated_by aren't sent - the content_set_meta trigger
      // (schema.sql) fills them in from the request's own session, which is
      // both simpler here and not spoofable the way a client-sent value is.
      const { data, error } = await getSupabase()
        .from(CONTENT_TABLE)
        .upsert({ key: activeKey, data: toPlain(draft) }, { onConflict: 'key' })
        .select('key, data, updated_at, updated_by')
        .single();
      if (error) throw error;

      // Keep a local copy so the editor and status line update immediately.
      setRemote((r) => ({ ...r, [activeKey]: { ...data.data, _updatedAt: data.updated_at, _updatedBy: data.updated_by } }));
      toast(`${section.label} saved - it’s live on the site.`);
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      toast(friendlyDbError(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  const restoreDefaults = async () => {
    if (!window.confirm(`Put “${section.label}” back to the site’s original content? Your saved edits to this section will be deleted.`)) return;
    setSaving(true);
    try {
      const { error } = await getSupabase().from(CONTENT_TABLE).delete().eq('key', activeKey);
      if (error) throw error;
      setRemote((r) => {
        const next = { ...r };
        delete next[activeKey];
        return next;
      });
      toast(`${section.label} restored to the original content.`);
    } catch (error) {
      toast(friendlyDbError(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => setDraft(JSON.parse(baseline));

  const savedLine = useMemo(() => formatSaved(remote[activeKey]), [remote, activeKey]);
  const isCustomised = Boolean(remote[activeKey]);

  return (
    <div className="mx-auto max-w-7xl px-3 pb-32 pt-4 sm:px-5 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-6 lg:pt-6">
      <LinkSuggestions />

      {/* ---------- Section picker: dropdown on phones, sidebar on desktop ---------- */}
      <div className="mb-4 lg:hidden">
        <label htmlFor="section-picker" className="sr-only">
          Section
        </label>
        <select
          id="section-picker"
          value={activeKey}
          onChange={(e) => selectSection(e.target.value)}
          className="block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-base font-semibold text-ink-900"
        >
          {SECTIONS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
              {remote[s.key] ? ' (edited)' : ''}
            </option>
          ))}
        </select>
      </div>

      <nav aria-label="Sections" className="hidden lg:block">
        <ul className="sticky top-20 space-y-0.5">
          {SECTIONS.map((s) => (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => selectSection(s.key)}
                aria-current={s.key === activeKey ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-3 text-left text-sm font-semibold transition-colors',
                  s.key === activeKey ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-white/60 hover:text-ink-900',
                )}
              >
                {s.label}
                {remote[s.key] && <span className="h-1.5 w-1.5 rounded-full bg-gold-500" title="Edited" />}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ---------- Editor ---------- */}
      <main>
        {loadState === 'error' && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl bg-gold-500/10 p-4 text-sm text-ink-900 ring-1 ring-gold-500/30">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
            <div className="flex-1">
              <p className="font-semibold">Couldn’t load saved content.</p>
              <p className="mt-0.5 text-slate-600">{friendlyDbError(loadError)} Showing the built-in content for now.</p>
            </div>
            <Btn size="sm" variant="secondary" onClick={load}>
              Retry
            </Btn>
          </div>
        )}

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="min-w-0">
              <h1 className="font-display text-xl font-black uppercase text-ink-900 sm:text-2xl">{section.label}</h1>
              <p className="mt-1 text-sm text-slate-500">{section.description}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                {loadState === 'loading' ? (
                  <>
                    <Spinner className="h-3 w-3" /> Loading…
                  </>
                ) : isCustomised ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" /> Edited{savedLine ? ` · last saved ${savedLine}` : ''}
                  </>
                ) : (
                  'Showing the original content'
                )}
              </p>
            </div>
            {isCustomised && (
              <Btn size="sm" variant="ghost" onClick={restoreDefaults} disabled={saving}>
                <RotateCcw className="h-4 w-4" /> Restore original
              </Btn>
            )}
          </div>

          {activeKey === 'results' && (
            <Link
              to="/admin/scores"
              className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50 p-4 text-sm font-semibold text-brand-800 ring-1 ring-brand-100 hover:bg-brand-100"
            >
              <Trophy className="h-5 w-5" /> Add or update matches on the Scores page →
            </Link>
          )}

          {/* Keyed so each section starts with fresh editor state. Read-only
              until the saved content has loaded, so nothing typed in that
              first moment gets replaced when it arrives. */}
          <fieldset key={activeKey} disabled={loadState === 'loading'} className="mt-5 min-w-0 space-y-5 disabled:opacity-60">
            <Fields fields={section.fields} value={draft} onChange={setDraft} folder={activeKey} />
          </fieldset>
        </div>
      </main>

      {/* ---------- Save bar ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:px-5">
          <p className={cn('mr-auto text-sm font-medium', dirty ? 'text-gold-600' : 'text-slate-400')}>
            {dirty ? 'Unsaved changes' : 'All changes saved'}
          </p>
          {dirty && (
            <Btn variant="ghost" onClick={discard} disabled={saving}>
              Discard
            </Btn>
          )}
          <Btn onClick={save} disabled={!dirty || saving || loadState === 'loading'} className="min-w-28">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
