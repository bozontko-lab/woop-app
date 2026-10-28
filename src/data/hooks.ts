import { useLiveQuery } from 'dexie-react-hooks';
import type { Woop, WoopStatus } from '../domain/types';
import { DEFAULT_SETTINGS, settingsRepository, woopRepository, type Settings } from './index';

export type Loadable<T> = { status: 'loading' } | { status: 'ready'; value: T };

/** Live WOOP by id; `value` is undefined when it does not exist. */
export function useWoop(id: string | undefined): Loadable<Woop | undefined> {
  const result = useLiveQuery(async () => ({ woop: id ? await woopRepository.get(id) : undefined }), [id]);
  return result ? { status: 'ready', value: result.woop } : { status: 'loading' };
}

export function useWoops(statuses?: readonly WoopStatus[]): Loadable<Woop[]> {
  const key = statuses?.join(',') ?? '';
  const result = useLiveQuery(() => woopRepository.list(statuses), [key]);
  return result ? { status: 'ready', value: result } : { status: 'loading' };
}

export function useSettings(): Settings {
  return useLiveQuery(() => settingsRepository.get(), []) ?? DEFAULT_SETTINGS;
}
