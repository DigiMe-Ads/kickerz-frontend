import { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { useAuth, friendlyAuthError } from '../auth';
import { DEFAULT_CONTENT } from '../../content/defaults';
import { Btn, FieldShell, inputClass } from './ui';

/**
 * Sign-in only - there's deliberately no "create account". Admin accounts
 * are made in the Supabase dashboard and then added to the `admins` table;
 * see README "Admin & Supabase".
 */
export default function LoginScreen() {
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await signIn(email, password);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    setError('');
    setNotice('');
    if (!email.trim()) {
      setError('Enter your email above first, then press “Forgot password?” again.');
      return;
    }
    try {
      await resetPassword(email);
    } catch {
      /* Say the same thing either way - never reveal whether an email has an account. */
    }
    setNotice('If that email belongs to an admin account, a reset link is on its way.');
  };

  return (
    <div className="grid min-h-screen place-items-center bg-ink-950 px-4 py-10">
      <div className="pointer-events-none fixed inset-0 bg-pitch-lines opacity-40" />
      <form onSubmit={submit} className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl sm:p-8" noValidate>
        <div className="flex flex-col items-center text-center">
          <img src={DEFAULT_CONTENT.site.logo} alt="Colombo Kickerz" className="h-20 w-auto" />
          <h1 className="mt-4 font-display text-xl font-black uppercase text-ink-900">Admin Sign In</h1>
          <p className="mt-1 text-sm text-slate-500">Colombo Kickerz website</p>
        </div>

        <div className="mt-7 space-y-4">
          <FieldShell label="Email" htmlFor="admin-email">
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </FieldShell>
          <FieldShell label="Password" htmlFor="admin-password">
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />
          </FieldShell>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-4 rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm text-brand-800">
            {notice}
          </p>
        )}

        <Btn type="submit" size="lg" className="mt-6 w-full" disabled={busy || !email || !password}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
          {busy ? 'Signing in…' : 'Sign in'}
        </Btn>
        <button
          type="button"
          onClick={forgot}
          className="mt-3 block w-full py-2 text-center text-sm font-medium text-brand-600 hover:underline"
        >
          Forgot password?
        </button>
      </form>
    </div>
  );
}
