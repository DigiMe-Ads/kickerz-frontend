/**
 * Coaching and academy staff.
 *
 * ---------------------------------------------------------------------------
 * WHERE THIS CAME FROM
 * ---------------------------------------------------------------------------
 * Names and details are from the "Coaches Information Form" responses
 * (Dec 2025 - Jun 2026), using each coach's preferred name. Photos are the
 * "Current Coaches" shoot, cropped square to public/images/team/<name>.webp.
 *
 * "With Kickerz Since" is a year rather than the form's "N years" answer so
 * it doesn't go stale - it was worked out from the date each form was filled.
 *
 * Coaches with a photo but no form response (Chaminda, Francis, Kasun) have
 * no `details`, so their card just shows the name plate. Coaches with a form
 * response but no photo (Madhusha, Rilwan) render the club crest instead.
 *
 * This is only the default: once the Coaching Team section is saved in the
 * admin, the saved version in Supabase is shown instead.
 *
 * `details` is what shows when a visitor hovers (or taps, on phones) over a
 * coach's card - a short list of { label, value } pairs.
 * ---------------------------------------------------------------------------
 */
const details = (license, experience, since, playing) =>
  [
    { label: 'Current Coaching License', value: license },
    { label: 'Years of Coaching Experience', value: experience },
    { label: 'With Kickerz Since', value: since },
    { label: 'Playing Experience', value: playing },
  ].filter((d) => d.value);

export const team = [
  { id: 1, name: 'Azward', role: 'Coach', image: '/images/team/azward.webp', details: details('B License', '15+ Years', '2023', 'National Level') },
  { id: 2, name: 'Inthikab Thaam', role: 'Coach', image: '/images/team/inthikab.webp', details: details('D License', '15+ Years', null, 'School, Youth, Club') },
  { id: 3, name: 'Aboobucker Siddeek', role: 'Coach', image: '/images/team/siddeek.webp', details: details('D License', '12+ Years', '2017', 'School, Youth, Club, District, Provincial, National Level') },
  { id: 4, name: 'Jude Karunaratne', role: 'Goalkeeper Coach', image: '/images/team/jude.webp', details: [] },
  { id: 5, name: 'Ola', role: 'Coach', image: '/images/team/olawale.webp', details: details('D License', '8+ Years', '2021', 'Club') },
  { id: 6, name: 'Shaheer', role: 'Coach', image: '/images/team/shaheer.webp', details: details('D License', '5+ Years', '2024', 'School, Youth, Club, District, Provincial') },
  { id: 7, name: 'Shanu Lakmali', role: 'Coach', image: '/images/team/shanu.webp', details: details('D License', '5+ Years', '2026', 'National Level') },
  { id: 8, name: 'MKM Ishan', role: 'Coach', image: '/images/team/ishan.webp', details: details('D License', '4 Years', '2023', 'National Level – Sri Lanka Navy football team') },
  { id: 9, name: 'Nilanga Silva', role: 'Coach', image: '/images/team/nilanga.webp', details: details('D License', '4 Years', '2025', 'School, Youth, Club, District, Provincial') },
  { id: 10, name: 'Rilwan Nizard', role: 'Coach', image: null, details: details('D License', '3 Years', '2026', 'School, Youth, Club, National Level') },
  { id: 11, name: 'Afdhal Janees', role: 'Coach', image: '/images/team/afdhal.webp', details: details('D License', '2 Years', '2024', 'School, Club') },
  { id: 12, name: 'Mark Brayan Abinas', role: 'Coach', image: '/images/team/mark.webp', details: details('D License', '2 Years', '2022', 'School, Youth, Club') },
  { id: 13, name: 'Madhusha Diyamantha', role: 'Coach', image: null, details: details('D License', '2 Years', '2024', 'School, Youth, Club, District, Provincial') },
  { id: 14, name: 'Amrish', role: 'Coach', image: '/images/team/amrish.webp', details: details('Elite GR Coaching', '2 Years', '2024', 'School, Youth, Club') },
  { id: 15, name: 'Shameel', role: 'Coach', image: '/images/team/shameel.webp', details: details('Elite GR Coaching', '1 Year', '2024', 'School, Youth, Club') },
  { id: 16, name: 'Chaminda', role: 'Coach', image: '/images/team/chaminda.webp', details: [] },
  { id: 17, name: 'Francis', role: 'Coach', image: '/images/team/francis.webp', details: [] },
  { id: 18, name: 'Kasun', role: 'Coach', image: '/images/team/kasun.webp', details: [] },
];

export default team;
