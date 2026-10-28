import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { referenceWoop } from '../domain/__fixtures__/reference';
import { buildBackup, parseBackup } from '../domain/backup';
import { exportAll, importAll } from './backupService';
import { AppDatabase } from './db';
import { createTrackingRepositories } from './trackingRepositories';
import { createWoopRepository } from './woopRepository';

let counter = 0;
const databases: AppDatabase[] = [];

function setup() {
  const db = new AppDatabase(`tracking-${++counter}`);
  databases.push(db);
  let tick = 0;
  let id = 0;
  const clock = { now: () => new Date(2026, 9, 28, 18, 0, tick++), newId: () => `id-${++id}` };
  return {
    db,
    woops: createWoopRepository(db, { ...clock, stashStorage: null }),
    ...createTrackingRepositories(db, clock),
  };
}

afterEach(async () => {
  await Promise.all(databases.splice(0).map((db) => db.delete()));
});

describe('tracking repositories', () => {
  it('keeps one check-in per WOOP and day', async () => {
    const { checkins } = setup();
    const first = await checkins.save({
      woopId: 'w',
      date: '2026-10-28',
      obstacleOccurred: true,
      planUsed: 'no',
      rating: 2,
      note: '',
    });
    const second = await checkins.save({
      woopId: 'w',
      date: '2026-10-28',
      obstacleOccurred: true,
      planUsed: 'yes',
      rating: 4,
      note: 'lepiej',
    });
    expect(second.id).toBe(first.id);
    expect(second.createdAt).toBe(first.createdAt);
    expect(await checkins.listForWoop('w')).toEqual([second]);
    const none = await checkins.save({
      woopId: 'w',
      date: '2026-10-29',
      obstacleOccurred: false,
      planUsed: 'yes',
      rating: null,
      note: '',
    });
    expect(none.planUsed).toBeNull();
  });

  it('logs „Przeszkoda teraz!” and rehearsals with the local date', async () => {
    const { practices } = setup();
    const sos = await practices.add({ woopId: 'w', kind: 'sos' });
    expect(sos).toMatchObject({ kind: 'sos', date: '2026-10-28', planUsed: null });
    await practices.setPlanUsed(sos.id, 'partly');
    await practices.add({ woopId: 'w', kind: 'rehearsal' });
    expect((await practices.listForDate('2026-10-28')).map((p) => [p.kind, p.planUsed])).toEqual([
      ['sos', 'partly'],
      ['rehearsal', null],
    ]);
  });

  it('replaces the reminders of a WOOP', async () => {
    const { reminders } = setup();
    const base = { woopId: 'w', days: [1, 2, 3], enabled: true, lastNotified: null, createdAt: '', updatedAt: '' };
    await reminders.replaceForWoop('w', [{ ...base, id: 'a', kind: 'checkin', time: '21:00' }]);
    await reminders.replaceForWoop('w', [{ ...base, id: 'b', kind: 'obstacle', time: '18:00' }]);
    expect((await reminders.listForWoop('w')).map((r) => r.id)).toEqual(['b']);
    await reminders.markNotified('b', '2026-10-28');
    expect((await reminders.listAll())[0]?.lastNotified).toBe('2026-10-28');
  });

  it('removes a WOOP together with everything that belongs to it', async () => {
    const { woops, checkins, practices, reviews, db } = setup();
    await woops.save(referenceWoop({ id: 'w' }));
    await checkins.save({
      woopId: 'w',
      date: '2026-10-28',
      obstacleOccurred: false,
      planUsed: null,
      rating: 5,
      note: '',
    });
    await practices.add({ woopId: 'w', kind: 'rehearsal' });
    await reviews.add({
      woopId: 'w',
      date: '2026-10-28',
      whatWorked: '',
      obstacleChanged: false,
      planNeedsFix: false,
      decision: 'keep',
      version: 1,
    });
    await woops.remove('w');
    expect(await db.checkins.count()).toBe(0);
    expect(await db.practices.count()).toBe(0);
    expect(await db.reviews.count()).toBe(0);
  });
});

describe('backup service', () => {
  it('exports and imports everything (replace)', async () => {
    const source = setup();
    await source.woops.save(referenceWoop({ id: 'w' }));
    await source.checkins.save({
      woopId: 'w',
      date: '2026-10-28',
      obstacleOccurred: true,
      planUsed: 'yes',
      rating: 4,
      note: '',
    });
    const text = JSON.stringify(buildBackup('WOOPmylife', await exportAll(source.db), '2026-10-28T20:00:00.000Z'));

    const target = setup();
    await target.woops.save(referenceWoop({ id: 'other' }));
    const parsed = parseBackup(text);
    if (!parsed.ok) throw new Error(parsed.error);
    await importAll(target.db, parsed.backup.data, 'replace');
    expect((await target.woops.list()).map((w) => w.id)).toEqual(['w']);
    expect(await target.checkins.listForWoop('w')).toHaveLength(1);
  });

  it('merges by id and keeps one check-in per day (newer wins)', async () => {
    const { db, woops, checkins } = setup();
    await woops.save(referenceWoop({ id: 'w' }));
    const local = await checkins.save({
      woopId: 'w',
      date: '2026-10-28',
      obstacleOccurred: true,
      planUsed: 'no',
      rating: 2,
      note: '',
    });
    const incoming = { ...local, id: 'from-backup', planUsed: 'yes' as const, updatedAt: '2099-01-01T00:00:00.000Z' };
    await importAll(
      db,
      {
        woops: [referenceWoop({ id: 'x' })],
        checkins: [incoming],
        practices: [],
        reviews: [],
        reminders: [],
        settings: [],
      },
      'merge',
    );
    expect((await woops.list()).map((w) => w.id).sort()).toEqual(['w', 'x']);
    expect(await checkins.listForWoop('w')).toEqual([incoming]);
  });
});
