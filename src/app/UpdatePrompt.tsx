import { useEffect } from 'react';
import { pl } from '../content/pl';
import { Button } from '../components/ui/Button';
import { applyUpdate, dismissPwaMessage, usePwaState } from '../lib/pwa';

const OFFLINE_READY_MS = 5000;

/**
 * Small toast at the top, so it never covers the wizard's action buttons.
 * „Offline ready” hides by itself; „new version” waits for a decision.
 */
export function UpdatePrompt() {
  const { needRefresh, offlineReady } = usePwaState();

  useEffect(() => {
    if (!offlineReady || needRefresh) return;
    const timer = window.setTimeout(dismissPwaMessage, OFFLINE_READY_MS);
    return () => window.clearTimeout(timer);
  }, [offlineReady, needRefresh]);

  if (!needRefresh && !offlineReady) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 px-4 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
      <div
        role="status"
        className="pointer-events-auto mx-auto flex max-w-xl flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-lg"
      >
        <p className="flex-1 basis-48">{needRefresh ? pl.pwa.updateAvailable : pl.pwa.offlineReady}</p>
        <div className="flex gap-2">
          {needRefresh && (
            <Button size="sm" onClick={applyUpdate}>
              {pl.pwa.reload}
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={dismissPwaMessage}>
            {needRefresh ? pl.pwa.later : pl.common.close}
          </Button>
        </div>
      </div>
    </div>
  );
}
