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
│   ├── images/             All photography, logos and partner marks
│   │   ├── hero/           16:9 crops (still used by Why Us and Programs)
│   │   ├── team/           Staff portraits (square, 1000×1000)
│   │   ├── current-partners/
│   │   └── partners-over-the-years/
│   └── videos/             Hero background video — see "Hero video" below
│
└── src/
    ├── App.jsx             Page composition — the order of the sections
    ├── main.jsx            React entry point
    │
    ├── data/               ★ ALL SITE CONTENT LIVES HERE ★
    │   ├── site.js         Name, contact details, socials, announcement bar
    │   ├── navigation.js   Header and footer links
    │   ├── hero.js         Hero messages that rotate over the video
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

## Hero video

The hero plays a looping clip of a training session instead of a photo. The
camera original is 4K, 24fps, ~37 MB — far too heavy to serve — so it is kept
**outside the repo**, next to the other source art:

    new-kickerz-site/videos/hero-original-4k.mp4

What ships is re-encoded from it into `public/videos/`:

| File                | Size   | Who gets it                          |
| ------------------- | ------ | ------------------------------------ |
| `hero-1080.webm`    | 2.5 MB | Chrome, Firefox, Edge on ≥768px      |
| `hero-1080.mp4`     | 3.1 MB | Safari and older browsers on ≥768px  |
| `hero-720.webm`     | 1.3 MB | Chrome, Firefox, Edge on phones      |
| `hero-720.mp4`      | 1.4 MB | Safari and older browsers on phones  |
| `hero-poster.jpg`   | 0.1 MB | First paint, and the reduced-motion still |

VP9 is listed first because it measured both smaller *and* slightly sharper
than H.264 on this footage (SSIM 0.914 vs 0.909). The size is chosen once on
mount by `matchMedia` in `Hero.jsx`, so a browser only ever downloads one.

To regenerate after replacing the original (needs ffmpeg):

```bash
SRC=../videos/hero-original-4k.mp4

# 1080p — desktop
ffmpeg -i $SRC -map 0:v:0 -an -vf "scale=1920:1080:flags=lanczos,hqdn3d=3:3:6:6"   -c:v libvpx-vp9 -crf 40 -b:v 0 -row-mt 1 -tile-columns 2 -deadline good -cpu-used 4   -pix_fmt yuv420p -g 48 public/videos/hero-1080.webm
ffmpeg -i $SRC -map 0:v:0 -an -vf "scale=1920:1080:flags=lanczos,hqdn3d=3:3:6:6"   -c:v libx264 -preset slow -crf 29 -maxrate 2200k -bufsize 4400k   -profile:v high -level 4.0 -pix_fmt yuv420p -g 48 -movflags +faststart   public/videos/hero-1080.mp4

# 720p — phones (same two commands at scale=1280:720, crf 42 / 30)
# Poster — first frame, so there is no jump when playback starts
ffmpeg -i $SRC -frames:v 1 -vf "scale=1600:-1:flags=lanczos" -q:v 6 public/videos/hero-poster.jpg
```

`-an` matters: the clip has no audio and the hero is muted regardless.
`+faststart` on the MP4 lets it begin playing before it has fully downloaded.
The light `hqdn3d` denoise is what keeps the file small — grass texture is
otherwise expensive to encode and the detail is invisible under the scrims.

**Readability.** The footage is bright corner to corner (~45% average
luminance, blown highlights, no dark quarter), so the white copy sits on
layered scrims rather than on luck. Measured against the playing video, the
headline backdrop is ~15:1 contrast and the worst single pixel behind it is
5:1 on desktop and 8:1 on phones — all above the 4.5:1 AA bar. If you lighten
those layers in `Hero.jsx`, re-measure against the video, not the poster.

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
