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
 *
 * Any entry without an `image` renders an on-brand crest tile instead of a
 * broken photo, so the section looks finished at every stage of that process.
 * The grid and the carousel both size themselves off this array's length -
 * nothing else needs changing when members are added or removed.
 * ---------------------------------------------------------------------------
 */
export const team = [
  { id: 1, name: 'Jude Karunaratne', role: 'Goal Keeper Coach', image: null },
  { id: 2, name: 'Inthikab Thaam', role: 'Coach', image: null },
  { id: 3, name: 'Olawale Oluwaseun', role: 'Coach', image: null },
  { id: 4, name: 'Amrish', role: 'Coach', image: '/images/team/amrish.webp', needsReview: true },
  { id: 5, name: 'Vinoj', role: 'Coach', image: '/images/team/vinoj.webp', needsReview: true },

  // --- Placeholders: replace with the remaining 15 staff members -----------
  { id: 6, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
  { id: 7, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
  { id: 8, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
  { id: 9, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
  { id: 10, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
  { id: 11, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
  { id: 12, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
  { id: 13, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
  { id: 14, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
  { id: 15, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
  { id: 16, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
  { id: 17, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
  { id: 18, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
  { id: 19, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
  { id: 20, name: 'Coach', role: 'Coaching Staff', image: null, placeholder: true },
];

export default team;
