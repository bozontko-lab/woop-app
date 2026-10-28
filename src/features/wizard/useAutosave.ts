import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { woopRepository } from '../../data';
import type { Woop } from '../../domain/types';

const DELAY_MS = 250;

/**
 * Debounced save of the WOOP held in `current`. Every change is also stashed
 * synchronously, so a draft survives a refresh or a closed tab even if the
 * asynchronous IndexedDB write is cut off.
 */
export function useAutosave(current: RefObject<Woop>) {
  const timer = useRef<number | undefined>(undefined);
  const dirty = useRef(false);
  const [error, setError] = useState(false);

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current);
    if (!dirty.current) return;
    dirty.current = false;
    try {
      await woopRepository.save(current.current);
      setError(false);
    } catch {
      dirty.current = true;
      setError(true);
    }
  }, [current]);

  const schedule = useCallback(() => {
    dirty.current = true;
    woopRepository.stash(current.current);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void flush(), DELAY_MS);
  }, [current, flush]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') void flush();
    };
    const onPageHide = () => void flush();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onPageHide);
      void flush();
    };
  }, [flush]);

  return { schedule, flush, error };
}
