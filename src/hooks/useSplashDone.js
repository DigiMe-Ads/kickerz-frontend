import { useEffect, useState } from 'react';

/**
 * Splash-screen timing. True once the splash has earned its exit, which
 * means both of:
 *
 *   - the page's own `load` event has fired (hero image, fonts, bundle), so
 *     the site behind the splash is actually ready rather than half-painted;
 *   - `minimum` ms have passed, so the kick animation is never cut off part
 *     way through on a warm cache.
 *
 * `timeout` is the safety valve: one slow asset must never leave a visitor
 * staring at a curtain.
 */
export function useSplashDone({ minimum = 2400, timeout = 8000, enabled = true } = {}) {
  const [loaded, setLoaded] = useState(() => document.readyState === 'complete');
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    if (!enabled || loaded) return undefined;

    const finish = () => setLoaded(true);
    window.addEventListener('load', finish);
    const bail = window.setTimeout(finish, timeout);

    return () => {
      window.removeEventListener('load', finish);
      window.clearTimeout(bail);
    };
  }, [enabled, loaded, timeout]);

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = window.setTimeout(() => setMinElapsed(true), minimum);
    return () => window.clearTimeout(timer);
  }, [enabled, minimum]);

  return !enabled || (loaded && minElapsed);
}

export default useSplashDone;
