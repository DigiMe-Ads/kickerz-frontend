/**
 * Global site information.
 * Single source of truth for anything that appears in more than one place
 * (header, footer, contact section, structured data).
 */
export const site = {
  name: 'Colombo Kickerz',
  fullName: 'Colombo Kickerz Football Academy',
  tagline: 'Football Academy',
  established: 2015,
  logo: '/images/logo.png',

  description:
    "Sri Lanka's premier youth football academy since 2015. With over 300+ children trained every year, we provide world-class football coaching that nurtures both skill and character.",

  contact: {
    addressLabel: 'Training Ground',
    address: 'Colombo Racecourse Ground',
    phones: ['+94 777 749 559', '+94 77 1813 729'],
    email: 'info@colombokickerz.lk',
  },

  socials: [
    { name: 'Facebook', href: 'https://www.facebook.com/colombokickerz', icon: 'facebook' },
    { name: 'Instagram', href: 'https://www.instagram.com/colombokickerz', icon: 'instagram' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/colombokickerz', icon: 'linkedin' },
  ],

  /** Scrolling strip at the very top of the page. Set to null to hide it. */
  announcement: {
    text: 'Registration is open for the 2026 season — ages 5 to 18 welcome.',
    ctaLabel: 'Join Now',
    ctaHref: '#contact',
  },
};

export default site;
