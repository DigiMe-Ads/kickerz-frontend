import { Award, Globe2, Heart, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { features } from '../../data/features';
import { site } from '../../data/site';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import HexIcon from '../ui/HexIcon';
import Reveal from '../ui/Reveal';
import { stagger, fadeRight, viewportOnce } from '../../lib/motion';

const ICONS = { award: Award, globe: Globe2, heart: Heart, trending: TrendingUp };

/**
 * "What Makes Colombo Kickerz Different" - a photo collage beside the four
 * numbered differentiators. The collage images gently float at different
 * offsets, which keeps the left column alive without pulling focus.
 */
export default function WhyUs() {
  return (
    <section id="why-us" className="relative py-20 lg:py-28">
      <Container>
        <SectionHeading
          title="Why Choose Kickerz"
          subtitle="Discover the unique advantages that make Colombo Kickerz the premier youth football academy in Sri Lanka."
        />

        <div className="mt-16 grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* ---------- Collage ---------- */}
          <Reveal variant="left" className="relative mx-auto w-full max-w-lg">
            {/* Soft brand-coloured glows behind the stack, not hard blocks -
                they should read as depth, never as stray rectangles. */}
            <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-brand-600/15 blur-2xl" />
            <div className="absolute -bottom-10 -right-8 h-40 w-40 rounded-full bg-gold-500/25 blur-2xl" />

            <div className="relative grid grid-cols-2 gap-4">
              <motion.img
                src="/images/gallery3.jpg"
                alt="Colombo Kickerz players during a training session"
                loading="lazy"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="col-span-1 aspect-[3/4] w-full rounded-2xl object-cover shadow-xl"
              />
              <motion.img
                src="/images/gallery4.jpg"
                alt="Kickerz squad at an academy event"
                loading="lazy"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="col-span-1 mt-10 aspect-square w-full rounded-2xl object-cover shadow-xl"
              />
              <motion.img
                src="/images/hero/hero-kickerz-cup.webp"
                alt="Kickerz players celebrating a goal at the Kickerz Cup"
                loading="lazy"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                className="col-span-2 aspect-[16/10] w-full rounded-2xl object-cover shadow-xl"
              />
            </div>

            {/* Years-active stamp. Derived from site.established so it never
                goes stale - do not hardcode the number. */}
            <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl bg-brand-600 px-5 py-4 text-white shadow-[0_20px_40px_-18px_rgb(52_74_167/0.9)] lg:-left-8">
              <span className="font-display text-3xl font-black leading-none">
                {new Date().getFullYear() - site.established}
              </span>
              <span className="text-[11px] font-semibold uppercase leading-tight tracking-wider">
                Years
                <br />
                Of Kickerz
              </span>
            </div>
          </Reveal>

          {/* ---------- Numbered list ---------- */}
          <motion.ul
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="space-y-3"
          >
            {features.map((feature) => {
              const Icon = ICONS[feature.icon];
              return (
                <motion.li
                  key={feature.number}
                  variants={fadeRight}
                  className="group relative flex gap-5 rounded-2xl border border-transparent bg-white/70 p-5 transition-all duration-500 hover:border-brand-100 hover:bg-white hover:shadow-[0_20px_50px_-30px_rgb(52_74_167/0.7)] sm:p-6"
                >
                  <HexIcon tone="blue" size="md" className="mt-1">
                    <Icon strokeWidth={2.2} />
                  </HexIcon>

                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-xs font-black text-gold-600">
                        {feature.number}
                      </span>
                      <h3 className="font-display text-lg font-extrabold text-ink-900 transition-colors group-hover:text-brand-600">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                      {feature.body}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </Container>
    </section>
  );
}
