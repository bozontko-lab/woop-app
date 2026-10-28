import { describe, expect, it } from 'vitest';
import { referenceWoop } from './__fixtures__/reference';
import { buildBackup, emptyBackupData, mergeById, parseBackup } from './backup';
import { buildJsonExport } from './summary/json';

describe('backup', () => {
  const data = { ...emptyBackupData(), woops: [referenceWoop()] };

  it('round-trips a full backup', () => {
    const text = JSON.stringify(buildBackup('WOOPmylife', data, '2026-10-28T12:00:00.000Z'));
    const result = parseBackup(text);
    expect(result.ok && result.backup.data.woops[0]?.id).toBe('ref-1');
  });

  it('accepts a single WOOP exported from the card', () => {
    const result = parseBackup(buildJsonExport(referenceWoop(), '2026-10-28T12:00:00.000Z'));
    expect(result.ok && result.backup.data.woops.map((w) => w.id)).toEqual(['ref-1']);
  });

  it('rejects broken, foreign and newer files', () => {
    expect(parseBackup('{nie json')).toEqual({ ok: false, error: 'json' });
    expect(parseBackup('{"hello": "world"}')).toEqual({ ok: false, error: 'format' });
    expect(parseBackup(JSON.stringify({ kind: 'backup', schemaVersion: 1, data: { woops: [{ id: 1 }] } }))).toEqual({
      ok: false,
      error: 'format',
    });
    expect(parseBackup(JSON.stringify({ ...buildBackup('x', data, ''), schemaVersion: 99 }))).toEqual({
      ok: false,
      error: 'version',
    });
  });

  it('merges by id, the newer record wins', () => {
    const a = { id: '1', updatedAt: '2026-10-01', v: 'stary' };
    const b = { id: '1', updatedAt: '2026-10-05', v: 'nowy' };
    const c = { id: '2', updatedAt: '2026-10-02', v: 'inny' };
    expect(mergeById([a, c], [b])).toEqual([b, c]);
    expect(mergeById([b], [a])).toEqual([b]);
  });
});
