import { coreOf } from './woop';
import type { Woop, WoopCore, VersionReason } from './types';

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function coreEquals(a: WoopCore, b: WoopCore): boolean {
  return stable(coreOf(a)) === stable(coreOf(b));
}

/** Keeps `base` (the content before the change) in the history and starts the next version. */
export function startNewVersion(woop: Woop, base: WoopCore, reason: VersionReason, now: string): Woop {
  return {
    ...woop,
    history: [...woop.history, { version: woop.version, savedAt: now, reason, core: coreOf(base) }],
    version: woop.version + 1,
  };
}

/** A new iteration for a new obstacle: the wish and the outcome stay, obstacle and plan start over. */
export function resetForNewObstacle(woop: Woop): Woop {
  return {
    ...woop,
    obstacle: { text: '', short: '', type: null, when: '', where: '', time: '' },
    realism: null,
    plan: { ifText: '', thenText: '', backupPlan: '', short: '' },
  };
}
