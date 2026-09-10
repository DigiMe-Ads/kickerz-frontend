import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { site } from '../../data/site';
import { useSplashDone } from '../../hooks/useSplashDone';
import SoccerBall from '../ui/SoccerBall';
import { EASE } from '../../lib/motion';

/**
 * How long the splash holds at minimum. Sized to land the kick with a beat
 * to spare: the ball is clear of the screen by ~1.75s, so the curtain going
 * up at 2.25s never cuts the animation off. Add to this the ~0.7s the bundle
 * takes to boot and a first visit sits at roughly three seconds.
 */
const MIN_DURATION = 2250;

/**
 * The ball runs on one clock, split into roll-in / tee-up / strike by the
 * `times` arrays below. KICK_AT derives the moment of contact from that same
 * clock, and everything reacting to the strike (flash, screen shake, speed
 * lines) is delayed to it - so retiming the ball retimes the whole beat.
 */
const BALL_DURATION = 1.6;
const BALL_DELAY = 0.6;
/** Fractions of BALL_DURATION: rolls in, waits on the spot, then is struck. */
const ROLL_IN_ENDS = 0.4;
const STRUCK_AT = 0.56;
const KICK_AT = BALL_DELAY + BALL_DURATION * STRUCK_AT;

/**
 * Where the ball waits to be struck. X is an offset from the screen centre;
 * Y has to drop on small screens or the ball sits on top of the loading bar,
 * since the welcome block takes up proportionally more of a phone's height.
 * The flash shares these so the two can't drift apart.
 */
const TEE_X = '-16vw';
const TEE_Y = 'top-[79%] sm:top-[68%]';

const SEEN_KEY = 'ck:splash-seen';

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    // Private mode / storage blocked - showing the splash again is a much
    // smaller problem than throwing on first paint.
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* see above */
  }
}

/**
 * First-load splash: "Welcome to" over the crest, then the ball is struck
 * and the whole curtain lifts off the site.
 *
 * Shown once per browser tab (sessionStorage), so clicking through to a
 * legal page and back doesn't replay it - those are full page loads, since
 * the site navigates with plain anchors.
 */
