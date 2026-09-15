import { useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useContent } from '../../content/ContentProvider';
import { resolveHref } from '../../lib/nav';
import { safeHref } from '../../lib/safe';
import Marquee from '../ui/Marquee';

/**
 * Thin scrolling strip above the header. Hidden when it's switched off in
 * the admin, or has no text.
 */
export default function AnnouncementBar() {
  const { pathname } = useLocation();
  const announcement = useContent('announcement');
  if (!announcement?.enabled || !announcement.text) return null;

  const item = (
    <span className="flex items-center gap-3 px-6 text-[11px] font-medium uppercase tracking-[0.16em] text-white/90">
      <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
      {announcement.text}
      <a
        href={resolveHref(safeHref(announcement.ctaHref), pathname)}
        className="inline-flex items-center gap-1 font-bold text-gold-400 underline-offset-4 hover:underline"
      >
        {announcement.ctaLabel}
        <ArrowRight className="h-3 w-3" />
      </a>
    </span>
  );

  return (
    <div className="relative z-50 bg-brand-800">
      <Marquee speed="slow" fade={false} className="py-2">
        {/* Repeated so the strip is full even on very wide screens. */}
        {[0, 1, 2].map((i) => (
          <span key={i} className="flex items-center">
            {item}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
