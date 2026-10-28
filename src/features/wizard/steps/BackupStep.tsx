import { pl } from '../../../content/pl';
import { TextArea } from '../../../components/ui/Field';
import type { StepProps } from '../types';

export function BackupStep({ woop, update, registerField }: StepProps) {
  return (
    <TextArea
      ref={registerField}
      label={pl.planBuilder.backupPrefix}
      placeholder={pl.steps['plan-backup'].placeholder}
      value={woop.plan.backupPlan}
      onValueChange={(backupPlan) => update((w) => ({ ...w, plan: { ...w.plan, backupPlan } }))}
      rows={2}
    />
  );
}
