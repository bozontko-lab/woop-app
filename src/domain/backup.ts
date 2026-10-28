import type { Checkin, Practice, Reminder, Review, Woop, WoopStatus } from './types';

export const BACKUP_SCHEMA_VERSION = 1;

export interface BackupData {
  woops: Woop[];
  checkins: Checkin[];
  practices: Practice[];
  reviews: Review[];
  reminders: Reminder[];
  settings: { key: string; value: unknown }[];
}

export interface BackupFile {
  app: string;
  kind: 'backup';
  schemaVersion: number;
  exportedAt: string;
  data: BackupData;
}

export type BackupError = 'json' | 'format' | 'version';
export type ParseResult = { ok: true; backup: BackupFile } | { ok: false; error: BackupError };

export function emptyBackupData(): BackupData {
  return { woops: [], checkins: [], practices: [], reviews: [], reminders: [], settings: [] };
}

export function buildBackup(app: string, data: BackupData, exportedAt: string): BackupFile {
  return { app, kind: 'backup', schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt, data };
}

const STATUSES: WoopStatus[] = ['draft', 'active', 'achieved', 'changed', 'released'];
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === 'string';

function isWoop(v: unknown): v is Woop {
  return (
    isObject(v) &&
    isString(v.id) &&
    isString(v.updatedAt) &&
    STATUSES.includes(v.status as WoopStatus) &&
    isObject(v.wish) &&
    isObject(v.outcome) &&
    isObject(v.obstacle) &&
    isObject(v.plan) &&
    Array.isArray(v.history)
  );
}

const belongsToWoop = (v: unknown): v is { id: string; woopId: string; updatedAt: string } =>
  isObject(v) && isString(v.id) && isString(v.woopId) && isString(v.updatedAt);

/** Reads a backup file; a single exported WOOP (.json from the card) is accepted too. */
export function parseBackup(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'json' };
  }
  if (!isObject(raw)) return { ok: false, error: 'format' };
  if (typeof raw.schemaVersion !== 'number') return { ok: false, error: 'format' };
  if (raw.schemaVersion > BACKUP_SCHEMA_VERSION) return { ok: false, error: 'version' };

  if (raw.kind === 'woop') {
    if (!isWoop(raw.woop)) return { ok: false, error: 'format' };
    const data = { ...emptyBackupData(), woops: [raw.woop] };
    return { ok: true, backup: buildBackup(String(raw.app ?? ''), data, String(raw.exportedAt ?? '')) };
  }

  if (raw.kind !== 'backup' || !isObject(raw.data)) return { ok: false, error: 'format' };
  const d = raw.data;
  const list = (key: keyof BackupData) => (d[key] === undefined ? [] : d[key]);
  const data = {
    woops: list('woops'),
    checkins: list('checkins'),
    practices: list('practices'),
    reviews: list('reviews'),
    reminders: list('reminders'),
    settings: list('settings'),
  };
  const valid =
    Array.isArray(data.woops) &&
    data.woops.every(isWoop) &&
    [data.checkins, data.practices, data.reviews, data.reminders].every(
      (rows) => Array.isArray(rows) && rows.every(belongsToWoop),
    ) &&
    Array.isArray(data.settings) &&
    data.settings.every((s) => isObject(s) && isString(s.key));
  if (!valid) return { ok: false, error: 'format' };
  return {
    ok: true,
    backup: buildBackup(String(raw.app ?? ''), data as BackupData, String(raw.exportedAt ?? '')),
  };
}

/** Union by id; when both sides have a record, the more recently updated one wins. */
export function mergeById<T extends { id: string; updatedAt: string }>(
  current: readonly T[],
  incoming: readonly T[],
): T[] {
  const merged = new Map(current.map((row) => [row.id, row]));
  for (const row of incoming) {
    const existing = merged.get(row.id);
    if (!existing || existing.updatedAt <= row.updatedAt) merged.set(row.id, row);
  }
  return [...merged.values()];
}

export function backupCounts(data: BackupData) {
  return {
    woops: data.woops.length,
    checkins: data.checkins.length,
    practices: data.practices.length,
    reviews: data.reviews.length,
    reminders: data.reminders.length,
  };
}
