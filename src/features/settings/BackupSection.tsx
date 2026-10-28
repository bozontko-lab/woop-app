import { Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Button } from '../../components/ui/Button';
import { ChipGroup } from '../../components/ui/ChipGroup';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LiveMessage, Notice } from '../../components/ui/Notice';
import { backup } from '../../data';
import { backupCounts, buildBackup, parseBackup, type BackupFile } from '../../domain/backup';
import { todayISO } from '../../domain/dates';
import { downloadText } from '../../lib/download';

type Mode = 'merge' | 'replace';

export function BackupSection() {
  const b = pl.backup;
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [mode, setMode] = useState<Mode>('merge');
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const exportAll = async () => {
    const file = buildBackup(pl.app.name, await backup.exportAll(), new Date().toISOString());
    const name = `${pl.exportText.fileBase}-kopia-${todayISO()}.json`;
    downloadText(JSON.stringify(file, null, 2), name, 'application/json');
    setMessage(t(b.exported, { name }));
  };

  const read = async (file: File) => {
    setError(null);
    setMessage(null);
    const result = parseBackup(await file.text());
    if (!result.ok) {
      setPending(null);
      setError(t(b.errors[result.error], { app: pl.app.name }));
      return;
    }
    setPending(result.backup);
  };

  const apply = async () => {
    if (!pending) return;
    await backup.importAll(pending.data, mode);
    setPending(null);
    setConfirmReplace(false);
    if (input.current) input.current.value = '';
    setMessage(b.done);
  };

  return (
    <div className="flex flex-col gap-4">
      <p>{b.body}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => void exportAll()}
          icon={<Download aria-hidden="true" className="size-5" />}
        >
          {b.export}
        </Button>
        <Button
          variant="secondary"
          onClick={() => input.current?.click()}
          icon={<Upload aria-hidden="true" className="size-5" />}
        >
          {b.import}
        </Button>
        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-label={b.import}
          data-testid="backup-file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void read(file);
          }}
        />
      </div>
      <p className="text-sm text-muted">{b.importHint}</p>
      {error && (
        <Notice tone="error" role="alert">
          {error}
        </Notice>
      )}
      {pending && (
        <div className="flex flex-col gap-4 rounded-xl border border-line p-4">
          <p className="font-medium">{t(b.preview, backupCounts(pending.data))}</p>
          <ChipGroup<Mode>
            legend={b.mode}
            layout="list"
            options={[
              { value: 'merge', label: b.merge.label, hint: b.merge.hint },
              { value: 'replace', label: b.replace.label, hint: b.replace.hint },
            ]}
            value={mode}
            onChange={setMode}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => (mode === 'replace' ? setConfirmReplace(true) : void apply())}>{b.apply}</Button>
            <Button variant="secondary" onClick={() => setPending(null)}>
              {b.cancel}
            </Button>
          </div>
        </div>
      )}
      <LiveMessage message={message} />
      <ConfirmDialog
        open={confirmReplace}
        message={b.confirmReplace}
        confirmLabel={b.replace.label}
        onCancel={() => setConfirmReplace(false)}
        onConfirm={() => void apply()}
      />
    </div>
  );
}
