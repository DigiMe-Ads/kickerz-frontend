# Colombo Kickerz — website

The public-facing site for Colombo Kickerz Football Academy, rebuilt as a
React + Vite + Tailwind single-page app that compiles to **static files only**.

The hosting is Hostinger shared hosting: Apache, PHP and MySQL, **no Node
runtime**. Nothing here needs a server process — `npm run build` produces a
folder of files you upload.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # writes ./dist
npm run preview  # serves ./dist locally
```

---

## How the project is organised

```
site/
├── public/                 Copied verbatim into dist/ at build time
│   ├── .htaccess           Apache rules for the whole site  ← read before editing
│   ├── form-api/           PHP endpoint for the contact form
│   │   ├── contact.php
│   │   └── config.sample.php
│   └── images/             All photography, logos and partner marks
│       ├── hero/           16:9 crops used by the hero slider
│       ├── team/           Staff portraits (square, 1000×1000)
│       ├── current-partners/
│       └── partners-over-the-years/
│
└── src/
    ├── App.jsx             Page composition — the order of the sections
    ├── main.jsx            React entry point
    │
    ├── data/               ★ ALL SITE CONTENT LIVES HERE ★
    │   ├── site.js         Name, contact details, socials, announcement bar
    │   ├── navigation.js   Header and footer links
    │   ├── hero.js         Hero slides
    │   ├── about.js        About / vision / mission cards
    │   ├── features.js     "Why choose us" points
    │   ├── stats.js        The four headline numbers
    │   ├── programs.js     Program cards
    │   ├── events.js       Events & tournaments
    │   ├── team.js         Coaching staff (20 members)
    │   ├── partners.js     Partner logos, current and historical
    │   └── gallery.js      Gallery images
    │
    ├── components/
    │   ├── layout/         AnnouncementBar, Header, MobileMenu, Footer, ScrollToTop
    │   ├── sections/       One file per page section, in page order
    │   └── ui/             Reusable primitives (Button, SectionHeading, …)
    │
    ├── hooks/              useCarousel, useScrolled, useActiveSection
    ├── lib/                cn (className joiner), motion (shared variants)
    └── styles/index.css    Design tokens — colours, fonts, animations
```

**The rule of thumb: to change words or pictures, edit `src/data/`. To change
how something looks, edit `src/components/`.** No component hardcodes copy.

---

## Design system

Every colour is sampled from the club crest (`public/images/logo.png`) and
defined once, in the `@theme` block at the top of `src/styles/index.css`:

| Token          | Value     | Where it comes from            |
| -------------- | --------- | ------------------------------ |
| `brand-600`    | `#344AA7` | The crest lettering and boots  |
| `gold-500`     | `#FBC72A` | The lightning bolts            |
| `bronze-500`   | `#958F4A` | The outer shield edge          |
| `ink-900`      | `#0A0E1C` | The dark "stadium" sections    |

Fonts: **Archivo** for display headings, **Poppins** for body copy, both from
Google Fonts (linked in `index.html`).

This is Tailwind v4 — there is no `tailwind.config.js`. Theme values are CSS
custom properties inside `@theme`, and each one automatically produces the
matching utilities (`bg-brand-600`, `text-gold-500`, and so on).

### Animation

Scroll-triggered entrances all go through `<Reveal>`, which uses the shared
variants in `src/lib/motion.js`. Using one set of variants everywhere is what
makes the page feel like a single product rather than a pile of effects.

Everything respects `prefers-reduced-motion` — the global rule in
`styles/index.css` collapses all animation for visitors who ask for it.

---

## Content you still need to supply

Three things are deliberately marked in the source rather than invented:

1. **Team photographs.** `src/data/team.js` has all 20 slots, but only two
   portraits were handed over. Entries without an `image` render an on-brand
   crest tile instead of a broken image, so the section looks finished at every
   stage. The file explains exactly how to fill each one in.

2. **Event copy.** The first three events are quoted verbatim from the current
   site. The rest were assembled from the artwork filenames and are flagged
   `needsReview: true` — confirm the titles, dates and descriptions against the
   admin panel before launch.

