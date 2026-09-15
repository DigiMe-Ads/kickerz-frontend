import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabase } from '../lib/supabase';

const AuthContext = createContext(null);

/**
 * Who's signed in, and whether they're allowed to edit.
 *
 * Being signed in is not enough: an account is an admin only if its id has
 * a row in the `admins` table. That table can only be written from the
 * Supabase SQL Editor (see supabase/schema.sql - there is no insert policy
 * for any client role), so nobody can grant themselves access through this
 * app, however it's used.
 *
 * The check here only decides which screen to show. The real enforcement is
 * the same rule applied by every table's Row Level Security policy.
 */
export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, isAdmin: false, loading: true, checkError: null });

  useEffect(() => {
    const supabase = getSupabase();

    // onAuthStateChange fires immediately with the current session (or null)
    // on subscribe, so there's no separate getSession() call needed to seed
    // the initial state - see README "Admin & Supabase".
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      if (!user) {
        setState({ user: null, isAdmin: false, loading: false, checkError: null });
        return;
      }
      setState((s) => ({ ...s, user, loading: true }));
      try {
        const { data, error } = await supabase.from('admins').select('id').eq('id', user.id).maybeSingle();
        if (error) throw error;
        setState({ user, isAdmin: Boolean(data), loading: false, checkError: null });
      } catch (error) {
        // Most often the SQL in supabase/schema.sql hasn't been run yet
        // (the admins table doesn't exist), which looks identical to "not
        // an admin" from here - so say so on the screen instead of guessing.
        setState({ user, isAdmin: false, loading: false, checkError: error?.code || error?.message || 'unknown' });
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email) => {
    // Where this actually lands depends on the Redirect URLs allowed in the
    // Supabase dashboard (Authentication -> URL Configuration) - it must
    // include this site's /admin for the link in the email to work.
    await getSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin`,
    });
  }, []);

  const value = useMemo(
    () => ({ ...state, signIn, signOut, resetPassword }),
    [state, signIn, signOut, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Plain-English messages for the Supabase Auth errors an admin can actually hit. */
export function friendlyAuthError(error) {
  switch (error?.code) {
    case 'invalid_credentials':
      return 'That email and password don’t match an admin account.';
    case 'email_address_invalid':
    case 'validation_failed':
      return 'That doesn’t look like a valid email address.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Too many attempts. Wait a few minutes, or reset your password.';
    case 'user_banned':
      return 'This account has been disabled.';
    case 'user_not_found':
      return 'That email and password don’t match an admin account.';
    default:
      if (error?.name === 'AuthRetryableFetchError' || !error?.status) {
        return 'Can’t reach the server. Check your connection and try again.';
      }
      return 'Something went wrong signing in. Please try again.';
  }
}
