import { isTimeframeValid } from '../timeframe';
import { findExternal, isIfPartWishLike, isWishConcrete, validateAction } from '../validators';
import type { Lexicon, StepId, WoopCore } from '../types';

export type ChecklistId = 'wishConcrete' | 'timeframe' | 'obstacleInternal' | 'planIfThen' | 'concreteAction';

export interface ChecklistItem {
  id: ChecklistId;
  ok: boolean;
  /** Where „Popraw” leads. */
  fixStep: StepId;
}

export function qualityChecklist(woop: WoopCore, lexicon: Lexicon): ChecklistItem[] {
  const { wish, obstacle, plan } = woop;
  const hasPlan = plan.ifText.trim().length > 0 && plan.thenText.trim().length > 0;
  return [
    { id: 'wishConcrete', ok: isWishConcrete(wish, lexicon), fixStep: 'wish-text' },
    { id: 'timeframe', ok: isTimeframeValid(woop.timeframe), fixStep: 'start-timeframe' },
    {
      id: 'obstacleInternal',
      ok: obstacle.text.trim().length > 0 && findExternal(obstacle.text, lexicon) === null,
      fixStep: 'obstacle-text',
    },
    { id: 'planIfThen', ok: hasPlan && !isIfPartWishLike(plan, wish, obstacle, lexicon), fixStep: 'plan-builder' },
    {
      id: 'concreteAction',
      ok: plan.thenText.trim().length > 0 && validateAction(plan.thenText, 'plan.thenText', lexicon).length === 0,
      fixStep: 'plan-builder',
    },
  ];
}
