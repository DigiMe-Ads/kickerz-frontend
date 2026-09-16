/**
 * Instagram / photo gallery.
 *
 * The grid is a uniform 3-column layout, so any number of images tiles
 * cleanly with no gaps - add or remove entries freely. Tiles are cropped to
 * 4:5 (Instagram's portrait ratio), which suits the academy's phone-shot
 * photography better than a square crop.
 *
 * An entry is `{ src, alt, video? }`. `src` is always a still image - the
 * grid tile, and the lightbox's poster frame - and `video`, when present,
 * is what actually plays once the tile is opened (see Gallery.jsx). Synced
 * Reels set both automatically (supabase/instagram-sync.sql); a manual
 * entry can too, from the admin's Gallery section.
 */
export const galleryImages = [
  { src: '/images/gallery1.jpg', alt: 'Kickerz Girls training programme artwork' },
  { src: '/images/gallery2.jpg', alt: 'A coach briefing the squad before training' },
  { src: '/images/gallery3.jpg', alt: 'Players resting on the pitch at the Colombo Racecourse Ground' },
  { src: '/images/gallery4.jpg', alt: 'A busy academy training session in progress' },
  { src: '/images/gallery5.jpg', alt: 'Term 3 training session at the academy ground' },
  { src: '/images/gallery6.jpg', alt: 'Kickerz goalkeeper in action during a tournament match' },
];

export const instagramHandle = '@colombokickerz';
export const instagramUrl = 'https://www.instagram.com/colombokickerz';

export default galleryImages;
