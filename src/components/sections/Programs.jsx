import { Check } from 'lucide-react';
import { programs } from '../../data/programs';
import { useCarousel } from '../../hooks/useCarousel';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';
import { CarouselArrow, CarouselDots } from '../ui/CarouselControls';
import { cn } from '../../lib/cn';

/**
 * Programs, presented as a carousel on the dark "stadium" panel.
 *
 * The panel background is one of the academy's own training photographs,
 * heavily darkened - the same treatment as the reference design's services
 * section, which keeps the cards readable while still feeling like a pitch.
 */
export default function Programs() {
  const { emblaRef, selectedIndex, scrollSnaps, scrollPrev, scrollNext, scrollTo } = useCarousel({
    align: 'start',
    autoplay: 5500,
  });

  return (
    <section id="programs" className="relative py-8 lg:py-12">
      <Container>
        <div className="panel-dark relative overflow-hidden">
          {/* Background photograph + scrims */}
          <img
            src="/images/hero/hero-training.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/95 via-ink-900/90 to-ink-950/95" />
          <div className="absolute inset-0 bg-pitch-lines opacity-50" />

          <div className="relative px-5 py-16 sm:px-8 lg:px-14 lg:py-20">
            <SectionHeading
              title="Our Programs"
              dark
              subtitle="Football training for every age group and skill level, from first touches at five to elite preparation at eighteen."
            />

            {/* ---------- Carousel ---------- */}
            <div className="relative mt-14">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="-ml-6 flex touch-pan-y">
                  {programs.map((program) => (
                    <div
                      key={program.id}
                      className="min-w-0 shrink-0 grow-0 basis-full pl-6 sm:basis-1/2 lg:basis-1/3"
                    >
                      <article
                        className={cn(
                          'group flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2',
                          program.featured
                            ? 'border-gold-500/70 bg-ink-800 shadow-[0_0_50px_-18px_rgb(251_199_42/0.5)]'
                            : 'border-brand-500/40 bg-ink-800/80 hover:border-brand-400',
                        )}
                      >
                        {/* Card header band */}
                        <header
                          className={cn(
                            'px-6 py-5 text-center',
                            program.featured
                              ? 'bg-gold-500 text-ink-900'
                              : 'bg-brand-600 text-white',
                          )}
                        >
                          <h3 className="font-display text-xl font-black uppercase tracking-wide">
                            {program.name}
                          </h3>
                        </header>

                        <div className="flex flex-1 flex-col p-6">
                          <p className="font-display text-sm font-bold uppercase tracking-[0.12em] text-white">
                            {program.ageRange}
                          </p>

                          <ul className="mt-5 flex-1 space-y-3">
                            {program.points.map((point) => (
                              <li key={point} className="flex items-start gap-3 text-sm text-slate-300">
                                <Check
                                  className={cn(
                                    'mt-0.5 h-4 w-4 shrink-0',
                                    program.featured ? 'text-gold-500' : 'text-brand-300',
                                  )}
                                  strokeWidth={3}
                                />
                                {point}
                              </li>
                            ))}
                          </ul>

                          <Button
                            href={program.cta.href}
                            variant={program.featured ? 'gold' : 'primary'}
                            size="sm"
                            className="mt-7 w-full"
                          >
                            {program.cta.label}
                          </Button>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrows, overlapping the rail edges on large screens */}
              <CarouselArrow
                direction="prev"
                onClick={scrollPrev}
                tone="gold"
                className="absolute -left-3 top-1/2 hidden -translate-y-1/2 lg:grid lg:-left-8"
              />
              <CarouselArrow
                direction="next"
                onClick={scrollNext}
                tone="gold"
                className="absolute -right-3 top-1/2 hidden -translate-y-1/2 lg:grid lg:-right-8"
              />
            </div>

            {/* Mobile controls */}
            <div className="mt-10 flex items-center justify-center gap-6 lg:hidden">
              <CarouselArrow direction="prev" onClick={scrollPrev} tone="gold" />
              <CarouselDots
                count={scrollSnaps.length}
                selectedIndex={selectedIndex}
                onSelect={scrollTo}
                tone="light"
              />
              <CarouselArrow direction="next" onClick={scrollNext} tone="gold" />
            </div>

            <CarouselDots
              count={scrollSnaps.length}
              selectedIndex={selectedIndex}
              onSelect={scrollTo}
              tone="light"
              className="mt-10 hidden lg:flex"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
