import { pl } from '../../content/pl';
import type { Woop } from '../types';

export const EXPORT_SCHEMA_VERSION = 1;

export interface WoopExport {
  app: string;
  kind: 'woop';
  schemaVersion: number;
  exportedAt: string;
  woop: Woop;
}

export function buildJsonExport(woop: Woop, exportedAt: string): string {
  const { wizard: _wizard, ...rest } = woop;
  const payload: WoopExport = {
    app: pl.app.name,
    kind: 'woop',
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt,
    woop: { ...rest, wizard: null },
  };
  return JSON.stringify(payload, null, 2);
}
