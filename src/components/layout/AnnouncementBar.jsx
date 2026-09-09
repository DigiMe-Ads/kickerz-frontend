import { ArrowRight } from 'lucide-react';
import { site } from '../../data/site';
import Marquee from '../ui/Marquee';

/**
 * Thin scrolling strip above the header.
 * Hidden automatically when `site.announcement` is null.
 */
export default function AnnouncementBar() {
  const announcement = site.announcement;
  if (!announcement) return null;

  const item = (
    <span className="flex items-center gap-3 px-6 text-[11px] font-medium uppercase tracking-[0.16em] text-white/90">
      <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
      {announcement.text}
      <a
        href={announcement.ctaHref}
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
