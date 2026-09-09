import { CircleDot, Target, Trophy } from 'lucide-react';
import { aboutCards, aboutIntro } from '../../data/about';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import HexIcon from '../ui/HexIcon';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';

const ICONS = { ball: CircleDot, target: Target, trophy: Trophy };

/**
 * "About Colombo Kickerz" - three cards on a white panel.
 * Mirrors the reference layout: hexagon badge breaking out of the top-left
 * corner of each card, split-colour heading, then body copy.
 */
export default function About() {
  return (
    <section id="about" className="relative py-20 lg:py-28">
      <Container>
        <div className="panel px-5 py-14 sm:px-10 lg:px-14 lg:py-20">
          <SectionHeading title="About Colombo Kickerz" subtitle={aboutIntro.lead} />

          <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
            {aboutCards.map((card, i) => {
              const Icon = ICONS[card.icon];
              return (
                <Reveal key={card.id} delay={i * 0.12} className="group relative pt-7">
                  {/* Hexagon badge, overlapping the card corner */}
                  <div className="absolute left-6 top-0 z-10">
                    <HexIcon tone="blue" size="lg">
                      <Icon strokeWidth={2.2} />
                    </HexIcon>
                  </div>

                  <div className="card-lift flex h-full flex-col rounded-2xl border border-slate-100 bg-white px-7 pb-8 pt-12 shadow-[0_10px_40px_-24px_rgb(15_23_42/0.4)]">
                    <h3 className="font-display text-xl font-extrabold text-ink-900">
                      {card.title}{' '}
                      <span className="text-brand-600">{card.titleAccent}</span>
                    </h3>

                    <p className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-600">
                      {card.body}
                    </p>

                    {card.footnote && (
                      <p className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-gold-600">
                        <span className="h-px w-6 bg-gold-500" />
                        {card.footnote}
                      </p>
                    )}

                    {card.cta && (
                      <Button href={card.cta.href} variant="primary" className="mt-6 w-full">
                        {card.cta.label}
                      </Button>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
