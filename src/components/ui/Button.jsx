import { cn } from '../../lib/cn';

const VARIANTS = {
  /** Solid brand blue - the main call to action. */
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 shadow-[0_12px_30px_-12px_rgb(52_74_167/0.8)]',
  /** Gold - used sparingly, for the single highest-intent action on screen. */
  gold: 'bg-gold-500 text-ink-900 hover:bg-gold-400 shadow-[0_12px_30px_-12px_rgb(251_199_42/0.9)]',
  /** Outlined, for use over photography and on dark panels. */
  outline:
    'border border-white/70 text-white hover:bg-white hover:text-brand-700 backdrop-blur-sm',
  /** Outlined, for use on light backgrounds. */
  ghost:
    'border border-brand-200 text-brand-700 hover:border-brand-600 hover:bg-brand-50',
};

const SIZES = {
  sm: 'px-5 py-2.5 text-[11px]',
  md: 'px-7 py-3.5 text-xs',
  lg: 'px-9 py-4 text-[13px]',
};

/**
 * Pill button. Renders an <a> when `href` is given, otherwise a <button>.
 * The sheen sweeps across on hover - a small touch that carries the sporty
 * feel of the reference design without being distracting.
 */
export default function Button({
  as,
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  const Tag = as || (href ? 'a' : 'button');

  return (
    <Tag
      href={href}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-display font-bold uppercase tracking-[0.14em]',
        'transition-[transform,background-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:-translate-y-0.5 active:translate-y-0',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      {/* hover sheen */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-shine"
      />
    </Tag>
  );
}
