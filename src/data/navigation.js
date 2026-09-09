/**
 * Header navigation.
 * `href` values are in-page anchors that match the `id` of each section
 * component. The design splits the links either side of the centred crest,
 * so the list is stored as two halves.
 */
export const navLeft = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Programs', href: '#programs' },
];

export const navRight = [
  { label: 'Events', href: '#events' },
  { label: 'Our Team', href: '#team' },
  { label: 'Partners', href: '#partners' },
  { label: 'Gallery', href: '#gallery' },
];

/** Flat list, used by the mobile drawer and the footer. */
export const navAll = [...navLeft, ...navRight, { label: 'Contact', href: '#contact' }];

export default navAll;
