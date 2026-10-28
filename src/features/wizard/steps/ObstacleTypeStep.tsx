import { useMemo } from 'react';
import { pl } from '../../../content/pl';
import { t } from '../../../content/t';
import { ChipGroup } from '../../../components/ui/ChipGroup';
import { OBSTACLE_TYPES } from '../../../domain/types';
import { suggestObstacleType } from '../../../domain/validators';
import type { StepProps } from '../types';
import { AnswerContext } from './Context';

export function ObstacleTypeStep({ woop, update, registerField }: StepProps) {
  const suggested = useMemo(() => suggestObstacleType(woop.obstacle.text, pl.lexicon), [woop.obstacle.text]);
  return (
    <>
      <AnswerContext items={[{ label: pl.common.yourObstacle, value: woop.obstacle.text }]} />
      {suggested && !woop.obstacle.type && (
        <p className="text-muted">{t(pl.obstacleTypeSuggested, { type: pl.obstacleTypes[suggested].label })}</p>
      )}
      <div ref={(el) => registerField(el?.querySelector('input') ?? null)}>
        <ChipGroup
          legend={pl.steps['obstacle-type'].label}
          legendHidden
          layout="list"
          options={OBSTACLE_TYPES.map((type) => ({
            value: type,
            label: pl.obstacleTypes[type].label,
            hint: pl.obstacleTypes[type].hint,
          }))}
          value={woop.obstacle.type}
          onChange={(type) => update((w) => ({ ...w, obstacle: { ...w.obstacle, type } }))}
        />
      </div>
    </>
  );
}
