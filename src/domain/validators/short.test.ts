import { describe, expect, it } from 'vitest';
import { pl } from '../../content/pl';
import { validateShort } from './short';

describe('short version validator', () => {
  it('accepts up to 6 words', () => {
    expect(validateShort('3 treningi w tygodniu', 'wish.short', pl.lexicon)).toEqual([]);
    expect(validateShort('jeden dwa trzy cztery pięć sześć', 'wish.short', pl.lexicon)).toEqual([]);
  });

  it('suggests a shorter version above 6 words', () => {
    const [nudge] = validateShort('3 treningi w tygodniu przez najbliższy miesiąc', 'wish.short', pl.lexicon);
    expect(nudge).toMatchObject({ code: 'short.tooLong', match: '7', suggestion: '3 treningi w tygodniu' });
  });
});
