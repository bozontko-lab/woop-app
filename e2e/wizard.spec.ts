import { expect, test } from '@playwright/test';
import {
  choose,
  completeReferenceWizard,
  expectStep,
  mainField,
  next,
  pl,
  REFERENCE,
  setSlider,
  startWizard,
} from './helpers';

test('przechodzi cały kreator wzorcowym WOOP-em w stałej kolejności W–O–O–P', async ({ page }) => {
  const captions = await completeReferenceWizard(page);
  expect(captions).toEqual([
    'Etap 1 z 4: Życzenie',
    'Etap 2 z 4: Rezultat',
    'Etap 3 z 4: Przeszkoda',
    'Etap 4 z 4: Plan',
  ]);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(pl.summary.createdTitle);
  const card = page.getByRole('article', { name: pl.summary.cardLabel });
  await expect(card).toContainText('3 treningi w tygodniu');
  await expect(card).toContainText('Zmęczenie i „zrobię to jutro”');
  await expect(page.getByTestId('card-plan')).toHaveText(REFERENCE.planSentence);
  await expect(page.locator('[data-check][data-ok="false"]')).toHaveCount(0);
});

test('nie przepuszcza dalej bez pól wymaganych i nie pozwala przeskoczyć do planu', async ({ page }) => {
  await startWizard(page);
  await next(page);
  await expect(page.getByText(pl.common.requiredChoice)).toBeVisible();
  await expectStep(page, pl.steps['start-timeframe'].title);

  const url = page.url();
  await page.goto(`${url}?edit=plan-builder`);
  await expectStep(page, pl.steps['start-timeframe'].title);
});

test('podpowiedzi sugerują, ale nie blokują: ogólnik, przeszkoda zewnętrzna, „postaram się”', async ({ page }) => {
  await startWizard(page);
  await choose(page, pl.timeframes.week.label);
  await next(page);
  await next(page);

  await mainField(page).fill('Więcej się ruszać');
  await next(page);
  const nudge = page.locator('[data-nudge]');
  await expect(nudge).toHaveAttribute('data-nudge', 'wish.vague');
  await expect(nudge).toContainText(pl.nudges['wish.vague'].title);
  await page.getByRole('button', { name: pl.nudgeUi.keep }).click();
  await expectStep(page, pl.steps['wish-success'].title);

  await next(page);
  await expect(nudge).toHaveAttribute('data-nudge', 'wish.noCriterion');
  await page.getByRole('button', { name: pl.common.skip }).click();
  await setSlider(page, 3);
  await next(page);
  await expect(nudge).toHaveAttribute('data-nudge', 'wish.lowImportance');
  await page.getByRole('button', { name: pl.nudgeUi.confirmWish }).click();
  await next(page);

  await mainField(page).fill('Więcej energii i lepszy sen');
  await next(page);
  await page.getByRole('button', { name: pl.deeper.skip }).click();
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await next(page);

  await mainField(page).fill('Brak czasu');
  await next(page);
  await expect(nudge).toHaveAttribute('data-nudge', 'obstacle.external');
  await expect(nudge).toContainText('„Brak czasu” to okoliczność zewnętrzna');
  await page.getByRole('button', { name: pl.nudgeUi.edit }).click();
  await expect(mainField(page)).toBeFocused();
  await mainField(page).fill('Wieczorem zamiast ćwiczyć, scrolluję telefon');
  await next(page);
  await expectStep(page, pl.steps['obstacle-type'].title);
  await next(page);
  await next(page);
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await next(page);
  await setSlider(page, 9);
  await next(page);

  await expectStep(page, pl.steps['plan-builder'].title);
  await expect(page.getByLabel(pl.planBuilder.ifLabel, { exact: true })).toHaveValue(
    'wieczorem zamiast ćwiczyć, scrolluję telefon',
  );
  await page.getByLabel(pl.planBuilder.thenLabel, { exact: true }).fill('postaram się poćwiczyć');
  await next(page);
  await expect(nudge).toHaveAttribute('data-nudge', 'plan.weakThen');
  await expect(nudge).toContainText('„postaram się” to jeszcze nie działanie');
  await page.getByRole('button', { name: pl.nudgeUi.keep }).click();
  await expectStep(page, pl.steps['plan-backup'].title);
});

test('kilka przeszkód naraz: wybór jednej, reszta na kolejny WOOP', async ({ page }) => {
  await startWizard(page);
  await choose(page, pl.timeframes.today.label);
  await next(page);
  await next(page);
  await mainField(page).fill('Wysłać raport do 15:00');
  await next(page);
  await mainField(page).fill('Raport wysłany o 15:00');
  await next(page);
  await setSlider(page, 9);
  await next(page);
  await next(page);
  await mainField(page).fill('Spokojny wieczór i satysfakcja');
  await next(page);
  await page.getByRole('button', { name: pl.deeper.skip }).click();
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await next(page);

  await mainField(page).fill('telefon, perfekcjonizm i zmęczenie');
  await next(page);
  await expect(page.locator('[data-nudge]')).toHaveAttribute('data-nudge', 'obstacle.multiple');
  await page.getByRole('button', { name: 'perfekcjonizm', exact: true }).click();
  await expect(mainField(page)).toHaveValue('perfekcjonizm');
});

test('niska realność: można świadomie odpuścić z refleksją', async ({ page }) => {
  await startWizard(page);
  await choose(page, pl.timeframes.week.label);
  await next(page);
  await next(page);
  await mainField(page).fill('Przebiec maraton w 4 godziny');
  await next(page);
  await mainField(page).fill('Meta poniżej 4:00');
  await next(page);
  await setSlider(page, 7);
  await next(page);
  await next(page);
  await mainField(page).fill('Duma i radość');
  await next(page);
  await page.getByRole('button', { name: pl.deeper.skip }).click();
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await next(page);
  await mainField(page).fill('Boję się kontuzji i szybko się zniechęcam');
  await next(page);
  await next(page);
  await next(page);
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await next(page);

  await setSlider(page, 2);
  await next(page);
  await expect(page.getByRole('heading', { name: pl.realism.low.title })).toBeVisible();
  await expect(page.getByRole('button', { name: pl.common.next, exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: new RegExp(pl.realism.low.release) }).click();
  await expectStep(page, pl.steps['realism-release'].title);
  await page.getByLabel(pl.steps['realism-release'].label!).fill('Teraz ważniejszy jest dla mnie sen.');
  await page.getByRole('button', { name: pl.release.confirm }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(pl.summary.releasedTitle);
  await expect(page.getByText('Teraz ważniejszy jest dla mnie sen.')).toBeVisible();
});
