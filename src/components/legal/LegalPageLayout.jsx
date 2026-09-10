import { ArrowLeft } from 'lucide-react';
import Container from '../ui/Container';
import Reveal from '../ui/Reveal';

/**
 * Shared chrome for the standalone legal pages (Privacy Policy, Terms of
 * Service). Same "dark band + white panel" rhythm as the rest of the site,
 * just without the brush-stroke SectionHeading treatment - that component
 * assumes it is one heading among several on a long scrolling page, not the
 * entire point of the page.
 */
export default function LegalPageLayout({ title, updated, children }) {
  return (
    <main className="relative isolate -mt-[88px] bg-ink-950 pt-[88px]">
      <div className="relative overflow-hidden py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-pitch-lines opacity-40" />
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-600/25 blur-[110px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-gold-500/15 blur-[110px]" />

        <Container className="relative">
          <a
            href="/"
            className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back To Home
          </a>

          <h1 className="mt-6 font-display text-3xl font-black uppercase leading-[1.05] text-white sm:text-5xl">
            {title}
          </h1>
          {updated && <p className="mt-4 text-sm text-white/60">Last updated {updated}</p>}
        </Container>
      </div>

      <Container className="relative pb-20 lg:pb-28">
        <Reveal className="panel px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
          <div className="legal-prose mx-auto max-w-3xl">{children}</div>
        </Reveal>
      </Container>
    </main>
  );
}
