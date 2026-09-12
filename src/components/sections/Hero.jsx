import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Pause, Play } from 'lucide-react';
import { heroSlides } from '../../data/hero';
import Container from '../ui/Container';
import Button from '../ui/Button';
import BrushStroke from '../ui/BrushStroke';
import { cn } from '../../lib/cn';
import { EASE } from '../../lib/motion';

const SLIDE_DURATION = 7000;

const VIDEO_POSTER = '/videos/hero-poster.jpg';

/**
 * Two encodes of each size. VP9 is both smaller and slightly sharper than the
 * H.264 here (2.5MB vs 3.1MB at 1080p, measured), so it goes first and
 * Chrome/Firefox/Edge take it; the MP4 is the fallback Safari and older
 * browsers land on. Sources are re-encoded from the 4K original, which is
 * kept outside the repo next to the other source art - see README.
 */
const VIDEO_SOURCES = {
  desktop: { webm: '/videos/hero-1080.webm', mp4: '/videos/hero-1080.mp4' },
  mobile: { webm: '/videos/hero-720.webm', mp4: '/videos/hero-720.mp4' },
};

/**
 * Picks the size once, before first paint, so the browser only ever fetches
 * one of them. A <source media="..."> would be the declarative way to do
 * this, but browser support for resource selection on video sources is not
 * dependable - matchMedia is.
 */
function pickVideoSize() {
  if (typeof window === 'undefined') return VIDEO_SOURCES.desktop;
  return window.matchMedia('(min-width: 768px)').matches
    ? VIDEO_SOURCES.desktop
    : VIDEO_SOURCES.mobile;
}

/**
 * Full-bleed hero: one looping training-ground video behind copy that
 * rotates through the messages in data/hero.js.
 *
 * The footage is bright and busy end to end (a sunlit 4G pitch, white line
 * markings, players in yellow and pale blue bibs), and it averages ~45%
 * luminance with blown highlights from start to finish - there is no dark
 * quarter to drop text onto. So readability is bought with layered scrims
 * rather than by hoping for a convenient patch of shadow: a flat tint over
 * everything, then a left-weighted gradient under the copy. See the comments
 * on those layers before lightening them.
 *
 * Auto-advance pauses while the pointer is over the hero so a visitor reading
 * the text is never interrupted.
 */
export default function Hero() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [videoSources] = useState(pickVideoSize);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const videoRef = useRef(null);
  const slide = heroSlides[index];

  const goTo = useCallback(
    (i) => setIndex(((i % heroSlides.length) + heroSlides.length) % heroSlides.length),
    [],
  );

  useEffect(() => {
    if (paused || heroSlides.length < 2) return undefined;
    const timer = setTimeout(() => goTo(index + 1), SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [index, paused, goTo]);

  // Keep the toggle honest about what the video is actually doing: autoplay
  // gets refused often enough (iOS Low Power Mode, data saver, some
  // enterprise policies) that assuming it started would leave a Pause button
  // sitting over a still frame.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const onPlay = () => setVideoPlaying(true);
    const onPause = () => setVideoPlaying(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    const attempt = video.play();
    if (attempt?.catch) attempt.catch(() => setVideoPlaying(false));

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, []);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      const attempt = video.play();
      if (attempt?.catch) attempt.catch(() => setVideoPlaying(false));
    } else {
      video.pause();
    }
  };

  return (
    <section
      id="home"
      className="relative isolate -mt-[88px] flex min-h-[92vh] items-center overflow-hidden bg-ink-950 pt-[88px] lg:min-h-screen"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ---------- Background ---------- */}
      <div className="absolute inset-0 -z-10">
        {reduceMotion ? (
          /* Anyone who asked for less motion gets the still frame, and is
             never made to download the video to see it. */
          <img
            src={VIDEO_POSTER}
            alt=""
            aria-hidden="true"
            fetchpriority="high"
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <video
            ref={videoRef}
            poster={VIDEO_POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            className="h-full w-full object-cover object-center"
          >
            <source src={videoSources.webm} type="video/webm" />
            <source src={videoSources.mp4} type="video/mp4" />
          </video>
        )}
      </div>

      {/* Readability scrims, in order:
          1. a flat tint, because the footage is bright corner to corner;
          2. the gradient carrying the copy. It runs bottom-up on phones,
             where the text spans the full width, and left-to-right from sm
             up, where it sits in the left column. This is what makes white
             type legible over sunlit grass - do not thin it without
             re-measuring contrast against the video, not against the poster;
          3. top, for the transparent header;
          4. bottom, so the Stats band overlapping the hero has something to
             sit against. */}
      <div className="absolute inset-0 -z-10 bg-ink-950/15" />
      <div className="absolute inset-0 -z-10 bg-brand-950/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950/95 via-ink-950/72 to-ink-950/38 sm:bg-gradient-to-r sm:from-ink-950/88 sm:via-ink-950/60 sm:to-transparent" />
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
                className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-200 drop-shadow-[0_2px_12px_rgb(0_0_0/0.6)] sm:text-lg"
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

      {/* ---------- Video control ----------
          A loop this long counts as auto-playing motion under WCAG 2.2.2, so
          it needs a way to stop it. Hidden when the visitor already asked for
          reduced motion, since then there is no video to stop. */}
      {!reduceMotion && (
        <button
          type="button"
          onClick={toggleVideo}
          aria-label={videoPlaying ? 'Pause background video' : 'Play background video'}
          className="absolute bottom-28 right-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/25 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:text-white sm:right-8"
        >
          {videoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
        </button>
      )}

      {/* ---------- Scroll cue ---------- */}
      <motion.a
        href="#about"
        aria-label="Scroll to the about section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-28 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/70 transition-colors hover:text-white lg:flex"
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
