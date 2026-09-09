/**
 * Hero slider.
 * Images live in public/images/hero/ and were cropped to 16:9 from the
 * academy's own photography. Add or remove a slide and the slider adapts.
 */
export const heroSlides = [
  {
    id: 'juventus',
    image: '/images/hero/hero-juventus.webp',
    eyebrow: 'Colombo Kickerz Football Academy',
    title: 'Kick-Start Your\nFootball Journey',
    subtitle:
      'World-class coaching for players aged 5 to 18. Build skills, confidence and team spirit at Sri Lanka\u2019s leading youth football academy.',
    primaryCta: { label: 'Join The Academy', href: '#contact' },
    secondaryCta: { label: 'View Our Programs', href: '#programs' },
  },
  {
    id: 'kickerz-cup',
    image: '/images/hero/hero-kickerz-cup.webp',
    eyebrow: 'Kickerz Cup 2026',
    title: '73 Teams.\n194 Matches.',
    subtitle:
      'Sri Lanka\u2019s premier youth football tournament, hosted by Colombo Kickerz across five age categories.',
    primaryCta: { label: 'See Our Events', href: '#events' },
    secondaryCta: { label: 'About The Academy', href: '#about' },
  },
  {
    id: 'training',
    image: '/images/hero/hero-training.webp',
    eyebrow: 'Training every week',
    title: 'Where Talent\nMeets Character',
    subtitle:
      'Internationally certified coaches, small groups and a fun, safe, professional environment for every child.',
    primaryCta: { label: 'Book A Trial', href: '#contact' },
    secondaryCta: { label: 'Meet The Coaches', href: '#team' },
  },
];

export default heroSlides;
