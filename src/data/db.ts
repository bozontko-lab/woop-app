import Dexie, { type EntityTable } from 'dexie';
import type { Woop } from '../domain/types';

export interface SettingRecord {
  key: string;
  value: unknown;
}

export const DATABASE_NAME = 'woopmylife';

/** IndexedDB schema. Bump the version (and add an upgrade) when indexes change. */
export class AppDatabase extends Dexie {
  woops!: EntityTable<Woop, 'id'>;
  settings!: EntityTable<SettingRecord, 'key'>;

  constructor(name = DATABASE_NAME) {
    super(name);
    this.version(1).stores({
      woops: 'id, status, updatedAt, createdAt',
      settings: 'key',
    });
  }
}
