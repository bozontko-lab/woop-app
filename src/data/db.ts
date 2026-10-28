import Dexie, { type EntityTable } from 'dexie';
import type { Checkin, Practice, Reminder, Review, Woop } from '../domain/types';

export interface SettingRecord {
  key: string;
  value: unknown;
}

export const DATABASE_NAME = 'woopmylife';

/** IndexedDB schema. Add a new version (never edit an old one) when tables or indexes change. */
export class AppDatabase extends Dexie {
  woops!: EntityTable<Woop, 'id'>;
  settings!: EntityTable<SettingRecord, 'key'>;
  checkins!: EntityTable<Checkin, 'id'>;
  practices!: EntityTable<Practice, 'id'>;
  reviews!: EntityTable<Review, 'id'>;
  reminders!: EntityTable<Reminder, 'id'>;

  constructor(name = DATABASE_NAME) {
    super(name);
    this.version(1).stores({
      woops: 'id, status, updatedAt, createdAt',
      settings: 'key',
    });
    // Stage 2: keeping up with the plan.
    this.version(2).stores({
      checkins: 'id, woopId, date, &[woopId+date]',
      practices: 'id, woopId, date, kind',
      reviews: 'id, woopId, date',
      reminders: 'id, woopId',
    });
  }
}
