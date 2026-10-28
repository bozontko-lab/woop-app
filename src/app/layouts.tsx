import { BookOpen, House, Info, Settings } from 'lucide-react';
import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router';
import { pl } from '../content/pl';
import { cx } from '../components/ui/cx';
import { Logo } from './Logo';
import { UpdatePrompt } from './UpdatePrompt';

function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
    >
      {pl.common.skipToContent}
    </a>
  );
}

const NAV = [
  { to: '/', label: pl.nav.start, icon: House, end: true },
  { to: '/library', label: pl.nav.library, icon: BookOpen, end: false },
  { to: '/about', label: pl.nav.about, icon: Info, end: false },
  { to: '/settings', label: pl.nav.settings, icon: Settings, end: false },
];

function BottomNav() {
  return (
    <nav
      aria-label={pl.nav.mainNav}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cx(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-xs font-semibold',
                  isActive ? 'text-primary' : 'text-muted hover:text-fg',
                )
              }
            >
              <Icon aria-hidden="true" className="size-6" />
              <span className="text-center leading-tight">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-xl items-center px-4">
          <Link to="/" className="flex min-h-11 items-center gap-2.5 rounded-lg text-lg font-bold">
            <Logo className="size-8" />
            <span>{pl.app.name}</span>
          </Link>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-xl flex-1 px-4 pt-6 pb-32 outline-none">
        <Outlet />
      </main>
      <BottomNav />
      <UpdatePrompt />
      <ScrollRestoration />
    </div>
  );
}

/** Focused flows (wizard, „Przeszkoda teraz!”, check-in…) bring their own top bar and no navigation. */
export function FocusLayout() {
  return (
    <div className="min-h-dvh pt-[env(safe-area-inset-top)]">
      <SkipLink />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-xl px-4 pb-16 outline-none">
        <Outlet />
      </main>
      <UpdatePrompt />
      <ScrollRestoration />
    </div>
  );
}
