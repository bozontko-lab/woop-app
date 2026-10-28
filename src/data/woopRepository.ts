import { createDraft } from '../domain/woop';
import type { Woop, WoopMode, WoopStatus } from '../domain/types';
import type { AppDatabase } from './db';

/**
 * The only way the UI reads and writes WOOPs. Keeping Dexie behind this
 * interface lets a future sync layer replace the implementation.
 */
export interface WoopRepository {
  get(id: string): Promise<Woop | undefined>;
  /** Newest changes first. */
  list(statuses?: readonly WoopStatus[]): Promise<Woop[]>;
  /** Stores the WOOP and stamps `updatedAt`. */
  save(woop: Woop): Promise<Woop>;
  /**
   * Synchronous safety copy of a WOOP being edited. IndexedDB writes are
   * asynchronous and may be cut off when the tab closes; this copy is not.
   */
  stash(woop: Woop): void;
  /** Writes back copies newer than the stored WOOPs (after a reload or a closed tab). */
  recover(): Promise<void>;
  createDraft(mode?: WoopMode): Promise<Woop>;
  remove(id: string): Promise<void>;
}

export interface RepositoryOptions {
  now?: () => Date;
  newId?: () => string;
  /** Where stashed copies live; `null` disables them. Defaults to localStorage. */
  stashStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'> | null;
}

interface Stashed {
  stashedAt: number;
  woop: Woop;
}

const STASH_PREFIX = 'woop-stash:';

function defaultStorage(): RepositoryOptions['stashStorage'] {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function createWoopRepository(db: AppDatabase, options: RepositoryOptions = {}): WoopRepository {
  const now = options.now ?? (() => new Date());
  const newId = options.newId ?? (() => crypto.randomUUID());
  const storage = options.stashStorage === undefined ? defaultStorage() : options.stashStorage;
  let recovering: Promise<void> | null = null;

  const readStash = (id: string): Stashed | null => {
    try {
      const raw = storage?.getItem(STASH_PREFIX + id);
      return raw ? (JSON.parse(raw) as Stashed) : null;
    } catch {
      return null;
    }
  };

  const dropStash = (id: string, upTo = Number.POSITIVE_INFINITY) => {
    const stashed = readStash(id);
    if (stashed && stashed.stashedAt <= upTo) storage?.removeItem(STASH_PREFIX + id);
  };

  const repository: WoopRepository = {
    get: (id) => db.woops.get(id),

    async list(statuses) {
      const rows = statuses
        ? await db.woops
            .where('status')
            .anyOf([...statuses])
            .toArray()
        : await db.woops.toArray();
      return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    async save(woop) {
      const startedAt = now().getTime();
      const stored = { ...woop, updatedAt: now().toISOString() };
      await db.woops.put(stored);
      // Only drop the copy if nothing newer was stashed while we were writing.
      dropStash(woop.id, startedAt);
      return stored;
    },

    stash(woop) {
      try {
        storage?.setItem(
          STASH_PREFIX + woop.id,
          JSON.stringify({ stashedAt: now().getTime(), woop } satisfies Stashed),
        );
      } catch {
        // Quota exceeded or storage blocked: the IndexedDB save still runs.
      }
    },

    recover() {
      recovering ??= (async () => {
        if (!storage) return;
        const ids: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key?.startsWith(STASH_PREFIX)) ids.push(key.slice(STASH_PREFIX.length));
        }
        for (const id of ids) {
          const stashed = readStash(id);
          const stored = await db.woops.get(id);
          if (stashed && stored && Date.parse(stored.updatedAt) < stashed.stashedAt)
            await repository.save(stashed.woop);
          dropStash(id);
        }
      })().finally(() => {
        recovering = null;
      });
      return recovering;
    },

    async createDraft(mode = 'full') {
      const draft = createDraft(newId(), now().toISOString(), mode);
      await db.woops.add(draft);
      return draft;
    },

    /** Removes the WOOP together with its check-ins, practices, reviews and reminders. */
    async remove(id) {
      await db.transaction('rw', [db.woops, db.checkins, db.practices, db.reviews, db.reminders], async () => {
        await db.woops.delete(id);
        await Promise.all(
          [db.checkins, db.practices, db.reviews, db.reminders].map((table) =>
            table.where('woopId').equals(id).delete(),
          ),
        );
      });
      dropStash(id);
    },
  };
  return repository;
}
