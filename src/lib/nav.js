/**
 * Every in-page anchor in data/navigation.js (and a few CTAs) is a bare hash
 * like '#about', written on the assumption that it is always clicked from
 * the one-page scrolling layout. Now that a couple of standalone routes
 * exist (the legal pages), the same header/footer/mobile menu renders there
 * too - so a bare hash needs to become '/#about' off the home page, or the
 * browser just tries (and fails) to find that section on the current page.
 *
 * Only Header, Footer and MobileMenu need this: every other component that
 * links to a hash (Hero's CTAs, the Events "Enquire" link, etc.) only ever
 * renders on the home page itself.
 */
export function resolveHref(href, pathname) {
  if (!href || !href.startsWith('#')) return href;
  return pathname === '/' ? href : '/' + href;
}

export default resolveHref;
