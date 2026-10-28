import { AppDatabase } from './db';
import { createSettingsRepository } from './settingsRepository';
import { createWoopRepository } from './woopRepository';

export const database = new AppDatabase();
export const woopRepository = createWoopRepository(database);
export const settingsRepository = createSettingsRepository(database);

export { DEFAULT_SETTINGS, PAUSE_OPTIONS, type PauseSeconds, type Settings } from './settingsRepository';
export type { WoopRepository } from './woopRepository';

let persistRequested = false;

/** Asks the browser not to evict our data under storage pressure (best effort, once). */
export async function requestPersistentStorage(): Promise<boolean> {
  if (persistRequested || !navigator.storage?.persist) return false;
  persistRequested = true;
  try {
    return (await navigator.storage.persisted()) || (await navigator.storage.persist());
  } catch {
    return false;
  }
}
