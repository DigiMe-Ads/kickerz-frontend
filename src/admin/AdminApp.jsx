import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { AuthProvider, useAuth } from './auth';
import { ToastHost, Spinner } from './components/ui';
import AdminLayout from './components/AdminLayout';
import LoginScreen from './components/LoginScreen';
import NotAuthorized from './components/NotAuthorized';
import Dashboard from './pages/Dashboard';
import Scores from './pages/Scores';
import { SUPABASE_CONFIGURED } from '../lib/supabase-config';

function Gate() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (!user) return <LoginScreen />;
  if (!isAdmin) return <NotAuthorized />;

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="scores" element={<Scores />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

/**
 * /admin - the content dashboard and the scores page, behind one sign-in.
 *
 * Nothing here is secret: anyone can load this bundle and see the login
 * screen. What protects the site is that every table refuses any write
 * that isn't from an account listed in the `admins` table (see
 * supabase/schema.sql's Row Level Security policies), whatever this UI does.
 */
export default function AdminApp() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Admin · Colombo Kickerz';

    // Keep admin pages out of search results.
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);

    return () => {
      document.title = prevTitle;
      robots.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <ToastHost>
        {!SUPABASE_CONFIGURED && (
          <div className="flex items-center justify-center gap-2 bg-gold-500 px-3 py-2 text-center text-xs font-bold text-ink-900">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY aren’t set - sign-in will fail until they are.
            See README “Admin &amp; Supabase”.
          </div>
        )}
        <Gate />
      </ToastHost>
    </AuthProvider>
  );
}
