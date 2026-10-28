import { describe, expect, it } from 'vitest';
import { referenceWoop } from '../__fixtures__/reference';
import { emptyCore } from '../woop';
import {
  canEnter,
  firstIncompleteStepId,
  isFlowComplete,
  linearSteps,
  nextStepId,
  phaseProgress,
  prevStepId,
  resolveStep,
} from './engine';

describe('wizard engine', () => {
  it('keeps the fixed W–O–O–P order', () => {
    const ids = linearSteps('full').map((s) => s.id);
    const first = (prefix: string) => ids.findIndex((id) => id.startsWith(prefix));
    expect(first('start')).toBeLessThan(first('wish'));
    expect(first('wish')).toBeLessThan(first('outcome'));
    expect(first('outcome')).toBeLessThan(first('obstacle'));
    expect(first('obstacle')).toBeLessThan(ids.indexOf('realism'));
    expect(ids.indexOf('realism')).toBeLessThan(first('plan'));
    // Outcome visualization directly precedes the obstacle part (mental contrasting).
    expect(ids.indexOf('obstacle-text')).toBe(ids.indexOf('outcome-short') + 1);
    expect(ids).not.toContain('realism-release');
  });

  it('does not allow jumping to the plan before the earlier steps are answered', () => {
    const empty = emptyCore();
    expect(canEnter('full', 'plan-builder', empty)).toBe(false);
    expect(resolveStep('full', 'plan-builder', empty)).toBe('start-timeframe');
    const withoutObstacle = { ...referenceWoop(), obstacle: { ...referenceWoop().obstacle, text: '' } };
    expect(resolveStep('full', 'plan-builder', withoutObstacle)).toBe('obstacle-text');
  });

  it('lets a complete WOOP open any step', () => {
    const woop = referenceWoop();
    expect(isFlowComplete('full', woop)).toBe(true);
    expect(canEnter('full', 'plan-builder', woop)).toBe(true);
    expect(resolveStep('full', 'wish-text', woop)).toBe('wish-text');
    expect(firstIncompleteStepId('full', woop)).toBeNull();
  });

  it('moves one step forward and back', () => {
    expect(nextStepId('full', 'outcome-short')).toBe('obstacle-text');
    expect(prevStepId('full', 'obstacle-text')).toBe('outcome-short');
    expect(prevStepId('full', 'start-intro')).toBeNull();
    expect(nextStepId('full', 'plan-rehearse')).toBeNull();
    expect(nextStepId('full', 'realism')).toBe('plan-builder');
  });

  it('opens the release branch only after the realism check', () => {
    const woop = referenceWoop();
    expect(canEnter('full', 'realism-release', woop)).toBe(true);
    expect(canEnter('full', 'realism-release', { ...woop, realism: null })).toBe(false);
    expect(prevStepId('full', 'realism-release')).toBe('realism');
  });

  it('has a shorter quick mode with the same order', () => {
    expect(linearSteps('quick').map((s) => s.id)).toEqual([
      'start-intro',
      'wish-text',
      'outcome-text',
      'outcome-visualize',
      'obstacle-text',
      'obstacle-visualize',
      'realism',
      'plan-builder',
      'plan-rehearse',
    ]);
  });

  it('reports progress per phase', () => {
    expect(phaseProgress('full', 'start-area').phases.every((p) => p.state === 'todo')).toBe(true);
    const progress = phaseProgress('full', 'outcome-visualize');
    expect(progress.current).toBe('outcome');
    expect(progress.phases.map((p) => p.state)).toEqual(['done', 'current', 'todo', 'todo']);
    expect(progress.phases[1]!.progress).toBe(0.5);
  });
});
