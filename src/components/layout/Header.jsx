import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { navLeft, navRight, navAll } from '../../data/navigation';
import { site } from '../../data/site';
import { useScrolled } from '../../hooks/useScrolled';
import { useActiveSection } from '../../hooks/useActiveSection';
import { cn } from '../../lib/cn';
import Button from '../ui/Button';
import MobileMenu from './MobileMenu';

const SECTION_IDS = navAll.map((l) => l.href.replace('#', ''));

/**
 * Sticky site header.
 *
 * Two visual states, matching the reference design:
 *   - over the hero: transparent with white links
 *   - once scrolled: white bar, dark links, condensed crest
 * The crest sits in the centre and overhangs the bar on desktop.
 */
export default function Header() {
  const scrolled = useScrolled(40);
  const activeId = useActiveSection(SECTION_IDS);
  const [menuOpen, setMenuOpen] = useState(false);

  // Escape closes the drawer; lock body scroll while it is open.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const linkClass = (href) =>
    cn(
      'relative whitespace-nowrap font-display text-[13px] font-bold uppercase tracking-[0.08em] transition-colors duration-300',
      'after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-gold-500 after:transition-transform after:duration-300 hover:after:scale-x-100',
      scrolled ? 'text-ink-900 hover:text-brand-600' : 'text-white/90 hover:text-white',
      activeId && href === `#${activeId}` && 'after:scale-x-100',
      activeId && href === `#${activeId}` && (scrolled ? 'text-brand-600' : 'text-white'),
    );

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          scrolled
            ? 'bg-white/95 shadow-[0_10px_30px_-18px_rgb(15_23_42/0.5)] backdrop-blur-md'
            : 'bg-gradient-to-b from-ink-950/70 to-transparent',
        )}
      >
        {/* Wider than the shared Container - the nav needs more breathing room
            around the crest than the standard 1240px content width allows. */}
        <div className="relative mx-auto w-full max-w-360 px-5 sm:px-8">
          <div
            className={cn(
              'flex items-center justify-between transition-all duration-500',
              scrolled ? 'h-[72px]' : 'h-[88px]',
            )}
          >
            {/* Left nav (desktop) */}
            <nav
              className="hidden items-center gap-6 lg:flex lg:flex-1 lg:justify-end lg:pr-24"
              aria-label="Primary"
            >
              {navLeft.map((link) => (
                <a key={link.href} href={link.href} className={linkClass(link.href)}>
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Crest - centred on desktop, left-aligned on mobile */}
            <a
              href="#home"
              aria-label={`${site.fullName} home`}
              className="lg:absolute lg:left-1/2 lg:top-0 lg:-translate-x-1/2"
            >
              <div
                className={cn(
                  'grid place-items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                  'lg:rounded-b-3xl lg:bg-white lg:px-6 lg:shadow-[0_16px_36px_-18px_rgb(15_23_42/0.45)]',
                  scrolled ? 'lg:pb-2 lg:pt-1' : 'lg:pb-4 lg:pt-2',
                )}
              >
                <img
                  src={site.logo}
                  alt={site.fullName}
                  className={cn(
                    'w-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    scrolled ? 'h-12 lg:h-14' : 'h-14 lg:h-[86px]',
                  )}
                />
              </div>
            </a>

            {/* Right nav (desktop) */}
            <nav
              className="hidden items-center gap-6 lg:flex lg:flex-1 lg:justify-start lg:pl-24"
              aria-label="Secondary"
            >
              {navRight.map((link) => (
                <a key={link.href} href={link.href} className={linkClass(link.href)}>
                  {link.label}
                </a>
              ))}
              <Button href="#contact" variant={scrolled ? 'primary' : 'outline'} size="sm">
                Join Us
              </Button>
            </nav>

            {/* Mobile trigger */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className={cn(
                'grid h-11 w-11 place-items-center rounded-full transition-colors lg:hidden',
                scrolled
                  ? 'bg-brand-600 text-white'
                  : 'bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm',
              )}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} activeId={activeId} />
    </>
  );
}
