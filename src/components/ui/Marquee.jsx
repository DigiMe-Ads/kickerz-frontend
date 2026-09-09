import { cn } from '../../lib/cn';

/**
 * Infinite horizontal scroller.
 *
 * The children are rendered twice and the track is translated by -50%, which
 * makes the loop seamless. Hovering pauses it (see `.pause-on-hover` in
 * styles/index.css) so a visitor can actually look at a logo.
 */
export default function Marquee({
  children,
  speed = 'normal',
  reverse = false,
  className,
  fade = true,
}) {
  const animation = speed === 'slow' ? 'animate-marquee-slow' : 'animate-marquee';

  return (
    <div
      className={cn(
        'pause-on-hover relative flex w-full overflow-hidden',
        fade &&
          '[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        className,
      )}
    >
      <div
        className={cn('flex w-max shrink-0 items-center', animation)}
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {children}
        {/* Duplicate copy - the half the animation scrolls into view. */}
        <span aria-hidden="true" className="flex items-center">
          {children}
        </span>
      </div>
    </div>
  );
}
