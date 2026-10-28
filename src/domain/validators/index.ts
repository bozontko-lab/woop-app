import type { Lexicon, Nudge, StepId, WoopCore } from '../types';
import { validateObstacleText } from './obstacle';
import { validateOutcomeText } from './outcome';
import { validateAction, validatePlan } from './plan';
import { validateShort } from './short';
import { validateImportance, validateWishSuccess, validateWishText } from './wish';

export { findExternal, isInternal, splitObstacles, suggestObstacleType, validateObstacleText } from './obstacle';
export { validateOutcomeText } from './outcome';
export { hasFirstPersonVerb, isIfPartWishLike, validateAction, validatePlan, validatePlanSentence } from './plan';
export { SHORT_MAX_WORDS, validateShort } from './short';
export { findDependency, findVague, hasMeasure, isWishConcrete, validateWishText } from './wish';

/** Suggestions shown after „Dalej” on a given wizard step (most important first). */
export function validateStep(stepId: StepId, woop: WoopCore, lexicon: Lexicon): Nudge[] {
  switch (stepId) {
    case 'wish-text':
      return validateWishText(woop.wish, lexicon);
    case 'wish-success':
      return validateWishSuccess(woop.wish);
    case 'wish-importance':
      return validateImportance(woop.wish);
    case 'wish-short':
      return validateShort(woop.wish.short, 'wish.short', lexicon);
    case 'outcome-text':
      return validateOutcomeText(woop.outcome, woop.wish, lexicon);
    case 'outcome-short':
      return validateShort(woop.outcome.short, 'outcome.short', lexicon);
    case 'obstacle-text':
      return validateObstacleText(woop.obstacle, lexicon);
    case 'obstacle-short':
      return validateShort(woop.obstacle.short, 'obstacle.short', lexicon);
    case 'plan-builder':
      return validatePlan(woop.plan, woop.wish, woop.obstacle, lexicon);
    case 'plan-backup':
      return validateAction(woop.plan.backupPlan, 'plan.backupPlan', lexicon);
    case 'plan-short':
      return validateShort(woop.plan.short, 'plan.short', lexicon);
    default:
      return [];
  }
}
