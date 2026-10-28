import { expect, test } from '@playwright/test';
import { choose, expectStep, mainField, next, pl, startWizard } from './helpers';

const WISH = 'Codziennie 20 minut czytania przez tydzień';

async function typeWish(page: import('@playwright/test').Page) {
  await startWizard(page);
  await choose(page, pl.timeframes.week.label);
  await next(page);
  await next(page);
  await mainField(page).fill(WISH);
}

test('szkic przetrwa odświeżenie strony i wraca na ten sam krok', async ({ page }) => {
  await typeWish(page);
  await page.reload();
  await expectStep(page, /Jakie ważne życzenie chcesz spełnić w najbliższym tygodniu\?/u);
  await expect(mainField(page)).toHaveValue(WISH);
});

test('szkic przetrwa zamknięcie karty', async ({ context }) => {
  const page = await context.newPage();
  await typeWish(page);
  // Close right after typing: the draft is flushed when the page is hidden.
  await page.close({ runBeforeUnload: true });

  const again = await context.newPage();
  await again.goto('/');
  await expect(again.getByRole('heading', { name: pl.home.drafts })).toBeVisible();
  await again.getByRole('link', { name: new RegExp(WISH) }).click();
  await expectStep(again, /Jakie ważne życzenie/u);
  await expect(mainField(again)).toHaveValue(WISH);
});

test('przycisk „Wstecz” telefonu cofa o jeden krok kreatora', async ({ page }) => {
  await typeWish(page);
  await next(page);
  await expectStep(page, pl.steps['wish-success'].title);
  await page.goBack();
  await expectStep(page, /Jakie ważne życzenie/u);
  await expect(mainField(page)).toHaveValue(WISH);
});
