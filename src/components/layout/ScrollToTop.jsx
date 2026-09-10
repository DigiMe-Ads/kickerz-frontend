import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useScrolled } from '../../hooks/useScrolled';
import { useElementInView } from '../../hooks/useElementInView';

/**
 * Appears after the first viewport and returns the visitor to the hero.
 * Ducks out once the footer is on screen - fixed bottom-right, it would
 * otherwise sit on top of the footer's own legal links at the bottom of
 * every page.
 */
export default function ScrollToTop() {
  const scrolled = useScrolled(600);
  const nearFooter = useElementInView('site-footer');
  const show = scrolled && !nearFooter;

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-brand-600 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-brand-700"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
