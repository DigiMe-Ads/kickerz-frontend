import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Trophy, Mail, ExternalLink, LogOut } from 'lucide-react';
import { useAuth } from '../auth';
import { DEFAULT_CONTENT } from '../../content/defaults';
import { cn } from '../../lib/cn';

const tabClass = ({ isActive }) =>
  cn(
    'inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors',
    isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-ink-900',
  );

/** Top bar shared by the dashboard and the scores page. */
export default function AdminLayout({ children }) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:px-5">
          <img src={DEFAULT_CONTENT.site.logo} alt="" className="h-9 w-auto" />
          <span className="mr-2 hidden font-display text-sm font-black uppercase tracking-wide text-ink-900 md:inline">
            Kickerz Admin
          </span>

          <nav className="flex items-center gap-1" aria-label="Admin">
            <NavLink to="/admin" end className={tabClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </NavLink>
            <NavLink to="/admin/scores" className={tabClass}>
              <Trophy className="h-4 w-4" />
              <span>Scores</span>
            </NavLink>
            <NavLink to="/admin/enquiries" className={tabClass}>
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Enquiries</span>
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-ink-900"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">View site</span>
            </a>
            <button
              type="button"
              onClick={signOut}
              title={user?.email ? `Signed in as ${user.email}` : undefined}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-ink-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
