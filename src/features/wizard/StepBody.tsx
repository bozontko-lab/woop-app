import type { StepProps } from './types';
import { AreaStep } from './steps/AreaStep';
import { BackupStep } from './steps/BackupStep';
import { ContextStep } from './steps/ContextStep';
import { DeeperStep } from './steps/DeeperStep';
import { ImportanceStep } from './steps/ImportanceStep';
import { IntroStep } from './steps/IntroStep';
import { ObstacleTypeStep } from './steps/ObstacleTypeStep';
import { PlanBuilderStep } from './steps/PlanBuilderStep';
import { RealismStep, type RealismBand } from './steps/RealismStep';
import { RehearseStep } from './steps/RehearseStep';
import { ReleaseStep } from './steps/ReleaseStep';
import { ShortStep } from './steps/ShortStep';
import { TextStep } from './steps/TextStep';
import { TimeframeStep } from './steps/TimeframeStep';
import { VisualizeStep } from './steps/VisualizeStep';

interface StepBodyProps extends StepProps {
  realismPanel: RealismBand | null;
  onRealismChange: () => void;
  onRelease: (reflection: string) => void;
}

export function StepBody({ realismPanel, onRealismChange, onRelease, ...props }: StepBodyProps) {
  switch (props.step.kind) {
    case 'intro':
      return <IntroStep />;
    case 'timeframe':
      return <TimeframeStep {...props} />;
    case 'area':
      return <AreaStep {...props} />;
    case 'text':
      return <TextStep {...props} />;
    case 'importance':
      return <ImportanceStep {...props} />;
    case 'short':
      return <ShortStep {...props} />;
    case 'deeper':
      return <DeeperStep {...props} />;
    case 'visualize':
      return <VisualizeStep {...props} />;
    case 'obstacleType':
      return <ObstacleTypeStep {...props} />;
    case 'context':
      return <ContextStep {...props} />;
    case 'realism':
      return <RealismStep {...props} panel={realismPanel} onValueChange={onRealismChange} />;
    case 'release':
      return <ReleaseStep {...props} onRelease={onRelease} />;
    case 'planBuilder':
      return <PlanBuilderStep {...props} />;
    case 'planBackup':
      return <BackupStep {...props} />;
    case 'rehearse':
      return <RehearseStep {...props} />;
  }
}
