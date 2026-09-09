import AnnouncementBar from './components/layout/AnnouncementBar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';

import Hero from './components/sections/Hero';
import Stats from './components/sections/Stats';
import About from './components/sections/About';
import WhyUs from './components/sections/WhyUs';
import Programs from './components/sections/Programs';
import Events from './components/sections/Events';
import Team from './components/sections/Team';
import Partners from './components/sections/Partners';
import Gallery from './components/sections/Gallery';
import Contact from './components/sections/Contact';

/**
 * Page composition.
 *
 * The site is a single scrolling page: every entry in data/navigation.js is an
 * anchor to one of the sections below, and each section owns its own data file
 * under src/data. To add a section, drop a component in components/sections,
 * give it an `id`, render it here, and add the nav entry.
 *
 * If the site ever grows real sub-pages, add react-router-dom around this
 * component - the server's .htaccess already falls through to index.html for
 * any unknown path, so client-side routes will work without further changes.
 */
export default function App() {
  return (
    <>
      {/* Keyboard users land here first. */}
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <AnnouncementBar />
      <Header />

      <main>
        <Hero />
        <Stats />
        <About />
        <WhyUs />
        <Programs />
        <Events />
        <Team />
        <Partners />
        <Gallery />
        <Contact />
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
}
