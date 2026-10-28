import { describe, expect, it } from 'vitest';
import { pl } from '../content/pl';
import { referenceWoop } from './__fixtures__/reference';
import { qualityChecklist } from './summary/checklist';
import { STEP_IDS } from './types';
import { validateStep } from './validators';

describe('reference WOOP from the specification', () => {
  it.each(STEP_IDS)('gets no suggestion on step %s', (stepId) => {
    expect(validateStep(stepId, referenceWoop(), pl.lexicon)).toEqual([]);
  });

  it('passes the whole quality checklist', () => {
    expect(qualityChecklist(referenceWoop(), pl.lexicon).filter((item) => !item.ok)).toEqual([]);
  });
});
