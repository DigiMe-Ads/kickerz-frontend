import { whatsappHref } from '../lib/whatsapp';

/**
 * The admin dashboard's editor for every section, described as data.
 *
 * Each section's `fields` mirror the shape of its entry in
 * content/defaults.js exactly - that is the contract with the public
 * components. The generic editor (components/Field.jsx) renders any of:
 *
 *   text      single line              link     text + suggested anchors
 *   textarea  multi-line               number   numeric input
 *   toggle    on/off                   select   fixed choices (`options`)
 *   image     upload or URL            video    upload or URL
 *   strings   list of plain strings    group    nested object (`fields`)
 *   list      list of objects (`fields`, with `itemTitle`, `newItem`, min/max)
 *
 * To make a new piece of the site editable: add it to defaults.js, read it
 * with useContent() in the component, describe it here.
 */

/** In-page anchors (plus WhatsApp) offered as suggestions for any link field. */
export const LINK_SUGGESTIONS = [
  '#home', '#about', '#why-us', '#programs', '#testimonials', '#events',
  '#results', '#team', '#partners', '#gallery', '#contact', whatsappHref(),
];

const ctaGroup = (key, label) => ({
  type: 'group',
  key,
  label,
  fields: [
    { type: 'text', key: 'label', label: 'Button text', help: 'Leave empty to hide this button.' },
    { type: 'link', key: 'href', label: 'Links to' },
  ],
});

const heading = (subtitleHelp) => [
  { type: 'text', key: 'title', label: 'Section title' },
  { type: 'textarea', key: 'subtitle', label: 'Section intro', rows: 3, help: subtitleHelp },
];

/**
 * Stable ids for new list items: several sections key their React lists on
 * `id`, and a list where two items share one misbehaves when reordered.
 */
