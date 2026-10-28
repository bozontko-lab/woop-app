import { ArrowRight, Flag, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { WoopNotFound } from '../../app/errors';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { pl } from '../../content/pl';
import { Button, ButtonLink } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Loading } from '../../components/ui/Loading';
import { LiveMessage, Notice } from '../../components/ui/Notice';
import { woopRepository } from '../../data';
import { useWoop } from '../../data/hooks';
import { t } from '../../content/t';
import { firstIncompleteStepId } from '../../domain/wizard/engine';
import { QuickActions } from '../woop/QuickActions';
import { WoopTabs } from '../woop/WoopTabs';
import { ExportPanel } from './ExportPanel';
import { FullAnswers } from './FullAnswers';
import { PrintCard } from './PrintCard';
import { QualityChecklist } from './QualityChecklist';
import { VersionHistory } from './VersionHistory';
import { WoopCard } from './WoopCard';

export function SummaryPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const message = (location.state as { message?: string } | null)?.message ?? null;
  const loaded = useWoop(id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const s = pl.summary;
  const created = searchParams.get('created') === '1';
  useDocumentTitle(s.title);

  useEffect(() => {
    if (created) headingRef.current?.focus();
  }, [created, loaded.status]);

  if (loaded.status === 'loading') return <Loading />;
  const woop = loaded.value;
  if (!woop) return <WoopNotFound />;
  if (woop.status === 'draft') return <Navigate to={`/wizard/${woop.id}`} replace />;

  const active = woop.status === 'active';
  const closing = woop.closing;
  // Released straight from the realism check vs. closed after living with the WOOP.
  const releasedEarly = woop.status === 'released' && woop.activatedAt === null;
  const title = releasedEarly
    ? s.releasedTitle
    : closing
      ? t(pl.close.closedTitle, { outcome: pl.close.outcomes[closing.outcome].label })
      : created
        ? s.createdTitle
        : s.title;
  const intro = releasedEarly ? s.releasedBody : created ? s.createdBody : null;
  const incomplete = active ? firstIncompleteStepId(woop.mode, woop) : null;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold text-balance outline-none">
          {title}
        </h1>
        {intro && <p className="text-lg text-muted">{intro}</p>}
        <LiveMessage message={message} />
      </header>

      {!created && <WoopTabs woopId={woop.id} />}

      {closing?.reflection && (
        <Notice title={releasedEarly ? s.releasedReflection : pl.close.reflectionLabel}>{closing.reflection}</Notice>
      )}

      {incomplete ? (
        <Notice tone="hint" title={pl.dashboard.incomplete}>
          <ButtonLink to={`/wizard/${woop.id}?edit=${incomplete}`} size="sm" variant="secondary" className="mt-2">
            {pl.dashboard.incompleteAction}
          </ButtonLink>
        </Notice>
      ) : (
        active && !created && <QuickActions woop={woop} />
      )}

      <WoopCard woop={woop} />
      <FullAnswers woop={woop} editable={active} />
      <VersionHistory woop={woop} />
      {active && <QualityChecklist woop={woop} />}
      <ExportPanel woop={woop} />

      {active && (
        <ButtonLink to={`/woop/${woop.id}/next`} size="lg" block>
          {s.nextSteps}
          <ArrowRight aria-hidden="true" className="size-5" />
        </ButtonLink>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <ButtonLink to="/" variant="secondary">
          {s.backHome}
        </ButtonLink>
        {active && (
          <ButtonLink
            to={`/woop/${woop.id}/close`}
            variant="secondary"
            size="sm"
            icon={<Flag aria-hidden="true" className="size-4" />}
          >
            {pl.close.confirm}
          </ButtonLink>
        )}
        <Button
          variant="danger"
          size="sm"
          onClick={() => setConfirmDelete(true)}
          icon={<Trash2 aria-hidden="true" className="size-4" />}
        >
          {s.deleteWoop}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        message={s.deleteConfirm}
        confirmLabel={pl.common.delete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          void woopRepository.remove(woop.id).then(() => navigate('/', { replace: true }));
        }}
      />
      <PrintCard woop={woop} />
    </div>
  );
}
