import { cn } from '../../lib/cn';

/**
 * Hexagonal icon badge - the shape motif that ties the card headers together.
 * Uses a CSS clip-path rather than an SVG mask so the icon inside stays a
 * normal, accessible React node.
 */
const HEX = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

export default function HexIcon({ children, tone = 'blue', size = 'md', className }) {
  const tones = {
    blue: 'bg-brand-600 text-white',
    gold: 'bg-gold-500 text-ink-900',
    dark: 'bg-ink-900 text-gold-500',
    outline: 'bg-white text-brand-600 ring-1 ring-brand-100',
  };

  const sizes = {
    sm: 'h-11 w-10 [&_svg]:h-4 [&_svg]:w-4',
    md: 'h-14 w-[52px] [&_svg]:h-5 [&_svg]:w-5',
    lg: 'h-[68px] w-[62px] [&_svg]:h-6 [&_svg]:w-6',
  };

  return (
    <span
      style={{ clipPath: HEX }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:-rotate-6',
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
