import { CalendarDays, ArrowUpRight } from 'lucide-react';
import { events } from '../../data/events';
import { useCarousel } from '../../hooks/useCarousel';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import { CarouselArrow, CarouselDots } from '../ui/CarouselControls';

/**
 * Events & tournaments carousel.
 *
 * Cards keep a fixed image aspect ratio so a mix of square artwork and wide
 * photography still lines up across the rail.
 */
export default function Events() {
  const { emblaRef, selectedIndex, scrollSnaps, scrollPrev, scrollNext, scrollTo } = useCarousel({
    align: 'start',
  });

  return (
    <section id="events" className="relative py-20 lg:py-28">
      <Container>
        <div className="panel px-5 py-14 sm:px-10 lg:px-14 lg:py-20">
          <SectionHeading
            title="Events & Tournaments"
            subtitle="Join us for exciting events and tournaments. From local competitions to international tours, Kickerz provides unmatched opportunities for young players."
          />

          <div className="relative mt-14">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="-ml-6 flex touch-pan-y">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="min-w-0 shrink-0 grow-0 basis-full pl-6 sm:basis-1/2 lg:basis-1/3"
                  >
                    <article className="card-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_40px_-24px_rgb(15_23_42/0.35)]">
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={event.image}
                          alt={event.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        {event.date && (
                          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-brand-700 shadow-sm backdrop-blur-sm">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {event.date}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="font-display text-lg font-extrabold leading-snug text-ink-900 transition-colors group-hover:text-brand-600">
                          {event.title}
                        </h3>

                        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                          {event.description}
                        </p>

                        <a
                          href="#contact"
                          className="mt-5 inline-flex items-center gap-1.5 self-start font-display text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 transition-colors hover:text-brand-800"
                        >
                          Enquire
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      </div>
                    </article>
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
          </div>

          <div className="mt-10 flex items-center justify-center gap-6">
            <CarouselArrow direction="prev" onClick={scrollPrev} tone="light" className="lg:hidden" />
            <CarouselDots
              count={scrollSnaps.length}
              selectedIndex={selectedIndex}
              onSelect={scrollTo}
            />
            <CarouselArrow direction="next" onClick={scrollNext} tone="light" className="lg:hidden" />
          </div>
        </div>
      </Container>
    </section>
  );
}
