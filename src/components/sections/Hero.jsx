import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { heroSlides } from '../../data/hero';
import Container from '../ui/Container';
import Button from '../ui/Button';
import BrushStroke from '../ui/BrushStroke';
import { cn } from '../../lib/cn';
import { EASE } from '../../lib/motion';

const SLIDE_DURATION = 7000;

/**
 * Full-bleed hero slider.
 *
 * Each slide crossfades while its photograph slowly zooms (a Ken Burns move),
 * and the copy animates in line by line. Auto-advance pauses while the pointer
 * is over the hero so a visitor reading the text is never interrupted.
 */
export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = heroSlides[index];

  const goTo = useCallback((i) => setIndex(((i % heroSlides.length) + heroSlides.length) % heroSlides.length), []);

  useEffect(() => {
    if (paused || heroSlides.length < 2) return undefined;
    const timer = setTimeout(() => goTo(index + 1), SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [index, paused, goTo]);

  return (
    <section
      id="home"
      className="relative isolate -mt-[88px] flex min-h-[92vh] items-center overflow-hidden bg-ink-950 pt-[88px] lg:min-h-screen"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ---------- Background ---------- */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.1, ease: EASE }, scale: { duration: 8, ease: 'linear' } }}
          className="absolute inset-0 -z-10"
        >
          <img
            src={slide.image}
            alt=""
            aria-hidden="true"
            /* The first hero image is the page's largest contentful paint, so
               it is fetched at high priority. Lowercase attribute name: React
               18 does not map the camelCase form onto the DOM. */
            fetchpriority={index === 0 ? 'high' : 'auto'}
            className="h-full w-full object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Readability scrims: dark from the left for the copy, dark at the top
          for the transparent header, dark at the bottom for the stats band. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950/92 via-ink-950/70 to-ink-950/25" />
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-ink-950/85 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-52 bg-gradient-to-t from-ink-950 to-transparent" />

      {/* ---------- Copy ---------- */}
      <Container className="relative z-10 py-20 lg:py-28">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={slide.id} initial="hidden" animate="visible" exit="exit">
              {/* Eyebrow on a painted band */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
                  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
                }}
                className="relative inline-block"
              >
                <BrushStroke className="text-brand-600" />
                <p className="relative px-9 py-2.5 font-display text-[11px] font-black uppercase tracking-[0.16em] text-white sm:text-xs">
                  {slide.eyebrow}
                </p>
              </motion.div>

              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 34 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE, delay: 0.1 } },
                  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
                }}
                className="mt-6 whitespace-pre-line font-display text-[38px] font-black uppercase leading-[0.95] text-white drop-shadow-[0_4px_24px_rgb(0_0_0/0.5)] sm:text-[56px] lg:text-[68px]"
              >
                {slide.title}
              </motion.h1>

              {/* Gold rule under the headline - the one flash of the crest's
                  secondary colour in an otherwise blue-and-white hero. */}
              <motion.span
                variants={{
                  hidden: { scaleX: 0 },
                  visible: {
                    scaleX: 1,
                    transition: { duration: 0.7, ease: EASE, delay: 0.28 },
                  },
                  exit: { scaleX: 0, transition: { duration: 0.25 } },
                }}
                className="mt-6 block h-1 w-24 origin-left rounded-full bg-gold-500"
              />

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 26 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.22 } },
                  exit: { opacity: 0, transition: { duration: 0.25 } },
                }}
                className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-200 sm:text-lg"
              >
                {slide.subtitle}
              </motion.p>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.34 } },
                  exit: { opacity: 0, transition: { duration: 0.25 } },
                }}
                className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4"
              >
                <Button href={slide.primaryCta.href} variant="primary" size="lg">
                  {slide.primaryCta.label}
                </Button>
                <Button href={slide.secondaryCta.href} variant="outline" size="lg">
                  {slide.secondaryCta.label}
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* ---------- Slide indicators ---------- */}
          {heroSlides.length > 1 && (
            <div className="mt-12 flex items-center gap-3">
              {heroSlides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={'Go to slide ' + (i + 1) + ': ' + s.eyebrow}
                  aria-current={i === index}
                  className={cn(
                    'group relative h-1.5 overflow-hidden rounded-full bg-white/25 transition-all duration-500',
                    i === index ? 'w-16' : 'w-8 hover:bg-white/45',
                  )}
                >
                  {/* Progress fill doubles as the autoplay timer. */}
                  {i === index && (
                    <motion.span
                      key={slide.id + '-progress'}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: paused ? 0.999 : 1 }}
                      transition={{ duration: paused ? 0 : SLIDE_DURATION / 1000, ease: 'linear' }}
                      className="absolute inset-0 origin-left bg-gold-500"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </Container>

      {/* ---------- Scroll cue ---------- */}
      <motion.a
        href="#about"
        aria-label="Scroll to the about section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/70 transition-colors hover:text-white lg:flex"
      >
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.28em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </motion.a>
    </section>
  );
}
