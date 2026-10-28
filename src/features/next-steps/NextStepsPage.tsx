import { CalendarPlus, Download } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { WoopNotFound } from '../../app/errors';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Button, ButtonLink } from '../../components/ui/Button';
import { ChipGroup } from '../../components/ui/ChipGroup';
import { TextInput } from '../../components/ui/Field';
import { Loading } from '../../components/ui/Loading';
import { LiveMessage } from '../../components/ui/Notice';
import { woopRepository } from '../../data';
import { useWoop } from '../../data/hooks';
import { formatLongDate, isISODate, todayISO } from '../../domain/dates';
import { buildWoopCalendar, DEFAULT_REMINDER_TIME, type ReminderDays } from '../../domain/reminders';
import { exportFileName } from '../../domain/summary/format';
import type { Woop } from '../../domain/types';
import { downloadText } from '../../lib/download';
import { promptInstall, useInstallState } from '../../lib/install';

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

function Reminders({ woop }: { woop: Woop }) {
  const r = pl.nextSteps.reminders;
  const [time, setTime] = useState(woop.obstacle.time || DEFAULT_REMINDER_TIME);
  const [days, setDays] = useState<ReminderDays>('daily');
  const [includeReview, setIncludeReview] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const download = () => {
    const ics = buildWoopCalendar(
      woop,
      { time: time || DEFAULT_REMINDER_TIME, days, includeReview, from: todayISO() },
      new Date(),
    );
    const name = exportFileName(woop, 'ics');
    downloadText(ics, name, 'text/calendar');
    setMessage(t(pl.summary.downloaded, { name }));
  };

  return (
    <Section id="reminders-title" title={r.title}>
      <p className="text-muted">{r.body}</p>
      <TextInput type="time" label={r.time} value={time} onValueChange={setTime} className="max-w-40" />
      <ChipGroup
        legend={r.days}
        options={(Object.keys(r.daysOptions) as ReminderDays[]).map((value) => ({
          value,
          label: r.daysOptions[value],
        }))}
        value={days}
        onChange={setDays}
      />
      {woop.timeframe && (
        <p className="text-sm text-muted">{t(r.until, { date: formatLongDate(woop.timeframe.endDate, pl.locale) })}</p>
      )}
      {woop.reviewDate && (
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            checked={includeReview}
            onChange={(event) => setIncludeReview(event.target.checked)}
            className="size-5 accent-[var(--primary)]"
          />
          {r.includeReview}
        </label>
      )}
      <div>
        <Button onClick={download} icon={<CalendarPlus aria-hidden="true" className="size-5" />}>
          {r.download}
        </Button>
      </div>
      <p className="text-sm text-muted">{r.hint}</p>
      <LiveMessage message={message} />
    </Section>
  );
}

function Review({ woop }: { woop: Woop }) {
  const r = pl.nextSteps.review;
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
      <TextInput
        type="date"
        label={r.label}
        min={todayISO()}
        value={date}
        onValueChange={setDate}
        className="max-w-52"
      />
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
  const { id } = useParams();
  const loaded = useWoop(id);
  const n = pl.nextSteps;
  useDocumentTitle(n.title);
  if (loaded.status === 'loading') return <Loading />;
  const woop = loaded.value;
  if (!woop) return <WoopNotFound />;
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{n.title}</h1>
        <p className="text-lg text-muted">{n.intro}</p>
      </header>
      <Reminders woop={woop} />
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
