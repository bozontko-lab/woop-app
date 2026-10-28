import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { referenceWoop } from '../domain/__fixtures__/reference';
import { AppDatabase } from './db';
import { createSettingsRepository, DEFAULT_SETTINGS } from './settingsRepository';
import { createWoopRepository } from './woopRepository';

let counter = 0;
const databases: AppDatabase[] = [];

function setup() {
  const db = new AppDatabase(`test-${++counter}`);
  databases.push(db);
  let tick = 0;
  const now = () => new Date(Date.UTC(2026, 9, 28, 9, 0, tick++));
  let id = 0;
  return {
    db,
    woops: createWoopRepository(db, { now, newId: () => `id-${++id}` }),
    settings: createSettingsRepository(db),
  };
}

afterEach(async () => {
  await Promise.all(databases.splice(0).map((db) => db.delete()));
});

describe('WoopRepository', () => {
  it('creates a draft that starts at the intro step', async () => {
    const { woops } = setup();
    const draft = await woops.createDraft();
    expect(draft).toMatchObject({ id: 'id-1', status: 'draft', mode: 'full', wizard: { stepId: 'start-intro' } });
    expect(await woops.get('id-1')).toEqual(draft);
  });

  it('saves changes and stamps updatedAt', async () => {
    const { woops } = setup();
    const draft = await woops.createDraft();
    const saved = await woops.save({ ...draft, wish: { ...draft.wish, text: 'Biegać' } });
    expect(saved.updatedAt > draft.updatedAt).toBe(true);
    expect((await woops.get(draft.id))?.wish.text).toBe('Biegać');
  });

  it('lists by status, newest change first', async () => {
    const { woops } = setup();
    await woops.save(referenceWoop({ id: 'a' }));
    await woops.createDraft();
    await woops.save(referenceWoop({ id: 'b' }));
    expect((await woops.list(['active'])).map((w) => w.id)).toEqual(['b', 'a']);
    expect((await woops.list(['draft'])).map((w) => w.id)).toEqual(['id-1']);
    expect(await woops.list()).toHaveLength(3);
  });

  it('removes a WOOP', async () => {
    const { woops } = setup();
    const draft = await woops.createDraft();
    await woops.remove(draft.id);
    expect(await woops.get(draft.id)).toBeUndefined();
  });
});

describe('SettingsRepository', () => {
  it('returns defaults and merges updates', async () => {
    const { settings } = setup();
    expect(await settings.get()).toEqual(DEFAULT_SETTINGS);
    expect(await settings.update({ pauseSeconds: 60 })).toEqual({ pauseSeconds: 60, chime: true });
    expect(await settings.update({ chime: false })).toEqual({ pauseSeconds: 60, chime: false });
  });

  it('ignores invalid stored values', async () => {
    const { db, settings } = setup();
    await db.settings.put({ key: 'preferences', value: { pauseSeconds: 999, chime: 'yes' } });
    expect(await settings.get()).toEqual(DEFAULT_SETTINGS);
  });
});

describe('stash and recovery', () => {
  function memoryStorage() {
    const map = new Map<string, string>();
    return {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => void map.set(key, value),
      removeItem: (key: string) => void map.delete(key),
      key: (index: number) => [...map.keys()][index] ?? null,
      get length() {
        return map.size;
      },
    };
  }

  function setupWithStash() {
    const db = new AppDatabase(`test-stash-${++counter}`);
    databases.push(db);
    let tick = 0;
    const storage = memoryStorage();
    const now = () => new Date(Date.UTC(2026, 9, 28, 9, 0, tick++));
    return { storage, repo: createWoopRepository(db, { now, newId: () => 'draft', stashStorage: storage }) };
  }

  it('recovers an edit that never reached IndexedDB', async () => {
    const { storage, repo } = setupWithStash();
    const draft = await repo.createDraft();
    repo.stash({ ...draft, wish: { ...draft.wish, text: 'Biegać 3 razy w tygodniu' } });
    // The tab closes here – no save() call.
    await repo.recover();
    expect((await repo.get('draft'))?.wish.text).toBe('Biegać 3 razy w tygodniu');
    expect(storage.length).toBe(0);
  });

  it('drops the copy once the save succeeds and ignores older copies', async () => {
    const { storage, repo } = setupWithStash();
    const draft = await repo.createDraft();
    const edited = { ...draft, wish: { ...draft.wish, text: 'Nowe' } };
    repo.stash(edited);
    await repo.save(edited);
    expect(storage.length).toBe(0);

    repo.stash({ ...draft, wish: { ...draft.wish, text: 'Stare' } });
    await repo.save({ ...edited, wish: { ...edited.wish, text: 'Najnowsze' } });
    await repo.recover();
    expect((await repo.get('draft'))?.wish.text).toBe('Najnowsze');
  });

  it('forgets the copy when the WOOP is removed', async () => {
    const { storage, repo } = setupWithStash();
    const draft = await repo.createDraft();
    repo.stash(draft);
    await repo.remove(draft.id);
    expect(storage.length).toBe(0);
  });
});
