import { pl } from '../content/pl';
import { t } from '../content/t';
import { reminderRepository, woopRepository } from '../data';
import { todayISO } from '../domain/dates';
import { remindersToNotify } from '../domain/reminderSchedule';
import { planSentence } from '../domain/summary/format';
import type { Reminder, Woop } from '../domain/types';
import { notificationState, notify } from './notifications';

const INTERVAL_MS = 30_000;

function message(reminder: Reminder, woop: Woop): { title: string; body: string; url: string } {
  const wish = woop.wish.short || woop.wish.text;
  const r = pl.nextSteps.reminders;
  const title = t(pl.reminders.notificationTitles[reminder.kind], { wish });
  switch (reminder.kind) {
    case 'obstacle':
      return { title, body: planSentence(woop.plan), url: `/woop/${woop.id}/sos` };
    case 'checkin':
      return { title, body: r.checkinDescription, url: `/woop/${woop.id}/checkin` };
    case 'review':
      return { title, body: r.reviewDescription, url: `/woop/${woop.id}/review` };
  }
}

/**
 * While the app is open (or alive in the background), shows due reminders as
 * system notifications. Without a push server this is best effort – the
 * calendar export is the reliable channel (see docs/DECISIONS.md).
 */
export function startReminderNotifier(): void {
  let running = false;
  const check = async () => {
    if (running || notificationState() !== 'granted') return;
    running = true;
    try {
      const [reminders, woops] = await Promise.all([reminderRepository.listAll(), woopRepository.list(['active'])]);
      for (const reminder of remindersToNotify(reminders, woops, new Date())) {
        const woop = woops.find((w) => w.id === reminder.woopId);
        if (!woop) continue;
        const { title, body, url } = message(reminder, woop);
        if (await notify(title, { body, tag: reminder.id, data: { url } })) {
          await reminderRepository.markNotified(reminder.id, todayISO());
        }
      }
    } finally {
      running = false;
    }
  };
  void check();
  window.setInterval(() => void check(), INTERVAL_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void check();
  });
}
