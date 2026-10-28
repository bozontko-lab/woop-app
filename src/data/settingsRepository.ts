import type { AppDatabase } from './db';

export const PAUSE_OPTIONS = [30, 45, 60] as const;
export type PauseSeconds = (typeof PAUSE_OPTIONS)[number];

export interface Settings {
  pauseSeconds: PauseSeconds;
  chime: boolean;
}

export const DEFAULT_SETTINGS: Settings = { pauseSeconds: 30, chime: true };

const KEY = 'preferences';

export interface SettingsRepository {
  get(): Promise<Settings>;
  update(patch: Partial<Settings>): Promise<Settings>;
}

function sanitize(value: unknown): Settings {
  const raw = (value && typeof value === 'object' ? value : {}) as Partial<Settings>;
  return {
    pauseSeconds: PAUSE_OPTIONS.includes(raw.pauseSeconds as PauseSeconds)
      ? (raw.pauseSeconds as PauseSeconds)
      : DEFAULT_SETTINGS.pauseSeconds,
    chime: typeof raw.chime === 'boolean' ? raw.chime : DEFAULT_SETTINGS.chime,
  };
}

export function createSettingsRepository(db: AppDatabase): SettingsRepository {
  return {
    async get() {
      return sanitize((await db.settings.get(KEY))?.value);
    },
    async update(patch) {
      const next = sanitize({ ...(await this.get()), ...patch });
      await db.settings.put({ key: KEY, value: next });
      return next;
    },
  };
}
