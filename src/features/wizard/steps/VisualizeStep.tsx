import { PAUSE_OPTIONS } from '../../../data';
import type { StepProps } from '../types';
import { VisualizationPause } from '../VisualizationPause';

export function VisualizeStep({ settings, advance }: StepProps) {
  return (
    <VisualizationPause
      defaultSeconds={settings.pauseSeconds}
      options={[...PAUSE_OPTIONS]}
      chime={settings.chime}
      onDone={advance}
      onSkip={advance}
    />
  );
}
