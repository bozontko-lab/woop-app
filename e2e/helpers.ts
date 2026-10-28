import { expect, type Page } from '@playwright/test';
import { pl } from '../src/content/pl';
import { REFERENCE, referenceWoop } from '../src/domain/__fixtures__/reference';
import type { Woop } from '../src/domain/types';

export { pl, REFERENCE, referenceWoop };

export const heading = (page: Page) => page.getByRole('heading', { level: 1 });
export const mainField = (page: Page) => page.locator('main textarea, main input[type="text"]').first();

export async function next(page: Page) {
  await page.getByRole('button', { name: pl.common.next, exact: true }).click();
}

/** Chips are native radios hidden behind their labels – pick them like a user does. */
export async function choose(page: Page, label: string) {
  await page.locator('label', { hasText: label }).first().click();
}

export async function setSlider(page: Page, value: number) {
  const slider = page.getByRole('slider');
  await slider.focus();
  await page.keyboard.press('Home');
  for (let i = 1; i < value; i++) await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuetext', `${value} z 10`);
}

export async function expectStep(page: Page, title: string | RegExp) {
  await expect(heading(page)).toHaveText(title);
}

export async function startWizard(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: pl.home.newWoop }).click();
  await expectStep(page, pl.steps['start-intro'].title);
  await page.getByRole('button', { name: pl.intro.start }).click();
  await expectStep(page, pl.steps['start-timeframe'].title);
}

/** Walks the whole wizard with the reference WOOP; returns the caption of each W–O–O–P phase in order. */
export async function completeReferenceWizard(page: Page, options: { realism?: number } = {}) {
  const captions: string[] = [];
  const caption = async () => {
    const text = (await page.locator('nav[aria-label="Postęp WOOP"] p').textContent()) ?? '';
    if (captions.at(-1) !== text) captions.push(text);
  };

  await startWizard(page);
  await choose(page, pl.timeframes.month.label);
  await next(page);
  await choose(page, pl.areas.movement.label);
  await next(page);

  await expectStep(page, /Jakie ważne życzenie chcesz spełnić w najbliższym miesiącu\?/u);
  await caption();
  await mainField(page).fill(REFERENCE.wish);
  await next(page);
  await mainField(page).fill('12 odhaczonych treningów w kalendarzu');
  await next(page);
  await setSlider(page, 8);
  await next(page);
  await expectStep(page, pl.steps['wish-short'].title);
  await expect(mainField(page)).toHaveValue('3 treningi w tygodniu');
  await next(page);

  await expectStep(page, pl.steps['outcome-text'].title);
  await caption();
  await mainField(page).fill(REFERENCE.outcome);
  await next(page);
  await page.getByRole('button', { name: pl.deeper.skip }).click();
  await expectStep(page, pl.steps['outcome-visualize'].title);
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await expectStep(page, pl.steps['outcome-short'].title);
  await next(page);

  await expectStep(page, pl.steps['obstacle-text'].title);
  await caption();
  await mainField(page).fill(REFERENCE.obstacle);
  await next(page);
  await choose(page, pl.obstacleTypes.thought.label);
  await next(page);
  await page.getByLabel(pl.obstacleContext.whenLabel, { exact: true }).fill('po pracy');
  await page.getByLabel(pl.obstacleContext.timeLabel, { exact: true }).fill('18:00');
  await next(page);
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await expectStep(page, pl.steps['obstacle-short'].title);
  await expect(mainField(page)).toHaveValue('Zmęczenie i „zrobię to jutro”');
  await next(page);

  await expectStep(page, pl.steps.realism.title);
  await setSlider(page, options.realism ?? 8);
  await next(page);

  await expectStep(page, pl.steps['plan-builder'].title);
  await caption();
  await page.getByLabel(pl.planBuilder.ifLabel, { exact: true }).fill(REFERENCE.planIf);
  await page.getByLabel(pl.planBuilder.thenLabel, { exact: true }).fill(REFERENCE.planThen);
  await expect(page.getByTestId('plan-preview')).toHaveText(REFERENCE.planSentence);
  await next(page);
  await page.getByRole('button', { name: pl.common.skip }).click();
  await expectStep(page, pl.steps['plan-short'].title);
  await next(page);
  await expectStep(page, pl.steps['plan-rehearse'].title);
  await page.getByRole('button', { name: pl.rehearse.spoken }).click();
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await page.getByRole('button', { name: pl.rehearse.finish }).click();
  await page.waitForURL(/\/woop\/[^/?]+\?created=1$/u);
  return captions;
}

/** Puts a WOOP straight into the app's IndexedDB (after the app has created it). */
export async function seedWoop(page: Page, woop: Woop) {
  await page.goto('/');
  await expect(heading(page)).toHaveText(pl.home.title);
  await page.evaluate(async (record) => {
    const request = indexedDB.open('woopmylife');
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const tx = db.transaction('woops', 'readwrite');
    tx.objectStore('woops').put(record);
    await new Promise((resolve) => (tx.oncomplete = resolve));
    db.close();
  }, woop);
}
