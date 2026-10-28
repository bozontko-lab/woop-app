import type { FieldPath, Woop, WoopCore, WoopMode } from './types';

export function emptyCore(): WoopCore {
  return {
    timeframe: null,
    area: null,
    wish: { text: '', short: '', successCriterion: '', importance: null },
    outcome: { text: '', short: '', deeper: [] },
    obstacle: { text: '', short: '', type: null, when: '', where: '', time: '' },
    realism: null,
    plan: { ifText: '', thenText: '', backupPlan: '', short: '' },
    parkedObstacles: [],
  };
}

export function createDraft(id: string, now: string, mode: WoopMode = 'full'): Woop {
  return {
    ...emptyCore(),
    id,
    createdAt: now,
    updatedAt: now,
    activatedAt: null,
    mode,
    status: 'draft',
    version: 1,
    history: [],
    reviewDate: null,
    closing: null,
    wizard: { stepId: 'start-intro', dismissed: [] },
  };
}

export function coreOf(woop: WoopCore): WoopCore {
  return structuredClone({
    timeframe: woop.timeframe,
    area: woop.area,
    wish: woop.wish,
    outcome: woop.outcome,
    obstacle: woop.obstacle,
    realism: woop.realism,
    plan: woop.plan,
    parkedObstacles: woop.parkedObstacles,
  });
}

type TextField = Exclude<FieldPath, 'timeframe' | 'wish.importance' | 'realism'>;

export function getText(woop: WoopCore, field: TextField): string {
  const [group, key] = field.split('.') as [keyof WoopCore, string];
  const value = (woop[group] as unknown as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : '';
}

export function setText<T extends WoopCore>(woop: T, field: TextField, value: string): T {
  const [group, key] = field.split('.') as [keyof WoopCore, string];
  return { ...woop, [group]: { ...(woop[group] as object), [key]: value } };
}

export function isTextField(field: FieldPath): field is TextField {
  return field !== 'timeframe' && field !== 'wish.importance' && field !== 'realism';
}
