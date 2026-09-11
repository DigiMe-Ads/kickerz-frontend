import { currentPartners, pastPartners } from '../../data/partners';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import Marquee from '../ui/Marquee';
import Reveal from '../ui/Reveal';

function LogoTile({ partner }) {
  return (
    <div className="mx-3 flex h-24 w-40 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white px-6 shadow-[0_8px_24px_-16px_rgb(15_23_42/0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_18px_40px_-22px_rgb(52_74_167/0.6)] sm:h-28 sm:w-48">
      <img
        src={partner.logo}
        alt={partner.name}
        loading="lazy"
        title={partner.name}
        className="max-h-14 w-auto max-w-full object-contain opacity-90 transition-opacity duration-500 hover:opacity-100 sm:max-h-16"
      />
    </div>
  );
}

/**
 * Partners.
 *
 * Two continuously scrolling rows running in opposite directions - current
 * partners on top, historical partners below. Both pause on hover so a logo
 * can actually be read, and both are duplicated internally by <Marquee> to
 * make the loop seamless.
 */
export default function Partners() {
  return (
    <section id="partners" className="relative py-20 lg:py-28">
      <Container>
        <div className="panel overflow-hidden px-0 py-14 lg:py-20">
          <div className="px-5 sm:px-10">
            <SectionHeading
              title="Our Partners"
              subtitle="We are proud to work with these organizations, today and throughout our journey."
            />
          </div>

          {/* ---------- Current partners ---------- */}
          <Reveal className="mt-14">
            <p className="px-5 text-center font-display text-[11px] font-bold uppercase tracking-[0.22em] text-gold-600 sm:px-10">
              Current Partners
            </p>
            <Marquee className="mt-6 py-2">
              {currentPartners.map((partner) => (
                <LogoTile key={partner.name} partner={partner} />
              ))}
            </Marquee>
          </Reveal>

          {/* ---------- Partners over the years ---------- */}
          <Reveal delay={0.1} className="mt-12">
            <p className="px-5 text-center font-display text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 sm:px-10">
              Partners Over The Years
            </p>
            <Marquee reverse speed="slow" className="mt-6 py-2">
              {pastPartners.map((partner) => (
                <LogoTile key={partner.name} partner={partner} />
              ))}
            </Marquee>
          </Reveal>

          <Reveal delay={0.2} className="mt-12 px-5 text-center sm:px-10">
            <p className="text-sm text-slate-500">
              Interested in partnering with Sri Lanka&rsquo;s leading youth football academy?{' '}
              <a
                href="#contact"
                className="font-semibold text-brand-600 underline-offset-4 hover:underline"
              >
                Get in touch
              </a>
              .
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
