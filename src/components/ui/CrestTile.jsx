import { cn } from '../../lib/cn';

/**
 * Stand-in used wherever a team photograph has not been supplied yet.
 *
 * Rather than a grey box or a broken image, it renders the club crest on the
 * brand gradient with a faint pitch-line texture, so a roster that is only
 * partly photographed still looks deliberate. Swap it out simply by setting
 * `image` on the member in data/team.js.
 */
export default function CrestTile({ className, label }) {
  return (
    <div
      className={cn(
        'relative grid h-full w-full place-items-center overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800',
        className,
      )}
      role="img"
      aria-label={label || 'Colombo Kickerz crest'}
    >
      <div className="absolute inset-0 bg-pitch-lines opacity-60" />
      {/* soft light sweep so the tile is not flat */}
      <div className="absolute -inset-x-10 -top-24 h-48 rotate-12 bg-white/10 blur-3xl" />
      <img
        src="/images/logo.png"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="relative w-1/2 max-w-[130px] opacity-90 drop-shadow-[0_10px_24px_rgb(0_0_0/0.35)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
      />
    </div>
  );
}
