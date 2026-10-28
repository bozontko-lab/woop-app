import { Plus, Sunrise, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useNow } from '../../app/time';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Loading } from '../../components/ui/Loading';
import { LiveMessage, Notice } from '../../components/ui/Notice';
import { woopRepository } from '../../data';
import { useToday, useWoops } from '../../data/hooks';
import { formatDateTime, todayISO } from '../../domain/dates';
import { pluralPl } from '../../domain/text/normalize';
import type { Woop } from '../../domain/types';
import { startDraft } from '../library/startDraft';
import { ActiveWoopCard } from './ActiveWoopCard';
import { TodayList } from './TodayList';

const RECOMMENDED_ACTIVE = 3;

function DraftItem({ woop, onDelete }: { woop: Woop; onDelete: () => void }) {
  const h = pl.home;
  const title = woop.wish.text.trim() || h.draftUntitled;
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-dashed border-field bg-surface px-4 py-3">
      <Link to={`/wizard/${woop.id}`} className="flex min-h-11 min-w-0 flex-1 flex-col justify-center rounded-lg">
        <span className="truncate font-semibold">{title}</span>
        <span className="text-sm text-muted">
          {woop.mode === 'quick' ? pl.dashboard.quickWoop : h.continueDraft} ·{' '}
          {t(h.draftMeta, { date: formatDateTime(woop.updatedAt, pl.locale) })}
        </span>
      </Link>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`${h.deleteDraft}: ${title}`}
        className="grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-danger"
      >
        <Trash2 aria-hidden="true" className="size-5" />
      </button>
    </li>
  );
}

function FinishedItem({ woop }: { woop: Woop }) {
  return (
    <li>
      <Link
        to={`/woop/${woop.id}`}
        className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 hover:bg-surface-2"
      >
        <span className="font-semibold">{woop.wish.short || woop.wish.text}</span>
        <span className="text-sm text-muted">{pl.statuses[woop.status]}</span>
      </Link>
    </li>
  );
}

export function HomePage() {
  const h = pl.home;
  const d = pl.dashboard;
  const navigate = useNavigate();
  const location = useLocation();
  const message = (location.state as { message?: string } | null)?.message ?? null;
  const loaded = useWoops();
  const now = useNow();
  const today = useToday(todayISO(now));
  const [toDelete, setToDelete] = useState<Woop | null>(null);
  const [busy, setBusy] = useState(false);
  useDocumentTitle();

  const start = async (mode: 'full' | 'quick') => {
    setBusy(true);
    try {
      navigate(await startDraft(undefined, mode));
    } finally {
      setBusy(false);
    }
  };

  if (loaded.status === 'loading' || today.status === 'loading') return <Loading />;
  const woops = loaded.value;
  const drafts = woops.filter((w) => w.status === 'draft');
  const active = woops.filter((w) => w.status === 'active');
  const finished = woops.filter((w) => w.status !== 'draft' && w.status !== 'active');

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{h.title}</h1>
        <p className="text-lg text-muted">{h.intro}</p>
        <LiveMessage message={message} />
      </header>

      <TodayList woops={active} today={today.value} now={now} />

      {active.length > RECOMMENDED_ACTIVE && (
        <Notice tone="hint">
          {t(d.tooMany, {
            count: active.length,
            woops: pluralPl(active.length, d.woopsForms.one, d.woopsForms.few, d.woopsForms.many),
          })}
        </Notice>
      )}

      {active.length > 0 && (
        <section aria-labelledby="active-title" className="flex flex-col gap-3">
          <h2 id="active-title" className="text-xl font-bold">
            {h.active}
          </h2>
          <ul className="flex flex-col gap-4">
            {active.map((woop) => (
              <ActiveWoopCard key={woop.id} woop={woop} />
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="start-title" className="flex flex-col gap-3">
        <h2 id="start-title" className={active.length ? 'text-xl font-bold' : 'sr-only'}>
          {d.start}
        </h2>
        {woops.length === 0 && <Notice>{h.empty}</Notice>}
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Button
              size="lg"
              block
              onClick={() => void start('full')}
              disabled={busy}
              icon={<Plus aria-hidden="true" className="size-6" />}
            >
              {h.newWoop}
            </Button>
            <p className="text-center text-sm text-muted">{h.newWoopHint}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Button
              size="lg"
              block
              variant="secondary"
              onClick={() => void start('quick')}
              disabled={busy}
              icon={<Sunrise aria-hidden="true" className="size-6" />}
            >
              {d.quickWoop}
            </Button>
            <p className="text-center text-sm text-muted">{d.quickHint}</p>
          </div>
        </div>
      </section>

      {drafts.length > 0 && (
        <section aria-labelledby="drafts-title" className="flex flex-col gap-3">
          <h2 id="drafts-title" className="text-xl font-bold">
            {h.drafts}
          </h2>
          <ul className="flex flex-col gap-2">
            {drafts.map((woop) => (
              <DraftItem key={woop.id} woop={woop} onDelete={() => setToDelete(woop)} />
            ))}
          </ul>
        </section>
      )}

      {finished.length > 0 && (
        <section aria-labelledby="finished-title" className="flex flex-col gap-3">
          <h2 id="finished-title" className="text-xl font-bold">
            {h.finished}
          </h2>
          <ul className="flex flex-col gap-2">
            {finished.map((woop) => (
              <FinishedItem key={woop.id} woop={woop} />
            ))}
          </ul>
        </section>
      )}

      <p className="text-center text-sm text-muted">{h.privacy}</p>

      <ConfirmDialog
        open={toDelete !== null}
        message={h.deleteDraftConfirm}
        confirmLabel={pl.common.delete}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) void woopRepository.remove(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}
