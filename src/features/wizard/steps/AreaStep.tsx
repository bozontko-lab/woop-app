import { pl } from '../../../content/pl';
import { ChipGroup } from '../../../components/ui/ChipGroup';
import { AREAS } from '../../../domain/types';
import type { StepProps } from '../types';

export function AreaStep({ woop, update, registerField }: StepProps) {
  return (
    <div ref={(el) => registerField(el?.querySelector('input') ?? null)}>
      <ChipGroup
        legend={pl.steps['start-area'].title}
        legendHidden
        options={AREAS.map((area) => ({ value: area, label: pl.areas[area].label }))}
        value={woop.area}
        onChange={(area) => update((w) => ({ ...w, area }))}
      />
    </div>
  );
}
