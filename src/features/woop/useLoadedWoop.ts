import { useParams } from 'react-router';
import { useWoop } from '../../data/hooks';
import type { Woop } from '../../domain/types';

export type LoadedWoop = { state: 'loading' } | { state: 'missing' } | { state: 'ready'; woop: Woop };

/** The WOOP from the `:id` route parameter. */
export function useLoadedWoop(): LoadedWoop {
  const { id } = useParams();
  const loaded = useWoop(id);
  if (loaded.status === 'loading') return { state: 'loading' };
  return loaded.value ? { state: 'ready', woop: loaded.value } : { state: 'missing' };
}
