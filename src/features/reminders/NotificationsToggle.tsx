import { Bell } from 'lucide-react';
import { pl } from '../../content/pl';
import { Button } from '../../components/ui/Button';
import { notify, requestNotifications, useNotificationState } from '../../lib/notifications';

export function NotificationsToggle({ showTitle = true }: { showTitle?: boolean }) {
  const n = pl.reminders.notifications;
  const state = useNotificationState();
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-surface-2 p-4">
      {showTitle && <p className="font-semibold">{n.title}</p>}
      <p className="text-sm text-muted">{n.body}</p>
      {state === 'unsupported' && <p className="text-sm">{n.unsupported}</p>}
      {state === 'denied' && <p className="text-sm">{n.denied}</p>}
      {state === 'default' && (
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void requestNotifications()}
            icon={<Bell aria-hidden="true" className="size-4" />}
          >
            {n.enable}
          </Button>
        </div>
      )}
      {state === 'granted' && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium">{n.enabled}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              void notify(n.testTitle, {
                body: pl.planBuilder.sentence.replace('{if}', '…').replace('{then}', '…'),
                tag: 'test',
              })
            }
          >
            {n.test}
          </Button>
        </div>
      )}
    </div>
  );
}
