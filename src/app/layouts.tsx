import { Settings } from 'lucide-react';
import { Link, Outlet, ScrollRestoration } from 'react-router';
import { pl } from '../content/pl';
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

export function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-4">
          <Link to="/" className="flex min-h-11 items-center gap-2.5 rounded-lg text-lg font-bold">
            <Logo className="size-8" />
            <span>{pl.app.name}</span>
          </Link>
          <Link
            to="/settings"
            aria-label={pl.nav.settings}
            className="grid size-11 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
          >
            <Settings aria-hidden="true" className="size-6" />
          </Link>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-xl flex-1 px-4 pt-6 pb-16 outline-none">
        <Outlet />
      </main>
      <UpdatePrompt />
      <ScrollRestoration />
    </div>
  );
}

/** The wizard brings its own top bar (close + W–O–O–P progress). */
export function WizardLayout() {
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
