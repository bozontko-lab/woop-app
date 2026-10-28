import { normalize } from './text/normalize';
import type { ObstacleType, Woop, WoopCore } from './types';

/** An obstacle with its plan, reusable in a new WOOP. */
export interface LibraryEntry {
  key: string;
  woopId: string;
  wish: string;
  obstacle: string;
  obstacleShort: string;
  obstacleType: ObstacleType | null;
  when: string;
  where: string;
  ifText: string;
  thenText: string;
}

/** A complete example WOOP to start from (texts live in pl.library.templates). */
export interface WoopTemplate {
  id: string;
  label: string;
  wish: string;
  outcome: string;
  obstacle: string;
  obstacleType: ObstacleType;
  when: string;
  ifText: string;
  thenText: string;
}

/** Obstacles and plans from all saved WOOPs, including earlier versions, newest first, without duplicates. */
export function myObstaclesAndPlans(woops: readonly Woop[]): LibraryEntry[] {
  const seen = new Set<string>();
  const entries: LibraryEntry[] = [];
  const sorted = woops.filter((w) => w.status !== 'draft').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  for (const woop of sorted) {
    const versions: WoopCore[] = [woop, ...[...woop.history].reverse().map((h) => h.core)];
    for (const core of versions) {
      const { obstacle, plan } = core;
      if (!obstacle.text.trim() || !plan.thenText.trim()) continue;
      const key = normalize(`${obstacle.text}|${plan.thenText}`);
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({
        key,
        woopId: woop.id,
        wish: woop.wish.short || woop.wish.text,
        obstacle: obstacle.text,
        obstacleShort: obstacle.short,
        obstacleType: obstacle.type,
        when: obstacle.when,
        where: obstacle.where,
        ifText: plan.ifText,
        thenText: plan.thenText,
      });
    }
  }
  return entries;
}

/** Obstacles set aside when several were named at once: ideas for a next WOOP. */
export function parkedIdeas(woops: readonly Woop[]): { woopId: string; wish: string; obstacle: string }[] {
  return woops
    .filter((w) => w.status !== 'draft')
    .flatMap((w) =>
      w.parkedObstacles.map((obstacle) => ({ woopId: w.id, wish: w.wish.short || w.wish.text, obstacle })),
    );
}

/** Pre-fills a fresh draft with an example. The wizard still asks every question in order. */
export function draftFromTemplate(draft: Woop, template: WoopTemplate): Woop {
  return {
    ...draft,
    wish: { ...draft.wish, text: template.wish },
    outcome: { ...draft.outcome, text: template.outcome },
    obstacle: { ...draft.obstacle, text: template.obstacle, type: template.obstacleType, when: template.when },
    plan: { ...draft.plan, ifText: template.ifText, thenText: template.thenText },
  };
}

/** Pre-fills a fresh draft with an obstacle (and its plan) to work on again. */
export function draftFromObstacle(draft: Woop, entry: Pick<LibraryEntry, 'obstacle'> & Partial<LibraryEntry>): Woop {
  return {
    ...draft,
    obstacle: {
      ...draft.obstacle,
      text: entry.obstacle,
      type: entry.obstacleType ?? null,
      when: entry.when ?? '',
      where: entry.where ?? '',
    },
    plan: { ...draft.plan, ifText: entry.ifText ?? '', thenText: entry.thenText ?? '' },
  };
}
