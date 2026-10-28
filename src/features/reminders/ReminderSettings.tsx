import { CalendarPlus } from 'lucide-react';
import { useState } from 'react';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/Field';
import { LiveMessage } from '../../components/ui/Notice';
import { cx } from '../../components/ui/cx';
import { reminderRepository } from '../../data';
import { useTracking } from '../../data/hooks';
import { formatLongDate, todayISO } from '../../domain/dates';
import { buildWoopCalendar, defaultReminders } from '../../domain/reminders';
import { exportFileName } from '../../domain/summary/format';
import type { Reminder, Woop } from '../../domain/types';
import { downloadText } from '../../lib/download';
import { NotificationsToggle } from './NotificationsToggle';

function DayToggles({ reminder, onChange }: { reminder: Reminder; onChange: (days: number[]) => void }) {
  const r = pl.reminders;
  return (
    <div role="group" aria-label={`${r.days}: ${r.kinds[reminder.kind].label}`} className="flex flex-wrap gap-1.5">
      {r.dayNames.map((name, index) => {
        const day = index + 1;
        const on = reminder.days.includes(day);
        return (
          <button
            key={name}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? reminder.days.filter((d) => d !== day) : [...reminder.days, day].sort())}
            className={cx(
              'grid size-11 place-items-center rounded-full border text-sm font-semibold',
              on ? 'border-primary bg-primary-soft text-fg' : 'border-field bg-surface text-muted hover:bg-surface-2',
            )}
          >
            {name}
            <span className="sr-only"> ({r.dayNamesFull[index]})</span>
          </button>
        );
      })}
    </div>
  );
}

function ReminderEditor({ woop, initial }: { woop: Woop; initial: Reminder[] }) {
  const r = pl.reminders;
  const [reminders, setReminders] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const change = (id: string, patch: Partial<Reminder>) =>
    setReminders((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const save = async () => {
    await reminderRepository.replaceForWoop(woop.id, reminders);
    setMessage(r.saved);
  };

  const exportIcs = async () => {
    await reminderRepository.replaceForWoop(woop.id, reminders);
    const name = exportFileName(woop, 'ics');
    downloadText(buildWoopCalendar(woop, reminders, todayISO(), new Date()), name, 'text/calendar');
    setMessage(t(pl.summary.downloaded, { name }));
  };

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {reminders.map((reminder) => {
          const kind = r.kinds[reminder.kind];
          const checkboxId = `reminder-${reminder.id}`;
          return (
            <li
              key={reminder.id}
              className="flex flex-col gap-3 rounded-xl border border-line p-4"
              data-reminder={reminder.kind}
            >
              <div className="flex items-start gap-3">
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={reminder.enabled}
                  onChange={(event) => change(reminder.id, { enabled: event.target.checked })}
                  className="mt-1 size-5 shrink-0 accent-[var(--primary)]"
                  aria-describedby={`${checkboxId}-hint`}
                />
                <div>
                  <label htmlFor={checkboxId} className="block font-semibold">
                    {kind.label}
                  </label>
                  <p id={`${checkboxId}-hint`} className="text-sm text-muted">
                    {kind.hint}
                  </p>
                </div>
              </div>
              {reminder.enabled && (
                <div className="flex flex-col gap-3 pl-8">
                  <TextInput
                    type="time"
                    label={`${r.time}: ${kind.label}`}
                    labelHidden
                    value={reminder.time}
                    onValueChange={(time) => change(reminder.id, { time: time || reminder.time })}
                    className="max-w-40"
                  />
                  <DayToggles reminder={reminder} onChange={(days) => change(reminder.id, { days })} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {woop.timeframe && (
        <p className="text-sm text-muted">
          {t(pl.nextSteps.reminders.until, { date: formatLongDate(woop.timeframe.endDate, pl.locale) })}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void exportIcs()} icon={<CalendarPlus aria-hidden="true" className="size-5" />}>
          {r.ics}
        </Button>
        <Button variant="secondary" onClick={() => void save()}>
          {r.save}
        </Button>
      </div>
      <p className="text-sm text-muted">{r.icsHint}</p>
      <LiveMessage message={message} />
      <NotificationsToggle />
    </div>
  );
}

/** Reminder set of a WOOP: saved ones, or a proposal (obstacle time, evening check-in, weekly review). */
export function ReminderSettings({ woop }: { woop: Woop }) {
  const tracking = useTracking(woop.id);
  if (tracking.status === 'loading') return null;
  const saved = tracking.value.reminders;
  const order = ['obstacle', 'checkin', 'review'];
  const initial = saved.length
    ? [...saved].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind))
    : defaultReminders(woop, new Date(), () => crypto.randomUUID());
  return <ReminderEditor key={woop.id} woop={woop} initial={initial} />;
}
