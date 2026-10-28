import { registerSW } from 'virtual:pwa-register';
import { createStore } from './store';

const store = createStore({ needRefresh: false, offlineReady: false });
let updateServiceWorker: ((reload?: boolean) => Promise<void>) | null = null;

export function initPwa(): void {
  if (!('serviceWorker' in navigator)) return;
  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh: () => store.set({ needRefresh: true }),
    onOfflineReady: () => store.set({ offlineReady: true }),
  });
}

export const usePwaState = () => store.use();

export function applyUpdate(): void {
  void updateServiceWorker?.(true);
}

export function dismissPwaMessage(): void {
  store.set({ needRefresh: false, offlineReady: false });
}
