import type { Checkin, PlanUse, Practice, Reminder, Review } from '../domain/types';
import { toLocalISODate } from '../domain/dates';
import type { AppDatabase } from './db';

interface Clock {
  now?: () => Date;
  newId?: () => string;
}

const byDate = <T extends { date: string }>(rows: T[]) => rows.sort((a, b) => a.date.localeCompare(b.date));

export type CheckinInput = Pick<Checkin, 'woopId' | 'date' | 'obstacleOccurred' | 'planUsed' | 'rating' | 'note'>;

export interface CheckinRepository {
  listForWoop(woopId: string): Promise<Checkin[]>;
  listForDate(date: string): Promise<Checkin[]>;
  getForDay(woopId: string, date: string): Promise<Checkin | undefined>;
  /** One check-in per WOOP and day: saving again updates it. */
  save(input: CheckinInput): Promise<Checkin>;
}

export interface PracticeRepository {
  add(input: { woopId: string; kind: Practice['kind']; planUsed?: PlanUse | null }): Promise<Practice>;
  setPlanUsed(id: string, planUsed: PlanUse): Promise<void>;
  listForWoop(woopId: string): Promise<Practice[]>;
  listForDate(date: string): Promise<Practice[]>;
}

export type ReviewInput = Omit<Review, 'id' | 'createdAt' | 'updatedAt'>;

export interface ReviewRepository {
  add(input: ReviewInput): Promise<Review>;
  listForWoop(woopId: string): Promise<Review[]>;
}

export interface ReminderRepository {
  listForWoop(woopId: string): Promise<Reminder[]>;
  listAll(): Promise<Reminder[]>;
  /** Replaces the WOOP's reminders with the given set. */
  replaceForWoop(woopId: string, reminders: Reminder[]): Promise<void>;
  markNotified(id: string, date: string): Promise<void>;
}

export function createTrackingRepositories(db: AppDatabase, clock: Clock = {}) {
  const now = clock.now ?? (() => new Date());
  const newId = clock.newId ?? (() => crypto.randomUUID());

  const checkins: CheckinRepository = {
    listForWoop: async (woopId) => byDate(await db.checkins.where('woopId').equals(woopId).toArray()),
    listForDate: (date) => db.checkins.where('date').equals(date).toArray(),
    getForDay: (woopId, date) => db.checkins.where('[woopId+date]').equals([woopId, date]).first(),
    async save(input) {
      const stamp = now().toISOString();
      const existing = await checkins.getForDay(input.woopId, input.date);
      const row: Checkin = {
        ...input,
        planUsed: input.obstacleOccurred ? input.planUsed : null,
        id: existing?.id ?? newId(),
        createdAt: existing?.createdAt ?? stamp,
        updatedAt: stamp,
      };
      await db.checkins.put(row);
      return row;
    },
  };

  const practices: PracticeRepository = {
    async add({ woopId, kind, planUsed = null }) {
      const at = now();
      const row: Practice = {
        id: newId(),
        woopId,
        kind,
        at: at.toISOString(),
        date: toLocalISODate(at),
        planUsed,
        updatedAt: at.toISOString(),
      };
      await db.practices.add(row);
      return row;
    },
    async setPlanUsed(id, planUsed) {
      await db.practices.update(id, { planUsed, updatedAt: now().toISOString() });
    },
    listForWoop: async (woopId) => byDate(await db.practices.where('woopId').equals(woopId).toArray()),
    listForDate: (date) => db.practices.where('date').equals(date).toArray(),
  };

  const reviews: ReviewRepository = {
    async add(input) {
      const stamp = now().toISOString();
      const row: Review = { ...input, id: newId(), createdAt: stamp, updatedAt: stamp };
      await db.reviews.add(row);
      return row;
    },
    listForWoop: async (woopId) => byDate(await db.reviews.where('woopId').equals(woopId).toArray()),
  };

  const reminders: ReminderRepository = {
    listForWoop: (woopId) => db.reminders.where('woopId').equals(woopId).toArray(),
    listAll: () => db.reminders.toArray(),
    async replaceForWoop(woopId, rows) {
      const stamp = now().toISOString();
      await db.transaction('rw', db.reminders, async () => {
        await db.reminders.where('woopId').equals(woopId).delete();
        await db.reminders.bulkPut(rows.map((r) => ({ ...r, woopId, updatedAt: stamp })));
      });
    },
    async markNotified(id, date) {
      await db.reminders.update(id, { lastNotified: date });
    },
  };

  return { checkins, practices, reviews, reminders };
}
