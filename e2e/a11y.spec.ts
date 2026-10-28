import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { choose, mainField, next, pl, referenceWoop, seedWoop, setSlider, startWizard } from './helpers';

async function audit(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const summary = results.violations.map(
    (v) => `${label}: ${v.id} – ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );
  expect(summary).toEqual([]);
}

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`dostępność (${colorScheme})`, () => {
    test.use({ colorScheme });

    test('ekran główny, kreator z podpowiedzią i pauzą, plan', async ({ page }) => {
      await page.goto('/');
      await audit(page, 'home');
      await startWizard(page);
      await audit(page, 'timeframe');
      await choose(page, pl.timeframes.week.label);
      await next(page);
      await next(page);
      await mainField(page).fill('Więcej się ruszać');
      await page.getByRole('button', { name: pl.help.needHelp }).click();
      await page.getByText(pl.help.why).click();
      await next(page);
      await expect(page.locator('[data-nudge]')).toBeVisible();
      await audit(page, 'wish + nudge');
      await page.getByRole('button', { name: pl.nudgeUi.keep }).click();
      await next(page);
      await page.getByRole('button', { name: pl.common.skip }).click();
      await setSlider(page, 8);
      await audit(page, 'importance');
      await next(page);
      await next(page);
      await mainField(page).fill('Energia i dobry sen');
      await next(page);
      await page.getByRole('button', { name: pl.deeper.skip }).click();
      await audit(page, 'visualize');
      await page.getByRole('button', { name: pl.pause.start }).click();
      await audit(page, 'visualize running');
      await page.getByRole('button', { name: pl.pause.finishEarly }).click();
      await next(page);
      await mainField(page).fill('Po pracy czuję zmęczenie i mówię sobie „jutro”');
      await next(page);
      await audit(page, 'obstacle type');
      await next(page);
      await audit(page, 'context');
      await next(page);
      await page.getByRole('button', { name: pl.pause.skip }).click();
      await next(page);
      await setSlider(page, 5);
      await next(page);
      await audit(page, 'realism panel');
      await page.getByRole('button', { name: pl.realism.mid.proceed }).click();
      await page.getByLabel(pl.planBuilder.thenLabel, { exact: true }).fill('od razu założę strój');
      await audit(page, 'plan builder');
    });

    test('podsumowanie, „Co dalej” i ustawienia', async ({ page }) => {
      await seedWoop(page, referenceWoop({ id: 'a11y' }));
      await page.goto('/woop/a11y');
      await page.getByText(pl.summary.fullAnswers).click();
      await audit(page, 'summary');
      await page.goto('/woop/a11y/next');
      await audit(page, 'next steps');
      await page.goto('/settings');
      await audit(page, 'settings');
    });
  });
}