export default function Preloader() {
  const reduce = useReducedMotion();
  // Read once on mount: this must not flip to "seen" mid-animation.
  const [skip] = useState(alreadySeen);

  const done = useSplashDone({
    minimum: reduce ? 600 : MIN_DURATION,
    enabled: !skip,
  });
  const visible = !skip && !done;

  // index.html paints #root dark so there's no white flash before React
  // boots. Once we're rendering, the splash (or the site) owns the
  // background instead.
  useEffect(() => {
    document.getElementById('root')?.style.removeProperty('background-color');
  }, []);

  useEffect(() => {
    if (done) markSeen();
  }, [done]);

  // Deliberately no body-scroll lock while the splash is up: locking would
  // clamp the hash-scroll that pages/Home.jsx runs on mount, so landing
  // directly on a link like /#programs would quietly dump the visitor at
  // the top of the page instead. The overlay is opaque and fixed, so any
  // scrolling underneath it is invisible anyway.

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          role="status"
          aria-label={`Loading ${site.fullName}`}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="fixed inset-0 z-[100] overflow-hidden bg-ink-950"
        >
          <div className="pointer-events-none absolute inset-0 bg-pitch-lines opacity-40" />
          <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-brand-600/30 blur-[120px]" />
          <div className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-gold-500/20 blur-[120px]" />

          {/* ---------- Welcome copy (recoils when the ball is struck) ---------- */}
          <motion.div
            animate={reduce ? undefined : { x: [0, -7, 6, -3, 2, 0], y: [0, 4, -5, 2, -1, 0] }}
            transition={{ duration: 0.45, delay: KICK_AT, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
            className="relative flex h-full flex-col items-center justify-center px-6"
          >
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
              className="font-display text-[11px] font-black uppercase tracking-[0.42em] text-gold-500 sm:text-xs"
            >
              Welcome To
            </motion.p>

            <motion.img
              src={site.logo}
              alt=""
              initial={{ opacity: 0, scale: 0.55, y: -28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0.4, delay: 0.2 }
                  : { type: 'spring', stiffness: 210, damping: 14, delay: 0.26 }
              }
              className="mt-6 h-28 w-auto drop-shadow-[0_20px_45px_rgb(0_0_0/0.65)] sm:h-36"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.55 }}
              className="mt-6 text-center font-display text-sm font-bold uppercase tracking-[0.18em] text-white/80 sm:text-base"
            >
              {site.name}
            </motion.p>

            {/* Loading bar - fills over the splash's minimum hold, then waits
                on the page's own load event if it hasn't fired yet. */}
            <div className="mt-8 h-0.5 w-40 overflow-hidden rounded-full bg-white/15 sm:w-56">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: MIN_DURATION / 1000, ease: 'easeInOut' }}
                className="block h-full origin-left rounded-full bg-gradient-to-r from-brand-400 to-gold-500"
              />
            </div>
          </motion.div>

          {!reduce && (
            <>
              {/* ---------- Impact flash at the tee ----------
                  Flares on the first frame after contact and then decays: a
                  symmetric fade would peak a quarter-second late, by which
                  point the ball is most of the way across the screen and the
                  flash reads as going off at an empty spot. */}
              <motion.span
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.35 }}
                animate={{ opacity: [0, 1, 0], scale: [0.35, 1.9, 3.2] }}
                transition={{ duration: 0.42, delay: KICK_AT, times: [0, 0.04, 1], ease: 'easeOut' }}
                style={{ left: `calc(50% + ${TEE_X})` }}
                className={`pointer-events-none absolute ${TEE_Y} h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400/70 blur-xl`}
              />

              {/* ---------- The ball ---------- */}
              <motion.div
                aria-hidden="true"
                initial={{ x: '-80vw' }}
                animate={{ x: ['-80vw', TEE_X, TEE_X, '90vw'] }}
                transition={{
                  duration: BALL_DURATION,
                  delay: BALL_DELAY,
                  times: [0, ROLL_IN_ENDS, STRUCK_AT, 1],
                  // easeOut rather than the site's usual expo curve: expo is so
                  // front-loaded the ball crosses the screen in ~120ms and reads
                  // as a teleport instead of a strike.
                  ease: ['easeOut', 'linear', 'easeOut'],
                }}
                className={`pointer-events-none absolute left-1/2 ${TEE_Y} z-10 -translate-y-1/2`}
              >
                {/* Arc: flat while it rolls in, then up and over once struck.
                    The apex sits at 0.66 so the ball is still on screen while
                    it climbs - peak any later and the whole parabola happens
                    past the right edge where nobody sees it. */}
                <motion.div
                  animate={{ y: ['0vh', '0vh', '0vh', '-24vh', '8vh'] }}
                  transition={{
                    duration: BALL_DURATION,
                    delay: BALL_DELAY,
                    times: [0, ROLL_IN_ENDS, STRUCK_AT, 0.66, 1],
                    ease: ['linear', 'linear', 'easeOut', 'easeIn'],
                  }}
                >
                  {/* Speed lines, trailing off the back of the ball. */}
                  {[
                    { top: '38%', width: '30vw', opacity: 0.75 },
                    { top: '50%', width: '46vw', opacity: 0.95 },
                    { top: '62%', width: '26vw', opacity: 0.6 },
                  ].map((line) => (
                    <motion.span
                      key={line.top}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: [0, 0, line.opacity, 0], scaleX: [0, 0, 1, 1] }}
                      transition={{
                        duration: BALL_DURATION,
                        delay: BALL_DELAY,
                        times: [0, STRUCK_AT, 0.7, 0.94],
                      }}
                      style={{ top: line.top, width: line.width }}
                      className="absolute right-1/2 h-0.5 origin-right rounded-full bg-gradient-to-l from-gold-300 via-gold-400/50 to-transparent"
                    />
                  ))}

                  <motion.div
                    animate={{ rotate: [0, 190, 190, 1260] }}
                    transition={{
                      duration: BALL_DURATION,
                      delay: BALL_DELAY,
                      times: [0, ROLL_IN_ENDS, STRUCK_AT, 1],
                      ease: ['easeOut', 'linear', EASE],
                    }}
                  >
                    <SoccerBall className="h-14 w-14 drop-shadow-[0_12px_26px_rgb(0_0_0/0.6)] sm:h-20 sm:w-20" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
