import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import AnnouncementBar from './components/layout/AnnouncementBar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Preloader from './components/layout/Preloader';
import ScrollToTop from './components/layout/ScrollToTop';
import { ContentProvider } from './content/ContentProvider';
import { resolveHref } from './lib/nav';

import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';

/**
 * The admin is its own bundle, fetched only by someone who opens /admin.
 * Supabase Auth's admin-only calls live in there too - public visitors
 * never download either.
 */
const AdminApp = lazy(() => import('./admin/AdminApp'));

function PublicShell() {
  const { pathname } = useLocation();

  return (
    <ContentProvider>
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
    </ContentProvider>
  );
}

function AdminLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
    </div>
  );
}

function AppShell() {
  // index.html paints #root dark so a first visit doesn't flash white before
  // React boots. Once anything renders, the page owns its own background -
  // on every route, including the admin, which has no splash to cover it.
  useEffect(() => {
    document.getElementById('root')?.style.removeProperty('background-color');
  }, []);

  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<AdminLoading />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="*" element={<PublicShell />} />
    </Routes>
  );
}

/**
 * Page composition.
 *
 * The public site is mostly one scrolling page - every entry in
 * data/navigation.js is an anchor into pages/Home.jsx - plus standalone
 * legal pages. Its content comes from ContentProvider: Supabase where an
 * admin has edited it, the built-in defaults everywhere else.
 *
 * /admin (the content dashboard) and /admin/scores (quick match entry) are
 * a separate, lazily loaded app with none of the public chrome.
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
