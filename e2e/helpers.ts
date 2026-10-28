import { expect, type Page } from '@playwright/test';
import { pl } from '../src/content/pl';
import { REFERENCE, referenceWoop } from '../src/domain/__fixtures__/reference';
import { addDays, todayISO } from '../src/domain/dates';
import { computeTimeframe } from '../src/domain/timeframe';
import type { Checkin, Practice, Reminder, Woop } from '../src/domain/types';

export { pl, REFERENCE, referenceWoop };

/** The reference WOOP, created today (so date-dependent screens behave the same on any day). */
export function freshWoop(overrides: Partial<Woop> = {}): Woop {
  const now = new Date().toISOString();
  return referenceWoop({
    createdAt: now,
    updatedAt: now,
    activatedAt: now,
    timeframe: computeTimeframe('month', todayISO()),
    reviewDate: addDays(todayISO(), 7),
    ...overrides,
  });
}

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

type Seed = { woops?: Woop[]; checkins?: Checkin[]; practices?: Practice[]; reminders?: Reminder[] };

/** Puts records straight into the app's IndexedDB (after the app has created it). */
export async function seed(page: Page, data: Seed) {
  await page.goto('/');
  await expect(heading(page)).toHaveText(pl.home.title);
  await page.evaluate(async (tables) => {
    const request = indexedDB.open('woopmylife');
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const names = Object.keys(tables);
    const tx = db.transaction(names, 'readwrite');
    for (const name of names)
      for (const row of tables[name as keyof typeof tables] ?? []) tx.objectStore(name).put(row);
    await new Promise((resolve) => (tx.oncomplete = resolve));
    db.close();
  }, data);
}

export async function seedWoop(page: Page, woop: Woop) {
  await seed(page, { woops: [woop] });
}

export function checkinFor(woopId: string, date: string, extra: Partial<Checkin> = {}): Checkin {
  const stamp = `${date}T20:00:00.000Z`;
  return {
    id: `c-${woopId}-${date}`,
    woopId,
    date,
    obstacleOccurred: true,
    planUsed: 'yes',
    rating: 4,
    note: '',
    createdAt: stamp,
    updatedAt: stamp,
    ...extra,
  };
}
