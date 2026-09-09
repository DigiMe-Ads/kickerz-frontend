/**
 * Tiny className joiner. Filters out falsey values so conditional classes
 * can be written inline: cn('base', isActive && 'active').
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default cn;
