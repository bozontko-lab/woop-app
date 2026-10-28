import { PAUSE_OPTIONS } from '../../../data';
import type { StepProps } from '../types';
import { VisualizationPause } from '../VisualizationPause';

const QUICK_OPTIONS = [10, 15, 30];

export function VisualizeStep({ woop, settings, advance }: StepProps) {
  const quick = woop.mode === 'quick';
  return (
    <VisualizationPause
      defaultSeconds={quick ? 15 : settings.pauseSeconds}
      options={quick ? QUICK_OPTIONS : [...PAUSE_OPTIONS]}
      chime={settings.chime}
      onDone={advance}
      onSkip={advance}
    />
  );
}
