/**
 * Events & tournaments.
 *
 * The first three entries (title, dates and description) are copied verbatim
 * from the existing homepage. The remaining entries were assembled from the
 * image assets handed over with the project - their titles are taken from the
 * artwork, but the one-line descriptions and dates still need confirming
 * against the admin panel. Those are flagged with `needsReview: true`.
 *
 * `date` may be null when the schedule is not yet published.
 */
export const events = [
  {
    id: 'kickerz-cup-2026',
    title: 'Kickerz Cup 2026',
    date: 'Jun 6 \u2013 Jun 7, 2026',
    image: '/images/kickerz-cup-2026.webp',
    description:
      "Kickerz Cup 2026 brought together 73 teams across five age categories for Sri Lanka's premier youth football tournament. With 194 matches, 259 goals, and unforgettable moments, it celebrated competition, sportsmanship, and the development of the next generation.",
  },
  {
    id: 'kl-cup-2026',
    title: 'KL Cup 2026',
    date: 'May 2 \u2013 May 3, 2026',
    image: '/images/kl-cup-2026.webp',
    description:
      'The Kickerz Girls team travelled to the KL Cup, making it our first Girls team tour.',
  },
  {
    id: 'kiddies-2026',
    title: 'Kickerz Kiddies Tournament 2026',
    date: 'Mar 5 \u2013 Mar 26, 2026',
    image: '/images/kickerz-kiddies-tournament-2026.webp',
    description:
      'We are hosting this tournament over 4 weeks for U8, U9, U10 & U11. The tournament will take place every Thursday from the 5th to the 26th of March.',
  },
  {
    id: 'juventus-camp',
    title: 'Juventus Training Camp Colombo',
    date: null,
    image: '/images/juventus-training-camp-colombo-2026.webp',
    description:
      'The Juventus Training Camp brought official Juventus methodology to Colombo for our academy players.',
    needsReview: true,
  },
  {
    id: 'juventus-press',
    title: 'Juventus Training Camp Press Launch',
    date: null,
    image: '/images/juventus-training-camp-press-2026.webp',
    description:
      'The press launch announcing the Juventus Training Camp partnership in Colombo.',
    needsReview: true,
  },
  {
    id: 'abu-dhabi-cup',
    title: 'Abu Dhabi Cup 2026',
    date: null,
    image: '/images/abu-dhabi-cup-2026.webp',
    description:
      'Kickerz squads travel to the Abu Dhabi Cup for international tournament experience.',
    needsReview: true,
  },
  {
    id: 'singa-cup',
    title: 'Singa Cup',
    date: null,
    image: '/images/singa-cup.webp',
    description:
      'One of Asia\u2019s largest youth tournaments, and a regular fixture on the Kickerz international calendar.',
    needsReview: true,
  },
  {
    id: 'kickerz-vs-kickerz',
    title: 'Kickerz vs Kickerz',
    date: null,
    image: '/images/kickerz-vs-kickerz.webp',
    description:
      'Our in-house tournament where Kickerz squads face each other across every age group.',
    needsReview: true,
  },
  {
    id: 'choose-your-camp',
    title: 'Choose Your Camp 2026',
    date: null,
    image: '/images/choose-your-camp-2026.webp',
    description:
      'School-holiday camps across multiple age groups and skill levels.',
    needsReview: true,
  },
  {
    id: 'christmas-camp',
    title: 'Christmas Camp',
    date: null,
    image: '/images/christmas-camp.webp',
    description:
      'Our end-of-year camp combining training, small-sided games and festive fun.',
    needsReview: true,
  },
  {
    id: 'launch-26-27',
    title: 'Season 26/27 Launch',
    date: null,
    image: '/images/launch-press-26-27.webp',
    description:
      'The official press launch of the Colombo Kickerz 2026/27 season.',
    needsReview: true,
  },
  {
    id: 'csr',
    title: 'Kickerz CSR',
    date: null,
    image: '/images/kickerz-csr.webp',
    description:
      'Giving back through community football programs and outreach across Sri Lanka.',
    needsReview: true,
  },
];

export default events;
