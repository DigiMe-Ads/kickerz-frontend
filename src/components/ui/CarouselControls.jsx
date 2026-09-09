import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

/**
 * Circular prev/next buttons that sit over the edges of a carousel, matching
 * the reference design. Rendered as real <button>s with labels so keyboard and
 * screen-reader users get the same controls.
 */
export function CarouselArrow({ direction, onClick, tone = 'blue', className }) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;

  const tones = {
    blue: 'bg-brand-600 text-white hover:bg-brand-700',
    gold: 'bg-gold-500 text-ink-900 hover:bg-gold-400',
    light: 'bg-white text-brand-700 ring-1 ring-slate-200 hover:bg-brand-50',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous slide' : 'Next slide'}
      className={cn(
        'grid h-11 w-11 place-items-center rounded-full shadow-lg transition-all duration-300',
        'hover:scale-110 active:scale-95',
        tones[tone],
        className,
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}

/** Above this many slides, individual dots stop being clickable targets and
 *  start being visual noise, so we show a progress bar and a count instead. */
const MAX_DOTS = 8;

/** Position indicator: dots for short carousels, a progress bar for long ones. */
export function CarouselDots({ count, selectedIndex, onSelect, tone = 'blue', className }) {
  if (!count) return null;

  const light = tone === 'light';

  if (count > MAX_DOTS) {
    const progress = ((selectedIndex + 1) / count) * 100;

    return (
      <div className={cn('flex items-center justify-center gap-3', className)}>
        <span
          className={cn(
            'h-1.5 w-40 overflow-hidden rounded-full sm:w-56',
            light ? 'bg-white/25' : 'bg-brand-100',
          )}
        >
          <span
            style={{ width: `${progress}%` }}
            className={cn(
              'block h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
              light ? 'bg-gold-500' : 'bg-brand-600',
            )}
          />
        </span>
        <span
          className={cn(
            'font-display text-[11px] font-bold tabular-nums tracking-wider',
            light ? 'text-white/70' : 'text-slate-500',
          )}
        >
          {selectedIndex + 1} / {count}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === selectedIndex}
          className={cn(
            'h-2 rounded-full transition-all duration-500',
            i === selectedIndex ? 'w-7' : 'w-2 opacity-40 hover:opacity-70',
            light ? 'bg-white' : 'bg-brand-600',
          )}
        />
      ))}
    </div>
  );
}

export default CarouselArrow;
