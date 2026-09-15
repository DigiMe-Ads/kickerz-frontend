import { useState } from 'react';
import { cn } from '../../lib/cn';

function initials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  return words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * A team's crest in a white disc. Falls back to the team's initials when
 * there is no logo - or when the logo URL is dead, which happens more than
 * you'd hope with logos pasted in from other sites.
 */
export default function TeamBadge({ name, logo, className }) {
  const [broken, setBroken] = useState(false);
  const showLogo = logo && !broken;

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-[0_8px_24px_-12px_rgb(0_0_0/0.6)] ring-1 ring-white/20',
        className,
      )}
    >
      {showLogo ? (
        <img
          src={logo}
          alt=""
          loading="lazy"
          onError={() => setBroken(true)}
          className="h-[78%] w-[78%] object-contain"
        />
      ) : (
        <span className="font-display text-[0.8em] font-black text-brand-700">{initials(name)}</span>
      )}
    </span>
  );
}
