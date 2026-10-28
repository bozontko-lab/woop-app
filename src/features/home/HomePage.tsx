import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Loading } from '../../components/ui/Loading';
import { Notice } from '../../components/ui/Notice';
import { PHASE_STYLES } from '../../components/ui/PhaseProgress';
import { woopRepository } from '../../data';
import { useWoops } from '../../data/hooks';
import { formatDateTime, formatLongDate } from '../../domain/dates';
import { planSentence } from '../../domain/summary/format';
import type { Woop } from '../../domain/types';

function DraftItem({ woop, onDelete }: { woop: Woop; onDelete: () => void }) {
  const h = pl.home;
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-dashed border-field bg-surface px-4 py-3">
      <Link to={`/wizard/${woop.id}`} className="flex min-h-11 min-w-0 flex-1 flex-col justify-center rounded-lg">
        <span className="truncate font-semibold">{woop.wish.text.trim() || h.draftUntitled}</span>
        <span className="text-sm text-muted">
          {h.continueDraft} · {t(h.draftMeta, { date: formatDateTime(woop.updatedAt, pl.locale) })}
        </span>
      </Link>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`${h.deleteDraft}: ${woop.wish.text.trim() || h.draftUntitled}`}
        className="grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-danger"
      >
        <Trash2 aria-hidden="true" className="size-5" />
      </button>
    </li>
  );
}

function WoopItem({ woop }: { woop: Woop }) {
  return (
    <li>
      <Link
        to={`/woop/${woop.id}`}
        className="flex items-center gap-4 rounded-2xl border border-line bg-surface px-4 py-4 shadow-sm hover:bg-surface-2"
      >
        <span
          aria-hidden="true"
          className={`grid size-10 shrink-0 place-items-center rounded-full font-bold ${PHASE_STYLES.wish.badge}`}
        >
          {pl.phases.wish.letter}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-semibold">{woop.wish.short || woop.wish.text}</span>
          <span className="line-clamp-2 text-sm text-muted">{woop.plan.short || planSentence(woop.plan)}</span>
          <span className="text-sm text-muted">
            {pl.statuses[woop.status]}
            {woop.timeframe &&
              woop.status === 'active' &&
              ` · ${t(pl.home.until, { date: formatLongDate(woop.timeframe.endDate, pl.locale) })}`}
          </span>
        </span>
        <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
      </Link>
    </li>
  );
}

export function HomePage() {
  const h = pl.home;
  const navigate = useNavigate();
  const loaded = useWoops();
  const [toDelete, setToDelete] = useState<Woop | null>(null);
  const [creating, setCreating] = useState(false);
  useDocumentTitle();

  const start = async () => {
    setCreating(true);
    try {
      const draft = await woopRepository.createDraft('full');
      navigate(`/wizard/${draft.id}`);
    } finally {
      setCreating(false);
    }
  };

  if (loaded.status === 'loading') return <Loading />;
  const woops = loaded.value;
  const drafts = woops.filter((w) => w.status === 'draft');
  const active = woops.filter((w) => w.status === 'active');
  const finished = woops.filter((w) => w.status !== 'draft' && w.status !== 'active');

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{h.title}</h1>
        <p className="text-lg text-muted">{h.intro}</p>
      </header>

      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          block
          onClick={() => void start()}
          disabled={creating}
          icon={<Plus aria-hidden="true" className="size-6" />}
        >
          {h.newWoop}
        </Button>
        <p className="text-center text-sm text-muted">{h.newWoopHint}</p>
      </div>

      {woops.length === 0 && <Notice>{h.empty}</Notice>}

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

      {active.length > 0 && (
        <section aria-labelledby="active-title" className="flex flex-col gap-3">
          <h2 id="active-title" className="text-xl font-bold">
            {h.active}
          </h2>
          <ul className="flex flex-col gap-3">
            {active.map((woop) => (
              <WoopItem key={woop.id} woop={woop} />
            ))}
          </ul>
        </section>
      )}

      {finished.length > 0 && (
        <section aria-labelledby="finished-title" className="flex flex-col gap-3">
          <h2 id="finished-title" className="text-xl font-bold">
            {h.finished}
          </h2>
          <ul className="flex flex-col gap-3">
            {finished.map((woop) => (
              <WoopItem key={woop.id} woop={woop} />
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
