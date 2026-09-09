import { stats } from '../../data/stats';
import Container from '../ui/Container';
import Counter from '../ui/Counter';
import Reveal from '../ui/Reveal';

/**
 * Headline numbers, in a card that overlaps the bottom of the hero.
 * Every figure here is stated on the academy's existing site.
 */
export default function Stats() {
  return (
    <section aria-label="Academy at a glance" className="relative z-20 -mt-16 lg:-mt-20">
      <Container>
        <Reveal variant="scale">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] bg-slate-200 shadow-[0_30px_70px_-35px_rgb(15_23_42/0.6)] md:grid-cols-4 md:rounded-[32px]">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative bg-white px-5 py-8 text-center transition-colors duration-500 hover:bg-brand-600 md:px-6 md:py-10"
              >
                <p className="font-display text-3xl font-black text-brand-600 transition-colors duration-500 group-hover:text-white md:text-5xl">
                  <Counter value={stat.value} suffix={stat.suffix} plain={stat.plain} />
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 transition-colors duration-500 group-hover:text-white/80 md:text-xs">
                  {stat.label}
                </p>
                <span className="mx-auto mt-4 block h-0.5 w-8 bg-gold-500 transition-all duration-500 group-hover:w-16" />
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
