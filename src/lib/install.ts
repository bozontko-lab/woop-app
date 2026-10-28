import { createStore } from './store';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/u.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

const store = createStore({ canPrompt: false, installed: false, standalone: false, ios: false });

/** Call early (before React renders) so the browser's install event is not missed. */
export function initInstallCapture(): void {
  store.set({ standalone: isStandalone(), ios: isIos() });
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    store.set({ canPrompt: true });
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    store.set({ canPrompt: false, installed: true });
  });
}

export const useInstallState = () => store.use();

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  store.set({ canPrompt: false, installed: outcome === 'accepted' });
  return outcome === 'accepted';
}