export const newId = (prefix = 'item') =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const SECTIONS = [
  {
    key: 'site',
    label: 'Site & Contact',
    description: 'Academy name, logo and the contact details shown in the header, footer, contact section and menu.',
    fields: [
      { type: 'text', key: 'name', label: 'Short name', help: 'Shown on the loading screen, e.g. "Colombo Kickerz".' },
      { type: 'text', key: 'fullName', label: 'Full name' },
      { type: 'image', key: 'logo', label: 'Logo', variant: 'logo' },
      { type: 'number', key: 'established', label: 'Year established', help: 'Drives the "years of Kickerz" badge.' },
      { type: 'textarea', key: 'description', label: 'Footer description', rows: 3 },
      {
        type: 'group',
        key: 'contact',
        label: 'Contact details',
        fields: [
          { type: 'text', key: 'addressLabel', label: 'Address label', help: 'e.g. "Training Ground".' },
          { type: 'text', key: 'address', label: 'Address' },
          { type: 'strings', key: 'phones', label: 'Phone numbers', itemLabel: 'Phone number' },
          { type: 'text', key: 'email', label: 'Email' },
        ],
      },
      {
        type: 'list',
        key: 'socials',
        label: 'Social links',
        itemLabel: 'social link',
        itemTitle: (s) => s.name || 'Social link',
        newItem: () => ({ name: '', href: 'https://', icon: 'facebook' }),
        fields: [
          {
            type: 'select',
            key: 'icon',
            label: 'Network',
            options: [
              { value: 'facebook', label: 'Facebook' },
              { value: 'instagram', label: 'Instagram' },
              { value: 'linkedin', label: 'LinkedIn' },
              { value: 'youtube', label: 'YouTube' },
            ],
          },
          { type: 'text', key: 'name', label: 'Name', help: 'Read out by screen readers.' },
          { type: 'text', key: 'href', label: 'Profile URL' },
        ],
      },
    ],
  },

  {
    key: 'announcement',
    label: 'Announcement Bar',
    description: 'The scrolling strip across the very top of the site.',
    fields: [
      { type: 'toggle', key: 'enabled', label: 'Show the announcement bar' },
      { type: 'text', key: 'text', label: 'Message' },
      { type: 'text', key: 'ctaLabel', label: 'Link text' },
      { type: 'link', key: 'ctaHref', label: 'Links to' },
    ],
  },

  {
    key: 'hero',
    label: 'Hero',
    description: 'The full-screen video and rotating headlines at the top of the home page.',
    fields: [
      {
        type: 'video',
        key: 'videoUrl',
        label: 'Background video',
        help: 'Leave empty to use the built-in academy video. MP4 (H.264) at 1080p works everywhere - keep it under ~15MB and 10-20 seconds; it loops.',
      },
      {
        type: 'image',
        key: 'posterUrl',
        label: 'Video still',
        variant: 'photo',
        help: 'Shown while the video loads, and instead of it for visitors with reduced motion turned on. Use a frame from the video. Leave empty for the built-in one.',
      },
      {
        type: 'list',
        key: 'slides',
        label: 'Headlines',
        itemLabel: 'headline',
        min: 1,
        help: 'Leave a slide’s secondary button text empty to show just one button, centered under the paragraph.',
        itemTitle: (s) => (s.title || 'Headline').replace(/\n/g, ' '),
        newItem: () => ({
          id: newId('slide'),
          eyebrow: '',
          title: '',
          subtitle: '',
          note: '',
          primaryCta: { label: 'Join The Academy', href: whatsappHref('Hi! I’d like to find out more about joining Colombo Kickerz.') },
          secondaryCta: { label: '', href: '#programs' },
        }),
        fields: [
          { type: 'text', key: 'eyebrow', label: 'Small label above' },
          { type: 'textarea', key: 'title', label: 'Headline', rows: 2, help: 'Press Enter to break the line where you want it.' },
          { type: 'textarea', key: 'subtitle', label: 'Supporting text', rows: 3 },
          { type: 'text', key: 'note', label: 'Extra line (optional)', help: 'A short line shown under the supporting text, same style - e.g. "Book your FREE TRY-OUT today!". Leave empty to skip it.' },
          ctaGroup('primaryCta', 'Primary button'),
          ctaGroup('secondaryCta', 'Secondary button'),
        ],
      },
    ],
  },

  {
    key: 'stats',
    label: 'Stats',
    description: 'The four headline numbers overlapping the bottom of the hero.',
    fields: [
      {
        type: 'list',
        key: 'items',
        label: 'Numbers',
        itemLabel: 'number',
        min: 1,
        max: 4,
        itemTitle: (s) => `${s.value ?? ''}${s.suffix ?? ''} ${s.label ?? ''}`.trim() || 'Number',
        newItem: () => ({ value: 0, suffix: '', label: '', plain: false }),
        fields: [
          { type: 'number', key: 'value', label: 'Number' },
          { type: 'text', key: 'suffix', label: 'After the number', help: 'e.g. "+".' },
          { type: 'text', key: 'label', label: 'Label' },
          { type: 'toggle', key: 'plain', label: 'Plain number, no thousands separator (for years)' },
        ],
      },
    ],
  },

  {
    key: 'about',
    label: 'About',
    description: 'The "About Colombo Kickerz" section and its cards.',
    fields: [
      ...heading(),
      {
        type: 'list',
        key: 'cards',
        label: 'Cards',
        itemLabel: 'card',
        min: 1,
        itemTitle: (c) => `${c.title || ''} ${c.titleAccent || ''}`.trim() || 'Card',
        newItem: () => ({ id: newId('card'), icon: 'ball', title: '', titleAccent: '', body: '', footnote: '', cta: { label: '', href: whatsappHref() } }),
        fields: [
          {
            type: 'select',
            key: 'icon',
            label: 'Icon',
            options: [
              { value: 'ball', label: 'Ball' },
              { value: 'target', label: 'Target' },
              { value: 'trophy', label: 'Trophy' },
            ],
          },
          { type: 'text', key: 'title', label: 'Title' },
          { type: 'text', key: 'titleAccent', label: 'Title (blue part)' },
          { type: 'textarea', key: 'body', label: 'Text', rows: 4 },
          { type: 'text', key: 'footnote', label: 'Gold footnote', help: 'Optional.' },
          ctaGroup('cta', 'Button (optional)'),
        ],
      },
    ],
  },

  {
    key: 'whyUs',
    label: 'Why Us',
    description: 'The photo collage and the numbered reasons.',
    fields: [
      ...heading(),
      {
        type: 'list',
        key: 'images',
        label: 'Collage photos',
        itemLabel: 'photo',
        min: 3,
        max: 3,
        itemTitle: (p, i) => ['Tall photo (left)', 'Square photo (right)', 'Wide photo (bottom)'][i] || 'Photo',
        newItem: () => ({ src: '', alt: '' }),
        fields: [
          { type: 'image', key: 'src', label: 'Photo', variant: 'photo' },
          { type: 'text', key: 'alt', label: 'Description', help: 'Describe the photo for visitors using screen readers.' },
        ],
      },
      {
        type: 'list',
        key: 'features',
        label: 'Reasons',
        itemLabel: 'reason',
        itemTitle: (f) => f.title || 'Reason',
        newItem: () => ({ number: '', icon: 'award', title: '', body: '' }),
        fields: [
          { type: 'text', key: 'number', label: 'Number', help: 'e.g. "05".' },
          {
            type: 'select',
            key: 'icon',
            label: 'Icon',
            options: [
              { value: 'award', label: 'Award' },
              { value: 'globe', label: 'Globe' },
              { value: 'heart', label: 'Heart' },
              { value: 'trending', label: 'Trending up' },
            ],
          },
          { type: 'text', key: 'title', label: 'Title' },
          { type: 'textarea', key: 'body', label: 'Text', rows: 3 },
        ],
      },
    ],
  },

  {
    key: 'programs',
    label: 'Programs',
    description: 'The programs carousel. Program names also feed the contact form’s subject list and the footer.',
    fields: [
      ...heading(),
      { type: 'image', key: 'backgroundImage', label: 'Background photo', variant: 'photo', help: 'Shown heavily darkened behind the cards.' },
      {
        type: 'list',
        key: 'items',
        label: 'Programs',
        itemLabel: 'program',
        min: 1,
        itemTitle: (p) => p.name || 'Program',
        newItem: () => ({
          id: newId('program'),
          name: '',
          ageRange: '',
          featured: false,
          points: [],
          cta: { label: 'Enquire Now', href: whatsappHref() },
        }),
        fields: [
          { type: 'text', key: 'name', label: 'Name' },
          { type: 'text', key: 'ageRange', label: 'Age range', help: 'e.g. "Ages 9 – 12".' },
          { type: 'toggle', key: 'featured', label: 'Highlight this program (gold card)' },
          { type: 'strings', key: 'points', label: 'Bullet points', itemLabel: 'Point' },
          ctaGroup('cta', 'Button'),
        ],
      },
    ],
  },

  {
    key: 'testimonials',
    label: 'Testimonials',
    description: 'Quotes from parents and players.',
    fields: [
      ...heading(),
      {
        type: 'list',
        key: 'items',
        label: 'Testimonials',
        itemLabel: 'testimonial',
        itemTitle: (t) => t.name || 'Testimonial',
        newItem: () => ({ name: '', role: '', initials: '', rating: 5, quote: '' }),
        fields: [
          { type: 'text', key: 'name', label: 'Name' },
          { type: 'text', key: 'role', label: 'Role', help: 'e.g. "Parent, U10 Program".' },
          { type: 'text', key: 'initials', label: 'Initials', help: 'Shown in the badge, e.g. "DP".' },
          {
            type: 'select',
            key: 'rating',
            label: 'Stars',
            numeric: true,
            options: [5, 4, 3, 2, 1].map((n) => ({ value: n, label: '★'.repeat(n) })),
          },
          { type: 'textarea', key: 'quote', label: 'Quote', rows: 4 },
        ],
      },
    ],
  },

  {
    key: 'results',
    label: 'Match Centre',
    description: 'Heading for the scores section. The matches themselves are managed on the Scores page.',
    fields: heading(),
  },

  {
    key: 'events',
    label: 'Events',
    description: 'The events & tournaments carousel.',
    fields: [
      ...heading(),
      {
        type: 'list',
        key: 'items',
        label: 'Events',
        itemLabel: 'event',
        itemTitle: (e) => e.title || 'Event',
        newItem: () => ({ id: newId('event'), title: '', date: '', image: '', description: '' }),
        fields: [
          { type: 'text', key: 'title', label: 'Title' },
          { type: 'text', key: 'date', label: 'Date', help: 'As it should appear, e.g. "Jun 6 – Jun 7, 2026". Leave empty if not announced yet.' },
          { type: 'image', key: 'image', label: 'Image', variant: 'photo' },
          { type: 'textarea', key: 'description', label: 'Description', rows: 4 },
        ],
      },
    ],
  },

  {
    key: 'team',
    label: 'Coaching Team',
    description: 'Coaches and staff.',
    fields: [
      ...heading('Write {count} anywhere to show the current number of team members.'),
      {
        type: 'list',
        key: 'members',
        label: 'Team members',
        itemLabel: 'member',
        itemTitle: (m) => m.name || 'Team member',
        newItem: () => ({
          id: newId('member'),
          name: '',
          role: '',
          image: '',
          details: [
            { label: 'Current Coaching License', value: '' },
            { label: 'Years of Coaching Experience', value: '' },
            { label: 'Playing Experience', value: '' },
          ],
        }),
        fields: [
          { type: 'text', key: 'name', label: 'Name' },
          { type: 'text', key: 'role', label: 'Role' },
          { type: 'image', key: 'image', label: 'Photo', variant: 'photo', help: 'Square, head-and-shoulders works best. Leave empty to show the club crest.' },
          {
            type: 'list',
            key: 'details',
            label: 'Hover details',
            itemLabel: 'detail',
            itemTitle: (d) => d.label || 'Detail',
            newItem: () => ({ label: '', value: '' }),
            help: 'Shown when a visitor hovers (or taps, on phones) over this coach’s card. Headings can be anything - they don’t have to match other coaches. Leave the list empty to skip the hover card for this person.',
            fields: [
              { type: 'text', key: 'label', label: 'Heading', help: 'e.g. "Current Coaching License".' },
              { type: 'text', key: 'value', label: 'Detail' },
            ],
          },
        ],
      },
    ],
  },

  {
    key: 'partners',
    label: 'Partners',
    description: 'Academy sponsors and the two scrolling rows of partner logos.',
    fields: [
      ...heading(),
      {
        type: 'list',
        key: 'sponsors',
        label: 'Academy sponsors',
        itemLabel: 'sponsor',
        itemTitle: (p) => p.name || 'Sponsor',
        newItem: () => ({ name: '', logo: '' }),
        fields: [
          { type: 'text', key: 'name', label: 'Name' },
          { type: 'image', key: 'logo', label: 'Logo', variant: 'logo' },
        ],
      },
      {
        type: 'list',
        key: 'current',
        label: 'Current partners',
        itemLabel: 'partner',
        itemTitle: (p) => p.name || 'Partner',
        newItem: () => ({ name: '', logo: '' }),
        fields: [
          { type: 'text', key: 'name', label: 'Name' },
          { type: 'image', key: 'logo', label: 'Logo', variant: 'logo' },
        ],
      },
      {
        type: 'list',
        key: 'past',
        label: 'Partners over the years',
        itemLabel: 'partner',
        itemTitle: (p) => p.name || 'Partner',
        newItem: () => ({ name: '', logo: '' }),
        fields: [
          { type: 'text', key: 'name', label: 'Name' },
          { type: 'image', key: 'logo', label: 'Logo', variant: 'logo' },
        ],
      },
    ],
  },

  {
    key: 'gallery',
    label: 'Gallery',
    description: 'The photo grid and the Instagram button.',
    fields: [
      ...heading(),
      { type: 'text', key: 'instagramUrl', label: 'Instagram profile URL' },
      {
        type: 'list',
        key: 'images',
        label: 'Photos',
        itemLabel: 'photo',
        itemTitle: (p, i) => p.alt || `Photo ${i + 1}`,
        newItem: () => ({ src: '', alt: '' }),
        help: 'If Instagram auto-sync is set up (supabase/instagram-sync.sql), this list is replaced by your latest posts on its own schedule - anything edited here by hand will be overwritten by the next sync.',
        fields: [
          { type: 'image', key: 'src', label: 'Photo', variant: 'photo' },
          { type: 'text', key: 'alt', label: 'Description', help: 'Describe the photo for visitors using screen readers.' },
        ],
      },
    ],
  },

  {
    key: 'contact',
    label: 'Contact',
    description: 'The contact section. Address, phones and email are under Site & Contact.',
    fields: [
      ...heading(),
      { type: 'text', key: 'formTitle', label: 'Form title' },
      { type: 'text', key: 'formSubtitle', label: 'Form intro' },
      { type: 'image', key: 'photo', label: 'Photo', variant: 'photo' },
      { type: 'text', key: 'photoCaption', label: 'Photo caption' },
      { type: 'text', key: 'photoCaptionAccent', label: 'Photo caption (gold part)' },
      {
        type: 'textarea',
        key: 'mapEmbedUrl',
        label: 'Google Map',
        rows: 3,
        mapEmbed: true,
        help: 'In Google Maps: Share → Embed a map → Copy HTML, then paste it here. The link is picked out for you.',
      },
    ],
  },
];

export const SECTION_BY_KEY = Object.fromEntries(SECTIONS.map((s) => [s.key, s]));
