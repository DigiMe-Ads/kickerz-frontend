/**
 * "About" section - the three-card row plus the intro paragraph.
 * Copy is taken verbatim from the existing colombokickerz.lk homepage.
 */
export const aboutIntro = {
  eyebrow: 'About Us',
  heading: 'About Colombo Kickerz',
  lead: "Founded in 2015, Colombo Kickerz Football Academy has grown into Sri Lanka's leading youth football academy \u2014 training 300+ children every year across multiple age groups.",
};

export const aboutCards = [
  {
    id: 'about',
    icon: 'ball',
    title: 'About',
    titleAccent: 'KICKERZ',
    body: "Founded in 2015, Colombo Kickerz Football Academy has grown into Sri Lanka's leading youth football academy. With over 300+ children trained every year across multiple age groups, we are committed to raising the standard of football while creating a fun, safe, and professional environment for kids.",
    cta: { label: 'Join The Academy', href: '#contact' },
  },
  {
    id: 'vision',
    icon: 'target',
    title: 'Our',
    titleAccent: 'VISION',
    body: 'The academy believes in investing in a society where all kids have access to equal opportunities when it comes to discovering and developing their talents and enjoying a healthy lifestyle.',
    footnote: 'Equal Opportunities for All',
  },
  {
    id: 'mission',
    icon: 'trophy',
    title: 'Our',
    titleAccent: 'MISSION',
    body: 'The aim is to offer kids from ages 5\u201318 a wholesome environment to develop their skills & further their love of the game, while bringing them closer to achieving their goals & fulfilling their potential.',
    footnote: 'Developing Skills & Passion',
  },
];

export default aboutCards;
