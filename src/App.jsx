import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import AnnouncementBar from './components/layout/AnnouncementBar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Preloader from './components/layout/Preloader';
import ScrollToTop from './components/layout/ScrollToTop';
import { resolveHref } from './lib/nav';

import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';

function AppShell() {
  const { pathname } = useLocation();

  return (
    <>
      <Preloader />

      {/* Keyboard users land here first. */}
      <a
        href={resolveHref('#home', pathname)}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <AnnouncementBar />
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
      <ScrollToTop />
    </>
  );
}

/**
 * Page composition.
 *
 * The site is mostly a single scrolling page - every entry in
 * data/navigation.js is an anchor into pages/Home.jsx - plus a couple of
 * standalone routes for the legal pages linked from the footer. Header,
 * Footer, the announcement bar and the back-to-top button are shared chrome
 * around every route.
 *
 * The server's .htaccess already falls through to index.html for any
 * unknown path (see public/.htaccess RULE 5), so these client-side routes
 * work without further deploy changes - see that file's own comments before
 * touching it, particularly around the three PHP-served app legal pages it
 * carves out ahead of the SPA fallback.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
