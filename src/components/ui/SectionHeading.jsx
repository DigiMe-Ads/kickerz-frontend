import { motion } from 'framer-motion';
import BrushStroke from './BrushStroke';
import { cn } from '../../lib/cn';
import { fadeUp, scaleIn, viewportOnce } from '../../lib/motion';

/**
 * Centred section title: painted brush band + optional supporting paragraph.
 *
 * @param {string}  title    Uppercase heading text.
 * @param {string}  subtitle Optional paragraph below the title.
 * @param {boolean} dark     Use on dark backgrounds (flips the text colours).
 * @param {'blue'|'gold'} tone Brush colour.
 */
export default function SectionHeading({
  title,
  subtitle,
  dark = false,
  tone = 'blue',
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center text-center', className)}>
      <motion.div
        variants={scaleIn}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="relative inline-block"
      >
        <BrushStroke
          className={tone === 'gold' ? 'text-gold-500' : 'text-brand-600'}
        />
        {/* The generous horizontal padding keeps the text clear of the brush's
            ragged ends - see the note in BrushStroke. */}
        <h2
          className={cn(
            'relative px-10 py-3.5 font-display text-xl font-black uppercase leading-none tracking-[0.02em] sm:px-14 sm:py-4 sm:text-3xl lg:text-[38px]',
            tone === 'gold' ? 'text-ink-900' : 'text-white',
          )}
        >
          {title}
        </h2>
      </motion.div>

      {subtitle && (
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className={cn(
            'mt-6 max-w-3xl text-balance text-[15px] leading-relaxed sm:text-base',
            dark ? 'text-slate-300' : 'text-slate-600',
          )}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
