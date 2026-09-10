import { useEffect, useState } from 'react';

/**
 * True while the element with the given id is at least partly on screen.
 * Used to duck fixed-position UI (the back-to-top button) out of the way of
 * whatever it would otherwise sit on top of - see ScrollToTop.
 *
 * @param {string} id
 */
export function useElementInView(id) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return undefined;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '0px',
      threshold: 0,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [id]);

  return inView;
}

export default useElementInView;
