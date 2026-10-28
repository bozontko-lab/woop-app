import { ArrowRight, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { WoopNotFound } from '../../app/errors';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { pl } from '../../content/pl';
import { Button, ButtonLink } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Loading } from '../../components/ui/Loading';
import { Notice } from '../../components/ui/Notice';
import { woopRepository } from '../../data';
import { useWoop } from '../../data/hooks';
import { ExportPanel } from './ExportPanel';
import { FullAnswers } from './FullAnswers';
import { PrintCard } from './PrintCard';
import { QualityChecklist } from './QualityChecklist';
import { WoopCard } from './WoopCard';

export function SummaryPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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

  const released = woop.status === 'released';
  const active = woop.status === 'active';
  const title = released ? s.releasedTitle : created ? s.createdTitle : s.title;
  const intro = released ? s.releasedBody : created ? s.createdBody : null;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold text-balance outline-none">
          {title}
        </h1>
        {intro && <p className="text-lg text-muted">{intro}</p>}
      </header>

      {released && woop.closing?.reflection && <Notice title={s.releasedReflection}>{woop.closing.reflection}</Notice>}

      <WoopCard woop={woop} />
      <FullAnswers woop={woop} editable={active} />
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
