import { Quote, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { testimonials } from '../../data/testimonials';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import HexIcon from '../ui/HexIcon';
import { stagger, fadeUp, viewportOnce } from '../../lib/motion';

/**
 * Testimonials - social proof between "what we offer" (Programs) and
 * "see us in action" (Events). Quotes come straight from data/testimonials.js;
 * there are no headshots on file for parents, so each card gets an initials
 * badge instead of a photo - same fallback logic as CrestTile, just inline.
 */
export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20 lg:py-28">
      <Container>
        <SectionHeading
          title="From Our Kickerz Family"
          subtitle="Parents watch every training session from the sideline. Players feel every one of them. Here's what both have to say."
        />

        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.article
              key={t.name}
              variants={fadeUp}
              className="card-lift group relative flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-7 shadow-[0_10px_40px_-24px_rgb(15_23_42/0.35)]"
            >
              <Quote
                className="absolute right-6 top-6 h-10 w-10 text-brand-50 transition-colors duration-500 group-hover:text-brand-100"
                strokeWidth={1.5}
                aria-hidden="true"
              />

              <div className="flex gap-0.5" aria-hidden="true">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                ))}
              </div>

              <p className="relative mt-4 flex-1 text-[15px] italic leading-relaxed text-slate-600">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3.5 border-t border-slate-100 pt-5">
                <HexIcon tone="blue" size="sm">
                  <span className="font-display text-[11px] font-black">{t.initials}</span>
                </HexIcon>
                <div>
                  <p className="font-display text-sm font-extrabold text-ink-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
