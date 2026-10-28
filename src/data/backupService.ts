import { mergeById, type BackupData } from '../domain/backup';
import type { Checkin } from '../domain/types';
import type { AppDatabase } from './db';

export async function exportAll(db: AppDatabase): Promise<BackupData> {
  const [woops, checkins, practices, reviews, reminders, settings] = await Promise.all([
    db.woops.toArray(),
    db.checkins.toArray(),
    db.practices.toArray(),
    db.reviews.toArray(),
    db.reminders.toArray(),
    db.settings.toArray(),
  ]);
  return { woops: woops.map((w) => ({ ...w })), checkins, practices, reviews, reminders, settings };
}

/** One check-in per WOOP and day: when ids differ, the newer entry for that day wins. */
function mergeCheckins(current: Checkin[], incoming: Checkin[]): Checkin[] {
  const byDay = new Map(current.map((c) => [`${c.woopId}|${c.date}`, c]));
  for (const row of incoming) {
    const key = `${row.woopId}|${row.date}`;
    const existing = byDay.get(key);
    if (!existing || existing.updatedAt <= row.updatedAt) byDay.set(key, row);
  }
  return [...byDay.values()];
}

export async function importAll(db: AppDatabase, data: BackupData, mode: 'merge' | 'replace'): Promise<void> {
  const tables = [db.woops, db.checkins, db.practices, db.reviews, db.reminders, db.settings];
  await db.transaction('rw', tables, async () => {
    if (mode === 'replace') {
      await Promise.all(tables.map((table) => table.clear()));
      await db.woops.bulkPut(data.woops);
      await db.checkins.bulkPut(mergeCheckins([], data.checkins));
      await db.practices.bulkPut(data.practices);
      await db.reviews.bulkPut(data.reviews);
      await db.reminders.bulkPut(data.reminders);
      await db.settings.bulkPut(data.settings);
      return;
    }
    const current = await exportAll(db);
    const checkins = mergeCheckins(current.checkins, data.checkins);
    await db.checkins.clear();
    await db.checkins.bulkPut(checkins);
    await db.woops.bulkPut(mergeById(current.woops, data.woops));
    await db.practices.bulkPut(mergeById(current.practices, data.practices));
    await db.reviews.bulkPut(mergeById(current.reviews, data.reviews));
    await db.reminders.bulkPut(mergeById(current.reminders, data.reminders));
    await db.settings.bulkPut(data.settings);
  });
}
