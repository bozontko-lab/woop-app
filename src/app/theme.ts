import { createStore } from '../lib/store';

export type ThemePreference = 'system' | 'light' | 'dark';

const KEY = 'theme';
const COLORS = { light: '#faf7f2', dark: '#0f1417' };

function read(): ThemePreference {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

const media = () => window.matchMedia('(prefers-color-scheme: dark)');
const store = createStore({ preference: 'system' as ThemePreference });

function apply(preference: ThemePreference): void {
  const dark = preference === 'dark' || (preference === 'system' && media().matches);
  document.documentElement.classList.toggle('dark', dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? COLORS.dark : COLORS.light);
}

export function initTheme(): void {
  const preference = read();
  store.set({ preference });
  apply(preference);
  media().addEventListener('change', () => {
    if (store.get().preference === 'system') apply('system');
  });
}

export function setThemePreference(preference: ThemePreference): void {
  try {
    if (preference === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, preference);
  } catch {
    // Storage blocked – the choice still applies until reload.
  }
  store.set({ preference });
  apply(preference);
}

export const useThemePreference = () => store.use().preference;
