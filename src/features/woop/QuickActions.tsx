import { CircleCheck, Siren, Sparkles } from 'lucide-react';
import { useTodayISO } from '../../app/time';
import { pl } from '../../content/pl';
import { ButtonLink } from '../../components/ui/Button';
import { useToday } from '../../data/hooks';
import type { Woop } from '../../domain/types';

/** „Przeszkoda teraz!”, daily rehearsal and check-in for one WOOP. */
export function QuickActions({ woop }: { woop: Woop }) {
  const d = pl.dashboard;
  const today = useTodayISO();
  const activity = useToday(today);
  const checkedIn = activity.status === 'ready' && activity.value.checkins.some((c) => c.woopId === woop.id);
  const rehearsed =
    activity.status === 'ready' && activity.value.practices.some((p) => p.woopId === woop.id && p.kind === 'rehearsal');
  return (
    <div className="flex flex-col gap-2">
      <ButtonLink
        to={`/woop/${woop.id}/sos`}
        variant="obstacle"
        size="lg"
        block
        icon={<Siren aria-hidden="true" className="size-6" />}
      >
        {d.sos}
      </ButtonLink>
      <div className="grid grid-cols-2 gap-2">
        <ButtonLink
          to={`/woop/${woop.id}/rehearse`}
          variant="secondary"
          icon={
            rehearsed ? (
              <CircleCheck aria-hidden="true" className="size-5 text-ok" />
            ) : (
              <Sparkles aria-hidden="true" className="size-5" />
            )
          }
        >
          {rehearsed ? d.rehearsedToday : d.rehearse}
        </ButtonLink>
        <ButtonLink
          to={`/woop/${woop.id}/checkin`}
          variant="secondary"
          icon={checkedIn ? <CircleCheck aria-hidden="true" className="size-5 text-ok" /> : undefined}
        >
          {checkedIn ? d.checkinDone : d.checkin}
        </ButtonLink>
      </div>
    </div>
  );
}
