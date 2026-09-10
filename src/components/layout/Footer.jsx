import { useLocation } from 'react-router-dom';
import { MapPin, Phone, Mail, ChevronRight, Facebook, Instagram, Linkedin } from 'lucide-react';
import { site } from '../../data/site';
import { navAll } from '../../data/navigation';
import { programs } from '../../data/programs';
import { resolveHref } from '../../lib/nav';
import Container from '../ui/Container';
import Reveal from '../ui/Reveal';

const SOCIAL_ICONS = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin };

export default function Footer() {
  const year = new Date().getFullYear();
  const { pathname } = useLocation();

  return (
    <footer id="site-footer" className="relative overflow-hidden bg-ink-900 text-slate-300">
      {/* Gold hairline, carried over from the current site. */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-600 via-gold-500 to-brand-600" />
      <div className="pointer-events-none absolute inset-0 bg-pitch-lines opacity-40" />
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-brand-600/25 blur-[120px]" />

      <Container className="relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <Reveal>
            <div className="grid h-24 w-24 place-items-center rounded-2xl bg-white p-2">
              <img src={site.logo} alt={site.fullName} className="h-full w-auto" />
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400">
              {site.description}
            </p>
            <div className="mt-6 flex gap-3">
              {site.socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon];
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.name}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-gold-500 hover:text-ink-900"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </Reveal>

          {/* Contact */}
          <Reveal delay={0.08}>
            <h3 className="font-display text-lg font-extrabold uppercase text-white">
              Get In Touch
            </h3>
            <ul className="mt-6 space-y-5 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <span>
                  <span className="block text-white">{site.contact.addressLabel}</span>
                  <span className="text-slate-400">{site.contact.address}</span>
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <span>
                  {site.contact.phones.map((phone) => (
                    <a
                      key={phone}
                      href={'tel:' + phone.replace(/\s/g, '')}
                      className="block text-slate-400 transition-colors hover:text-white"
                    >
                      {phone}
                    </a>
                  ))}
                </span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <a
                  href={'mailto:' + site.contact.email}
                  className="break-all text-slate-400 transition-colors hover:text-white"
                >
                  {site.contact.email}
                </a>
              </li>
            </ul>
          </Reveal>

          {/* Quick links */}
          <Reveal delay={0.16}>
            <h3 className="font-display text-lg font-extrabold uppercase text-white">
              Quick Links
            </h3>
            <ul className="mt-6 space-y-3 text-sm">
              {navAll.map((link) => (
                <li key={link.href}>
                  <a
                    href={resolveHref(link.href, pathname)}
                    className="group inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-gold-500 transition-transform group-hover:translate-x-1" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Programs */}
          <Reveal delay={0.24}>
            <h3 className="font-display text-lg font-extrabold uppercase text-white">Programs</h3>
            <ul className="mt-6 space-y-3 text-sm">
              {programs.map((program) => (
                <li key={program.id}>
                  <a
                    href={resolveHref('#programs', pathname)}
                    className="group inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-gold-500 transition-transform group-hover:translate-x-1" />
                    {program.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={resolveHref('#why-us', pathname)}
                  className="group inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-gold-500 transition-transform group-hover:translate-x-1" />
                  Holistic Development
                </a>
              </li>
            </ul>
          </Reveal>
        </div>
      </Container>

      {/*
        Legal strip.
        The last three links are PHP files on the server and almost certainly
        the URLs registered with the App Store, Play Store and Meta for the
        mobile app. Do not turn those into React routes - see README
        "Deploying". Privacy Policy / Terms of Service are this website's
        own pages (src/pages) and are labelled to keep the two apart.
      */}
      <div className="relative border-t border-white/10 bg-brand-800">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 text-center text-xs text-white/80 md:flex-row md:text-left">
          <p>
            Copyright &copy; {year} {site.fullName}. All rights reserved.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <a href="/privacy-policy" className="hover:text-gold-400">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="hover:text-gold-400">
              Terms of Service
            </a>
            <a href="/privacy-policy-for-the-colombo-kickerz-app" className="hover:text-gold-400">
              App Privacy Policy
            </a>
            <a href="/support-colombo-kickerz-app" className="hover:text-gold-400">
              App Support
            </a>
            <a href="/data-deletion-request-form" className="hover:text-gold-400">
              Data Deletion
            </a>
          </nav>
        </Container>
      </div>
    </footer>
  );
}
