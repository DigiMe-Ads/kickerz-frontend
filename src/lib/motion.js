/**
 * Shared framer-motion variants.
 * Keeping them in one file means every section animates with the same
 * timing and easing, which is what makes the page feel like one product
 * rather than a pile of separately animated components.
 */
const EASE = [0.16, 1, 0.3, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
};

export const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

export const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

/** Parent wrapper that staggers its children. */
export const stagger = (staggerChildren = 0.09, delayChildren = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

/** Standard viewport config - fire once, slightly before the element is centred. */
export const viewportOnce = { once: true, amount: 0.2, margin: '0px 0px -80px 0px' };

export { EASE };
