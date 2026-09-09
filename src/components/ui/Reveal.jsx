import { motion } from 'framer-motion';
import { fadeUp, fadeIn, fadeLeft, fadeRight, scaleIn, viewportOnce } from '../../lib/motion';

const VARIANTS = { up: fadeUp, in: fadeIn, left: fadeLeft, right: fadeRight, scale: scaleIn };

/**
 * Scroll-triggered entrance animation.
 * Wrap anything that should animate in as it enters the viewport:
 *   <Reveal delay={0.1}><Card /></Reveal>
 *
 * Animations fire once and respect `prefers-reduced-motion` via the global
 * CSS rule in styles/index.css.
 */
export default function Reveal({
  as = 'div',
  variant = 'up',
  delay = 0,
  className,
  children,
  ...props
}) {
  const MotionTag = motion[as] || motion.div;
  const base = VARIANTS[variant] || fadeUp;

  const variants = {
    hidden: base.hidden,
    visible: {
      ...base.visible,
      transition: { ...base.visible.transition, delay },
    },
  };

  return (
    <MotionTag
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={className}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
