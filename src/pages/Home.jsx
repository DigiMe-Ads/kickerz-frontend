import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Hero from '../components/sections/Hero';
import Stats from '../components/sections/Stats';
import About from '../components/sections/About';
import WhyUs from '../components/sections/WhyUs';
import Programs from '../components/sections/Programs';
import Testimonials from '../components/sections/Testimonials';
import Events from '../components/sections/Events';
import Team from '../components/sections/Team';
import Partners from '../components/sections/Partners';
import Gallery from '../components/sections/Gallery';
import Contact from '../components/sections/Contact';

/**
 * The one-page scrolling layout - every entry in data/navigation.js is an
 * anchor to one of the sections below, and each section owns its own data
 * file under src/data. To add a section, drop a component in
 * components/sections, give it an `id`, render it here, and add the nav
 * entry.
 */
export default function Home() {
  const { hash } = useLocation();

  // Arriving here from a different route (e.g. the footer's "Home" link
  // clicked from /privacy-policy) is a full page load, so there is no
  // section in the DOM yet for the browser's own hash-scroll to find. Once
  // this page has mounted, finish the job ourselves.
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'auto', block: 'start' });
    // Only on mount - same-page hash clicks are plain anchors and the
    // browser already handles those natively.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main>
      <Hero />
      <Stats />
      <About />
      <WhyUs />
      <Programs />
      <Testimonials />
      <Events />
      <Team />
      <Partners />
      <Gallery />
      <Contact />
    </main>
  );
}
