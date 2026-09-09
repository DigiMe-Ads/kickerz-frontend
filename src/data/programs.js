/**
 * Programs / services.
 *
 * The five program names come from the existing site's footer ("Programs":
 * Youth Training Programs, Annual Football Carnival, International Tournament
 * Tours, Specialized Camps, Holistic Development), and the 5-18 age range is
 * stated in the academy's mission.
 *
 * NOTE: the age bands and the bullet lists below are a reasonable split of that
 * stated 5-18 range - they are NOT copied from an official source. Confirm them
 * with the academy before launch. Entries needing that check are flagged with
 * `needsReview`.
 */
export const programs = [
  {
    id: 'kiddies',
    name: 'Kickerz Kiddies',
    ageRange: 'Ages 5 \u2013 8',
    featured: false,
    needsReview: true,
    points: [
      'Fun-based learning',
      'Basic ball skills',
      'Social development',
      'Parent participation',
    ],
    cta: { label: 'Enquire Now', href: '#contact' },
  },
  {
    id: 'youth',
    name: 'Kickerz Youth',
    ageRange: 'Ages 9 \u2013 12',
    featured: true,
    needsReview: true,
    points: [
      'Technical skills focus',
      'Small-sided games',
      'Weekly skill challenges',
      'Tournament match play',
    ],
    cta: { label: 'Enquire Now', href: '#contact' },
  },
  {
    id: 'elite',
    name: 'Kickerz Elite',
    ageRange: 'Ages 13 \u2013 18',
    featured: false,
    needsReview: true,
    points: [
      'Advanced techniques',
      'Tactical awareness',
      'Physical conditioning',
      'Mental preparation',
    ],
    cta: { label: 'Enquire Now', href: '#contact' },
  },
  {
    id: 'tours',
    name: 'International Tours',
    ageRange: 'Selected squads',
    featured: false,
    needsReview: true,
    points: [
      'Singa Cup, Singapore',
      'KL Cup, Malaysia',
      'Vilimale Invitational',
      'Abu Dhabi Cup',
    ],
    cta: { label: 'Enquire Now', href: '#contact' },
  },
  {
    id: 'camps',
    name: 'Specialized Camps',
    ageRange: 'School holidays',
    featured: false,
    needsReview: true,
    points: [
      'Juventus Training Camp',
      'Christmas & seasonal camps',
      'Goalkeeper-specific sessions',
      'Annual football carnival',
    ],
    cta: { label: 'Enquire Now', href: '#contact' },
  },
];

export default programs;
