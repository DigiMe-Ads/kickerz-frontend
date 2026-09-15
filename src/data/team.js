/**
 * Coaching and academy staff.
 *
 * ---------------------------------------------------------------------------
 * HOW TO FINISH THIS FILE
 * ---------------------------------------------------------------------------
 * The academy has 20 team members, but only two staff photographs were handed
 * over with the project (team/amrish.webp and team/vinoj.webp). Three further
 * names and roles were read off the live site.
 *
 * The remaining entries are placeholders. To complete them:
 *   1. Drop the portrait into  public/images/team/<first-name>.webp
 *      (square crop, 1000x1000, head and shoulders, matching the existing two)
 *   2. Fill in `name`, `role`, and set `image` to that path
 *   3. Delete the `placeholder: true` flag
 *   4. Fill in `details` with that coach's real license, experience etc. (or
 *      delete entries/rename the labels - it's edited the same way in the
 *      admin, under Coaching Team)
 *
 * Any entry without an `image` renders an on-brand crest tile instead of a
 * broken photo, so the section looks finished at every stage of that process.
 * The grid and the carousel both size themselves off this array's length -
 * nothing else needs changing when members are added or removed.
 *
 * `details` is what shows when a visitor hovers (or taps, on phones) over a
 * coach's card - a short list of { label, value } pairs, e.g. a coaching
 * license or years of experience. Both the labels and the values are plain
 * text edited per-coach from the admin, so they don't have to be the same
 * three categories for everyone. Every entry below gets the same three
 * placeholders for now, so no one's card is left blank while the real
 * details are filled in.
 * ---------------------------------------------------------------------------
 */
const placeholderDetails = [
  { label: 'Current Coaching License', value: 'Details coming soon' },
  { label: 'Years of Coaching Experience', value: 'Details coming soon' },
  { label: 'Playing Experience', value: 'Details coming soon' },
];

export const team = [
  { id: 1, name: 'Jude Karunaratne', role: 'Goal Keeper Coach', image: null, details: placeholderDetails },
  { id: 2, name: 'Inthikab Thaam', role: 'Coach', image: null, details: placeholderDetails },
  { id: 3, name: 'Olawale Oluwaseun', role: 'Coach', image: null, details: placeholderDetails },
  { id: 4, name: 'Amrish', role: 'Coach', image: '/images/team/amrish.webp', needsReview: true, details: placeholderDetails },
  { id: 5, name: 'Vinoj', role: 'Coach', image: '/images/team/vinoj.webp', needsReview: true, details: placeholderDetails },

  // --- Placeholders: replace with the remaining 15 staff members -----------
  { id: 6, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
  { id: 7, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
  { id: 8, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
  { id: 9, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
  { id: 10, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
  { id: 11, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
  { id: 12, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
  { id: 13, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
  { id: 14, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
  { id: 15, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
  { id: 16, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
  { id: 17, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
  { id: 18, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
  { id: 19, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
  { id: 20, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true, details: placeholderDetails },
];

export default team;
