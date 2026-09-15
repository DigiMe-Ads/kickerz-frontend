import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '../../lib/cn';

/**
 * Small building blocks for the admin. Everything is sized for thumbs:
 * controls are at least 44px tall, because the Scores page in particular
 * gets used one-handed at the side of a pitch.
 */

const BTN_VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300',
  secondary: 'bg-white text-ink-900 ring-1 ring-slate-200 hover:bg-slate-50 disabled:text-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-ink-900 disabled:text-slate-300',
  danger: 'bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50 disabled:text-red-300',
  gold: 'bg-gold-500 text-ink-900 hover:bg-gold-400',
};

export function Btn({ variant = 'primary', size = 'md', className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed',
        size === 'sm' ? 'min-h-9 px-3 text-sm' : size === 'lg' ? 'min-h-14 px-6 text-base' : 'min-h-11 px-4 text-sm',
        BTN_VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export const inputClass =
  'block w-full min-h-11 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-ink-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100';

export function FieldShell({ label, help, htmlFor, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink-900">
          {label}
        </label>
      )}
      {children}
      {help && <p className="text-xs leading-relaxed text-slate-500">{help}</p>}
    </div>
  );
}

export function Spinner({ className }) {
  return (
    <span
      className={cn('inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      aria-hidden="true"
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Toasts                                                                    */
/* -------------------------------------------------------------------------- */

const ToastContext = createContext(() => {});

export function ToastHost({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, tone = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 7000 : 3500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-2 px-4"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className={cn(
                'pointer-events-auto flex max-w-md items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg',
                t.tone === 'error' ? 'bg-red-600 text-white' : 'bg-ink-900 text-white',
              )}
            >
              {t.tone === 'error' ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              )}
              <span className="flex-1">{t.message}</span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
                className="-mr-1 opacity-70 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/** toast('Saved') or toast('Could not save', 'error') */
export function useToast() {
  return useContext(ToastContext);
}

/**
 * Postgres/PostgREST error codes an admin can realistically hit, in plain
 * English. `error.code` here is either a Postgres SQLSTATE (from a rejected
 * write - RLS denial, a CHECK constraint, a bad value) or a PostgREST code
 * (from the request layer, e.g. a stale/expired session).
 */
export function friendlyDbError(error) {
  switch (error?.code) {
    case '42501': // insufficient_privilege - RLS denied the write
      return 'Not allowed. Either this account isn’t an admin, or supabase/schema.sql hasn’t been run yet.';
    case 'PGRST116': // .single() got zero rows back - the row was never written, or RLS hid it
      return 'That didn’t go through. Either this account isn’t an admin, or supabase/schema.sql hasn’t been run yet.';
    case 'PGRST301': // JWT expired
    case '401':
      return 'Your session has expired. Sign in again and retry.';
    case '23514': // check_violation
      return 'Something in this form couldn’t be saved. Check for anything unusual and try again.';
    case '23505': // unique_violation
      return 'Something with that name already exists.';
    case '22001': // string too long for the column
      return 'One of these fields is too long. Trim it down and try again.';
    default:
      if (!error?.code && /fetch|network/i.test(error?.message || '')) {
        return 'Can’t reach the database. Check your connection and try again.';
      }
      return 'Couldn’t save. Please try again.';
  }
}
