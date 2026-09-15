import { useState } from 'react';
import { Copy, Check, ShieldAlert } from 'lucide-react';
import { useAuth } from '../auth';
import { Btn } from './ui';

/**
 * Signed in, but not (yet) an admin.
 *
 * During first-time setup this is expected: an account only becomes an
 * admin once it has a row in the `admins` table. So the screen hands over
 * the exact SQL to run for that - see grant_admin() in supabase/schema.sql -
 * instead of making someone go hunting for a user id in the dashboard.
 */
export default function NotAuthorized() {
  const { user, signOut, checkError } = useAuth();
  const [copied, setCopied] = useState(false);

  const sql = `select public.grant_admin('${user?.email ?? ''}');`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the SQL is selectable on screen anyway */
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-500/15 text-gold-600">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-display text-xl font-black uppercase text-ink-900">Not an admin yet</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          You’re signed in as <strong className="text-ink-900">{user?.email}</strong>, but this account
          hasn’t been given admin access.
        </p>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">To grant access</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            In the Supabase dashboard, open <strong>SQL Editor → New query</strong>, paste this, and run
            it:
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="min-w-0 flex-1 select-all break-all rounded-lg bg-white px-3 py-2 font-mono text-xs text-ink-900 ring-1 ring-slate-200">
              {sql}
            </code>
            <Btn variant="secondary" size="sm" onClick={copy} aria-label="Copy SQL">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Btn>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Then refresh this page. (This only works for an account that already exists in
            Authentication → Users - create it there first if it doesn’t yet.)
          </p>
        </div>

        {checkError && (
          <p className="mt-4 rounded-xl bg-gold-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-ink-900">
            Checking admin access failed ({checkError}). If you’ve already run the SQL above, the rest of{' '}
            <code className="rounded bg-white px-1 py-0.5 ring-1 ring-slate-200">supabase/schema.sql</code>{' '}
            probably hasn’t been run yet (see README “Admin &amp; Supabase”).
          </p>
        )}

        <Btn variant="secondary" className="mt-6 w-full" onClick={signOut}>
          Sign out
        </Btn>
      </div>
    </div>
  );
}