3. **Program age bands.** `src/data/programs.js` splits the academy's stated
   5–18 range into three bands. That split is a sensible guess, not an official
   one, and every entry is flagged `needsReview: true`.

Search the codebase for `needsReview` to find them all.

---

## Contact form

The form in `src/components/sections/Contact.jsx` POSTs JSON to
`/form-api/contact.php`.

It has to be server-side: the academy's SMTP credentials must never appear in
the JavaScript bundle, because everything in that bundle is public.

**Setup on the server:**

1. Upload `form-api/` to `public_html/form-api/`.
2. Copy `config.sample.php` to `config.php` and fill in the real values.
   `config.php` is blocked from the web by a `<Files>` rule in `.htaccess`.
3. Confirm `.htaccess` still excludes `/form-api/` from the SPA rewrite.

`npm run dev` has no PHP, so submitting the form locally shows a network error.
That is expected. To test it properly, build and serve `dist/` with PHP:

```bash
npm run build
php -S localhost:8000 -t dist
```

---

## Deploying

The site is uploaded by hand through the Hostinger File Manager or FTP. There
is no CI, and no Git repository on the server.

1. **Back up first.** Download a full zip of `public_html` and export the
   database from phpMyAdmin. Keep both copies somewhere off this machine.
   In particular, keep the current `.htaccess` — a broken one returns a 500 on
   every route, including the admin panel.

2. `npm run build`.

3. Upload the contents of `dist/` to the root of `public_html`:
   `index.html`, `assets/`, `images/`, `form-api/` and `.htaccess`.
   Enable "show hidden files" in the File Manager or `.htaccess` will be missed.

4. **Do not delete** any of the following. They are outside this project's
   scope and several of them serve the mobile app:

   | Path                           | Why it stays                                            |
   | ------------------------------ | ------------------------------------------------------- |
   | `api/`                         | Serves the Colombo Kickerz **mobile app**, not this site |
   | `kickerz-landing-admin/`       | The client's PHP admin panel                            |
   | `links/`                       | Actively in use; purpose not yet documented             |
   | `privacy-policy-for-the-colombo-kickerz-app.php` | Registered with the app stores        |
   | `support-colombo-kickerz-app.php`               | Registered with the app stores        |
   | `data-deletion-request-form.php`                | Likely Meta's data-deletion callback   |

   The three PHP pages stay as PHP and keep their clean URLs. The footer links
   to them directly. Do not build React routes for them — the deletion form
   does real backend work (database write plus SMTP send).

5. **Verify by hand after deploying:**
   - [ ] The homepage loads and every section renders
   - [ ] `/kickerz-landing-admin/` loads and accepts a login
   - [ ] `/privacy-policy-for-the-colombo-kickerz-app` resolves
   - [ ] `/support-colombo-kickerz-app` resolves
   - [ ] `/data-deletion-request-form` resolves **and still submits**
   - [ ] `/links/` still works
   - [ ] The mobile app can still reach `/api/`
   - [ ] The contact form sends and the email arrives

---

## The `.htaccess`

`public/.htaccess` is the riskiest file in the project — one bad rule takes down
the admin panel, the API and the mobile app simultaneously. It is heavily
commented; read it before changing anything.

The one substantive change from the version handed over is a `-f` guard on the
clean-URL → `.php` rule. Without it, any new front-end route is rewritten to a
non-existent `.php` file and 404s instead of reaching the app.

Whenever you add a server-side folder or a new surviving PHP page, add the
exclusion to **rule 1** in the same change — never as a follow-up.

---

## Adding a new section

1. Create `src/data/<name>.js` with the content.
2. Create `src/components/sections/<Name>.jsx`; give the `<section>` an `id`.
3. Render it in `src/App.jsx`, in page order.
4. Add the nav entry in `src/data/navigation.js` — the header's active-link
   highlighting picks it up automatically.

## Adding real pages later

The site is currently one scrolling page. If it grows separate routes, add
`react-router-dom` around `<App>`. No server change is needed: rule 5 of the
`.htaccess` already falls through to `index.html` for any unknown path.
