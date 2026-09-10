import { AnimatePresence, motion } from 'framer-motion';
import { X, Phone, Mail, MapPin } from 'lucide-react';
import { navAll } from '../../data/navigation';
import { site } from '../../data/site';
import { resolveHref } from '../../lib/nav';
import Button from '../ui/Button';

/**
 * Full-height slide-in navigation for small screens.
 * Closes on link click, on the backdrop, and on Escape (handled in Header).
 */
export default function MobileMenu({ open, onClose, activeId, pathname }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-ink-950/70 backdrop-blur-sm lg:hidden"
          />

          <motion.nav
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-[86%] max-w-sm flex-col bg-white shadow-2xl lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <img src={site.logo} alt={site.fullName} className="h-12 w-auto" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-ink-900 transition-colors hover:bg-brand-600 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto px-6 py-6">
              {navAll.map((link, i) => {
                const isActive = activeId && link.href === `#${activeId}`;
                return (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.045 }}
                  >
                    <a
                      href={resolveHref(link.href, pathname)}
                      onClick={onClose}
                      className={`flex items-center gap-3 border-b border-slate-100 py-4 font-display text-lg font-bold uppercase tracking-wide transition-colors ${
                        isActive ? 'text-brand-600' : 'text-ink-900 hover:text-brand-600'
                      }`}
                    >
                      <span className="font-sans text-[11px] font-semibold text-gold-600">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {link.label}
                    </a>
                  </motion.li>
                );
              })}
            </ul>

            <div className="space-y-3 border-t border-slate-100 bg-slate-50 px-6 py-6 text-sm text-slate-600">
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                {site.contact.address}
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-brand-600" />
                <a href={`tel:${site.contact.phones[0].replace(/\s/g, '')}`}>
                  {site.contact.phones[0]}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-brand-600" />
                <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              </p>
              <Button
                href={resolveHref('#contact', pathname)}
                onClick={onClose}
                variant="primary"
                className="mt-2 w-full"
              >
                Join The Academy
              </Button>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
