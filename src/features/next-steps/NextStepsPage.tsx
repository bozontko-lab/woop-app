import { Download } from 'lucide-react';
import { useState } from 'react';
import { WoopNotFound } from '../../app/errors';
import { useTodayISO } from '../../app/time';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Button, ButtonLink } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/Field';
import { Loading } from '../../components/ui/Loading';
import { LiveMessage } from '../../components/ui/Notice';
import { woopRepository } from '../../data';
import { formatLongDate, isISODate } from '../../domain/dates';
import { isReviewDue } from '../../domain/review';
import type { Woop } from '../../domain/types';
import { promptInstall, useInstallState } from '../../lib/install';
import { ReminderSettings } from '../reminders/ReminderSettings';
import { useLoadedWoop } from '../woop/useLoadedWoop';
import { WoopTabs } from '../woop/WoopTabs';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
      <h2 id={id} className="text-xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Review({ woop }: { woop: Woop }) {
  const r = pl.nextSteps.review;
  const today = useTodayISO();
  const [date, setDate] = useState(woop.reviewDate ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const save = async () => {
    if (!isISODate(date)) return;
    await woopRepository.save({ ...woop, reviewDate: date });
    setMessage(t(r.saved, { date: formatLongDate(date, pl.locale) }));
  };
  return (
    <Section id="review-title" title={r.title}>
      <p className="text-muted">{r.body}</p>
      {woop.status === 'active' && (
        <div>
          <ButtonLink to={`/woop/${woop.id}/review`} variant={isReviewDue(woop, today) ? 'primary' : 'secondary'}>
            {pl.review.start}
          </ButtonLink>
        </div>
      )}
      <TextInput type="date" label={r.label} min={today} value={date} onValueChange={setDate} className="max-w-52" />
      <div>
        <Button variant="secondary" onClick={() => void save()} disabled={!isISODate(date)}>
          {r.save}
        </Button>
      </div>
      <LiveMessage message={message} />
    </Section>
  );
}

function Install() {
  const i = pl.nextSteps.install;
  const { canPrompt, installed, standalone, ios } = useInstallState();
  const [accepted, setAccepted] = useState(false);
  return (
    <Section id="install-title" title={i.title}>
      <p className="text-muted">{t(i.body, { app: pl.app.name })}</p>
      {standalone || installed ? (
        <p className="font-medium">{accepted ? i.accepted : i.installed}</p>
      ) : canPrompt ? (
        <div>
          <Button
            onClick={() => void promptInstall().then(setAccepted)}
            icon={<Download aria-hidden="true" className="size-5" />}
          >
            {i.button}
          </Button>
        </div>
      ) : (
        <p>{ios ? i.ios : i.other}</p>
      )}
    </Section>
  );
}

export function NextStepsPage() {
  const loaded = useLoadedWoop();
  const n = pl.nextSteps;
  useDocumentTitle(n.title);
  if (loaded.state === 'loading') return <Loading />;
  if (loaded.state === 'missing') return <WoopNotFound />;
  const { woop } = loaded;
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-muted">{woop.wish.short || woop.wish.text}</p>
        <h1 className="text-3xl font-bold">{n.title}</h1>
        <p className="text-lg text-muted">{n.intro}</p>
      </header>
      <WoopTabs woopId={woop.id} />
      {woop.status === 'active' && (
        <Section id="reminders-title" title={pl.reminders.title}>
          <p className="text-muted">{pl.reminders.intro}</p>
          <ReminderSettings woop={woop} />
        </Section>
      )}
      <Review woop={woop} />
      <Install />
      <div className="flex flex-wrap gap-3">
        <ButtonLink to={`/woop/${woop.id}`} variant="secondary">
          {n.backToCard}
        </ButtonLink>
        <ButtonLink to="/">{n.backHome}</ButtonLink>
      </div>
    </div>
  );
}
