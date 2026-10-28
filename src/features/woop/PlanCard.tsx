import { pl } from '../../content/pl';
import { backupSentence, planSentence } from '../../domain/summary/format';
import type { Woop } from '../../domain/types';

/** The if–then sentence, large – the thing to remember in the moment of the obstacle. */
export function PlanCard({ woop, label, showBackup = true }: { woop: Woop; label?: string; showBackup?: boolean }) {
  const backup = backupSentence(woop.plan);
  return (
    <figure className="rounded-2xl border-2 border-plan bg-surface px-5 py-4">
      {label && <figcaption className="text-sm font-semibold text-plan">{label}</figcaption>}
      <p className="mt-1 text-2xl leading-snug font-semibold text-balance" data-testid="plan-card">
        {planSentence(woop.plan)}
      </p>
      {showBackup && backup && (
        <p className="mt-3 text-muted">
          <span className="font-semibold">{pl.sos.backupLabel}</span> {backup}
        </p>
      )}
    </figure>
  );
}
