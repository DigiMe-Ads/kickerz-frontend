import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, ChevronUp } from 'lucide-react';
import { team } from '../../data/team';
import { useCarousel } from '../../hooks/useCarousel';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import CrestTile from '../ui/CrestTile';
import Reveal from '../ui/Reveal';
import { CarouselArrow, CarouselDots } from '../ui/CarouselControls';
import { EASE } from '../../lib/motion';

/**
 * Coaching team.
 *
 * The academy has twenty staff members, which is too many for a single rail
 * and too many to dump into a grid unprompted. So this section shows a
 * carousel by default and expands into a full grid on request. Both views read
 * from the same array in data/team.js - add or remove a member there and
 * nothing here needs touching.
 *
 * Members without a photograph render the club crest instead (see CrestTile),
 * so a partly-photographed roster still looks deliberate.
 */

function TeamCard({ member }) {
  return (
    <article className="group relative aspect-square overflow-hidden rounded-2xl bg-ink-800 shadow-[0_16px_44px_-24px_rgb(15_23_42/0.7)]">
      {member.image ? (
        <img
          src={member.image}
          alt={member.name + ' – ' + member.role}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
        />
      ) : (
        <CrestTile label={member.placeholder ? 'Photograph coming soon' : member.name} />
      )}

      {/* Bottom scrim so the name plate is legible over any photograph. */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-950/90 to-transparent" />

      <div className="absolute inset-x-3 bottom-3 rounded-xl bg-brand-600/90 px-4 py-3 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-brand-600">
        <h3 className="font-display text-base font-extrabold leading-tight text-white">
          {member.name}
        </h3>
        <p className="mt-0.5 text-xs text-white/80">{member.role}</p>
      </div>
    </article>
  );
}

export default function Team() {
  const [showAll, setShowAll] = useState(false);
  const { emblaRef, selectedIndex, scrollSnaps, scrollPrev, scrollNext, scrollTo } = useCarousel({
    align: 'start',
  });

  return (
    <section id="team" className="relative py-20 lg:py-28">
      <Container>
        <SectionHeading
          title="Our Coaching Team"
          subtitle={
            'Internationally certified coaches dedicated to developing young talent with professional expertise — ' +
            team.length +
            ' strong across every age group.'
          }
        />

        <AnimatePresence mode="wait" initial={false}>
          {showAll ? (
            /* ---------- Full grid ---------- */
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
            >
              {team.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: EASE, delay: Math.min(i * 0.035, 0.5) }}
                >
                  <TeamCard member={member} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* ---------- Carousel ---------- */
            <motion.div
              key="carousel"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="relative mt-14"
            >
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="-ml-4 flex touch-pan-y lg:-ml-6">
                  {team.map((member) => (
                    <div
                      key={member.id}
                      /* A 62% basis on phones leaves the next card peeking in,
                         which signals the rail is swipeable, and keeps the
                         name plate wide enough for a full name. */
                      className="min-w-0 shrink-0 grow-0 basis-[62%] pl-4 sm:basis-1/3 lg:basis-1/4 lg:pl-6"
                    >
                      <TeamCard member={member} />
                    </div>
                  ))}
                </div>
              </div>

              <CarouselArrow
                direction="prev"
                onClick={scrollPrev}
                tone="blue"
                className="absolute top-1/2 hidden -translate-y-1/2 lg:grid lg:-left-9"
              />
              <CarouselArrow
                direction="next"
                onClick={scrollNext}
                tone="blue"
                className="absolute top-1/2 hidden -translate-y-1/2 lg:grid lg:-right-9"
              />

              <div className="mt-10 flex items-center justify-center gap-6">
                <CarouselArrow
                  direction="prev"
                  onClick={scrollPrev}
                  tone="light"
                  className="lg:hidden"
                />
                <CarouselDots
                  count={scrollSnaps.length}
                  selectedIndex={selectedIndex}
                  onSelect={scrollTo}
                />
                <CarouselArrow
                  direction="next"
                  onClick={scrollNext}
                  tone="light"
                  className="lg:hidden"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Reveal className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
            className="group inline-flex items-center gap-2.5 rounded-full border border-brand-200 bg-white px-7 py-3.5 font-display text-xs font-bold uppercase tracking-[0.14em] text-brand-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-600 hover:bg-brand-600 hover:text-white"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <LayoutGrid className="h-4 w-4" />
                View All {team.length} Coaches
              </>
            )}
          </button>
        </Reveal>
      </Container>
    </section>
  );
}
