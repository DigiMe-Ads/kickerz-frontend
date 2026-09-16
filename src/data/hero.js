import { whatsappHref } from '../lib/whatsapp';

/**
 * Hero copy.
 * The hero plays one looping video (public/videos/, see Hero.jsx); these are
 * the messages that rotate over it. Add or remove one and the hero adapts.
 *
 * `note` is an optional extra line under the subtitle (same styling) - see
 * slide one. A slide with only a `primaryCta` (no `secondaryCta`) gets that
 * one button centered under the paragraph instead of left-aligned - see
 * Hero.jsx.
 */
export const heroSlides = [
  {
    id: 'juventus',
    eyebrow: 'Colombo Kickerz Football Academy',
    title: 'Kick-Start Your\nFootball Journey',
    subtitle:
      'World-class coaching for players aged 5 to 18. Build skills, confidence and team spirit at Sri Lanka\u2019s leading youth football academy.',
    note: 'Book your FREE TRY-OUT today!',
    primaryCta: { label: 'Book A Trial', href: whatsappHref('Hi! I\u2019d like to book a FREE try-out at Colombo Kickerz.') },
    secondaryCta: { label: '', href: '' },
  },
  {
    id: 'kickerz-cup',
    eyebrow: 'Kickerz Cup 2026',
    title: '73 Teams.\n194 Matches.',
    subtitle:
      'Sri Lanka\u2019s premier youth football tournament, hosted by Colombo Kickerz across five age categories.',
    primaryCta: { label: 'See Our Events', href: '#events' },
    secondaryCta: { label: 'View Our Program', href: '#programs' },
  },
  {
    id: 'training',
    eyebrow: 'Training every week',
    title: 'Where Talent\nMeets Character',
    subtitle:
      'Internationally certified coaches, small groups and a fun, safe, professional environment for every child.',
    primaryCta: { label: 'Meet The Coaches', href: '#team' },
    secondaryCta: { label: 'View Our Partners', href: '#partners' },
  },
];

export default heroSlides;
