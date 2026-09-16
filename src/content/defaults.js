import { site } from '../data/site';
import { heroSlides } from '../data/hero';
import { stats } from '../data/stats';
import { aboutIntro, aboutCards } from '../data/about';
import { features } from '../data/features';
import { programs } from '../data/programs';
import { testimonials } from '../data/testimonials';
import { events } from '../data/events';
import { team } from '../data/team';
import { academySponsors, currentPartners, pastPartners } from '../data/partners';
import { galleryImages, instagramHandle, instagramUrl } from '../data/gallery';

/**
 * The site's built-in content, one entry per editable section.
 *
 * This is what renders when Supabase has nothing to say - before
 * supabase/schema.sql has been run, when a section has never been edited, or
 * if Supabase can't be reached - and it's what "Restore defaults" in the
 * admin goes back to. Anything saved from the admin lives in the `content`
 * table, one row per key, and is laid over the matching entry here (see
 * ContentProvider).
 *
 * It is assembled from src/data rather than duplicating it, so those files
 * remain the place to change a default. Each entry is the exact shape its
 * section component reads, and src/admin/schema.js describes the same shape
 * for the editor - add a field in one, add it in the other.
 */
export const DEFAULT_CONTENT = {
  site: {
    name: site.name,
    fullName: site.fullName,
    established: site.established,
    logo: site.logo,
    description: site.description,
    contact: site.contact,
    socials: site.socials,
  },

  announcement: {
    enabled: Boolean(site.announcement),
    text: site.announcement?.text ?? '',
    ctaLabel: site.announcement?.ctaLabel ?? '',
    ctaHref: site.announcement?.ctaHref ?? '#contact',
  },

  hero: {
    // Empty means "use the encoded videos shipped in public/videos" - see
    // Hero.jsx. An uploaded video replaces all four encodes with one file.
    videoUrl: '',
    posterUrl: '',
    slides: heroSlides,
  },

  stats: { items: stats },

  about: {
    title: 'About Colombo Kickerz',
    subtitle: aboutIntro.lead,
    cards: aboutCards,
  },

  whyUs: {
    title: 'Why Choose Kickerz',
    subtitle:
      'Discover the unique advantages that make Colombo Kickerz the premier youth football academy in Sri Lanka.',
    images: [
      { src: '/images/gallery3.jpg', alt: 'Colombo Kickerz players during a training session' },
      { src: '/images/gallery4.jpg', alt: 'Kickerz squad at an academy event' },
      { src: '/images/hero/hero-kickerz-cup.webp', alt: 'Kickerz players celebrating a goal at the Kickerz Cup' },
    ],
    features,
  },

  programs: {
    title: 'Our Programs',
    subtitle:
      'Football training for every age group and skill level, from first touches at five to elite preparation at eighteen.',
    backgroundImage: '/images/hero/hero-training.webp',
    items: programs,
  },

  testimonials: {
    title: 'From Our Kickerz Family',
    subtitle:
      "Parents watch every training session from the sideline. Players feel every one of them. Here's what both have to say.",
    items: testimonials,
  },

  results: {
    title: 'Match Centre',
    subtitle: 'Live scores, latest results and upcoming fixtures from the Kickerz squads.',
  },

  events: {
    title: 'Events & Tournaments',
    subtitle:
      'Join us for exciting events and tournaments. From local competitions to international tours, Kickerz provides unmatched opportunities for young players.',
    items: events,
  },

  team: {
    title: 'Our Coaching Team',
    subtitle:
      'Internationally certified coaches dedicated to developing young talent with professional expertise — {count} strong across every age group.',
    members: team,
  },

  partners: {
    title: 'Our Partners',
    subtitle: 'We are proud to work with these organizations, today and throughout our journey.',
    sponsors: academySponsors,
    current: currentPartners,
    past: pastPartners,
  },

  gallery: {
    title: 'Inside The Academy',
    subtitle: `Follow us on Instagram ${instagramHandle} to see the latest training sessions, matches and academy life.`,
    instagramUrl,
    images: galleryImages,
  },

  contact: {
    title: 'Get In Touch',
    subtitle:
      "Ready to join Sri Lanka's leading youth football academy? Send us a message and our team will get back to you.",
    formTitle: 'Send Us A Message',
    formSubtitle: 'Trials, programs, tournaments or partnerships \u2014 we read every enquiry.',
    photo: '/images/gallery3.jpg',
    photoCaption: 'Training every week at the',
    photoCaptionAccent: 'Colombo Racecourse Ground',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57348.190388285184!2d79.8562055!3d6.92183865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2f3b74291f183d5b%3A0xa12bc58886cf4934!2sColombo%20Kickerz%20Football%20Academy!5e1!3m2!1sen!2slk!4v1788953799405!5m2!1sen!2slk',
  },
};

export const CONTENT_KEYS = Object.keys(DEFAULT_CONTENT);

export default DEFAULT_CONTENT;
