import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { addDays, todayISO } from '../src/domain/dates';
import type { Reminder } from '../src/domain/types';
import {
  checkinFor,
  expectStep,
  freshWoop,
  heading,
  mainField,
  next,
  pl,
  REFERENCE,
  seed,
  seedWoop,
  setSlider,
} from './helpers';

const ID = 'stage2';
const today = todayISO();

const card = (page: Page) => page.locator(`[data-woop="${ID}"]`);

test('„Przeszkoda teraz!”: duży plan, licznik 2 minut i zapis użycia jednym kliknięciem', async ({ page }) => {
  await seedWoop(page, freshWoop({ id: ID }));
  await page.goto('/');
  await card(page).getByRole('link', { name: pl.dashboard.sos }).click();
  await expect(heading(page)).toHaveText(pl.sos.title);
  await expect(page.getByTestId('plan-card')).toHaveText(REFERENCE.planSentence);
  await page.getByRole('button', { name: pl.sos.timerStart }).click();
  await expect(page.getByText('1:5')).toBeVisible();
  await page.getByRole('button', { name: pl.sos.answers.yes, exact: true }).click();
  await expect(page.getByText(pl.sos.saved)).toBeVisible();

  await page.goto(`/woop/${ID}/progress`);
  await expect(page.getByText(/Plan użyty w 1 z 1 sytuacji/u)).toBeVisible();
});

test('codzienna powtórka: rezultat, przeszkoda, plan na głos', async ({ page }) => {
  await seedWoop(page, freshWoop({ id: ID }));
  await page.goto(`/woop/${ID}/rehearse`);
  await expect(heading(page)).toHaveText(pl.rehearsal.outcomeTitle);
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await expect(heading(page)).toHaveText(pl.rehearsal.obstacleTitle);
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await expect(heading(page)).toHaveText(pl.rehearsal.planTitle);
  await page.getByRole('button', { name: pl.rehearsal.readAloud }).click();
  await expect(page.getByText(pl.rehearsal.done)).toBeVisible();
  await page.goto('/');
  await expect(card(page).getByRole('link', { name: pl.dashboard.rehearsedToday })).toBeVisible();
});

test('szybki check-in i statystyki bez karzących streaków', async ({ page }) => {
  await seed(page, {
    woops: [freshWoop({ id: ID })],
    checkins: [checkinFor(ID, addDays(today, -1), { planUsed: 'no', note: 'zmęczenie wygrało' })],
  });
  await page.goto('/');
  await card(page).getByRole('link', { name: pl.dashboard.checkin, exact: true }).click();
  await expect(heading(page)).toHaveText(pl.checkin.title);
  await page.getByRole('button', { name: pl.checkin.save }).click();
  await expect(page.getByText(pl.common.requiredChoice).first()).toBeVisible();

  await page
    .locator('fieldset', { hasText: pl.checkin.occurred })
    .locator('label', { hasText: pl.checkin.yes })
    .click();
  await page
    .locator('fieldset', { hasText: pl.checkin.planUsed })
    .locator('label', { hasText: pl.sos.answers.partly })
    .click();
  await page.locator('fieldset', { hasText: pl.checkin.rating }).locator('label', { hasText: '4' }).click();
  await page.getByRole('button', { name: pl.checkin.save }).click();

  await expect(page.getByText(pl.checkin.saved)).toBeVisible();
  await expect(card(page).getByRole('link', { name: pl.dashboard.checkinDone })).toBeVisible();
  await page.goto(`/woop/${ID}/progress`);
  await expect(page.getByText('Plan użyty w 1 z 2 sytuacji z przeszkodą')).toBeVisible();
  await expect(page.getByText('zmęczenie wygrało')).toBeVisible();
  await expect(page.getByText(pl.stats.noStreaks)).toBeVisible();
});

test('przegląd tygodniowy: nowa przeszkoda to nowa iteracja i nowa wersja z historią', async ({ page }) => {
  await seedWoop(page, freshWoop({ id: ID, reviewDate: today }));
  await page.goto('/');
  const due = page.locator('[data-due="review"]');
  await expect(due).toContainText(pl.dashboard.due.review);
  await due.getByRole('link', { name: pl.dashboard.dueActions.review }).click();

  await expect(heading(page)).toHaveText(pl.review.title);
  await page.getByLabel(pl.review.whatWorked).fill('Strój przygotowany wieczorem');
  await page
    .locator('fieldset', { hasText: pl.review.obstacleChanged })
    .locator('label', { hasText: pl.review.yes })
    .click();
  // The decision follows the answers, but can be changed.
  await expect(page.getByRole('radio', { name: new RegExp(pl.review.decisions.newObstacle.label) })).toBeChecked();
  await page.getByRole('button', { name: pl.review.save }).click();

  await expectStep(page, pl.steps['outcome-visualize'].title);
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await next(page);
  await expectStep(page, pl.steps['obstacle-text'].title);
  await expect(mainField(page)).toHaveValue('');
  await mainField(page).fill('Wieczorem zamiast ćwiczyć, scrolluję telefon');
  await next(page);
  await next(page);
  await next(page);
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await next(page);
  await setSlider(page, 8);
  await next(page);
  await page.getByLabel(pl.planBuilder.thenLabel, { exact: true }).fill('odłożę telefon do szuflady i założę strój');
  await next(page);
  await page.getByRole('button', { name: pl.common.skip }).click();
  await next(page);
  await page.getByRole('button', { name: pl.rehearse.spoken }).click();
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await page.getByRole('button', { name: pl.rehearse.finishEdit }).click();

  await expect(page).toHaveURL(new RegExp(`/woop/${ID}$`, 'u'));
  await expect(page.getByTestId('card-plan')).toContainText('odłożę telefon do szuflady');
  await page.getByText(/Historia wersji/u).click();
  await expect(page.getByText(/Wersja 1 \(do .*, potem: nowa przeszkoda\)/u)).toBeVisible();
  await expect(page.getByText('Zmęczenie i „zrobię to jutro”').last()).toBeVisible();
});

test('zakończenie WOOP-a z refleksją', async ({ page }) => {
  await seedWoop(page, freshWoop({ id: ID }));
  await page.goto(`/woop/${ID}`);
  await page.getByRole('link', { name: pl.close.confirm }).click();
  await expect(heading(page)).toHaveText(pl.close.title);
  await page.locator('label', { hasText: pl.close.outcomes.achieved.label }).click();
  await page.getByLabel(pl.close.reflection).fill('Najtrudniejsze były pierwsze 2 minuty.');
  await page.getByRole('button', { name: pl.close.confirm }).click();
  await expect(heading(page)).toHaveText(`Zakończone: ${pl.close.outcomes.achieved.label}`);
  await expect(page.getByText('Najtrudniejsze były pierwsze 2 minuty.')).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: pl.home.finished })).toBeVisible();
});

test('szybki WOOP na dziś: krótszy kreator, bez rozbudowanych podpowiedzi', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: pl.dashboard.quickWoop }).click();
  await expectStep(page, pl.quick.title);
  await page.getByRole('button', { name: pl.intro.start }).click();
  await expectStep(page, /Jakie ważne życzenie chcesz spełnić dziś\?/u);
  await expect(page.getByRole('button', { name: pl.help.needHelp })).toHaveCount(0);
  await mainField(page).fill('Wysłać raport do 15:00');
  await next(page);
  await mainField(page).fill('Spokojny wieczór i satysfakcja');
  await next(page);
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await mainField(page).fill('Kiedy zadanie wydaje się trudne, sięgam po telefon');
  await next(page);
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await setSlider(page, 8);
  await next(page);
  await page
    .getByLabel(pl.planBuilder.thenLabel, { exact: true })
    .fill('odłożę telefon ekranem w dół i napiszę pierwsze zdanie');
  await next(page);
  await page.getByRole('button', { name: pl.rehearse.spoken }).click();
  await page.getByRole('button', { name: pl.pause.skip }).click();
  await page.getByRole('button', { name: pl.rehearse.finish }).click();
  await expect(heading(page)).toHaveText(pl.summary.createdTitle);
  await expect(page.getByRole('article', { name: pl.summary.cardLabel })).toContainText(/Dziś ·/u);
});

test('biblioteka: przykład otwiera kreator z wypełnionymi odpowiedziami', async ({ page }) => {
  await page.goto('/library');
  const sleep = pl.library.templates.find((tpl) => tpl.id === 'sleep')!;
  await page.getByRole('button', { name: `${pl.library.useTemplate}: ${sleep.label}` }).click();
  await expectStep(page, pl.steps['start-intro'].title);
  await page.getByRole('button', { name: pl.intro.start }).click();
  await page.locator('label', { hasText: pl.timeframes.week.label }).click();
  await next(page);
  await next(page);
  await expect(mainField(page)).toHaveValue(sleep.wish);
});

test('kopia zapasowa: eksport, usunięcie i przywrócenie danych', async ({ page }) => {
  await seed(page, { woops: [freshWoop({ id: ID })], checkins: [checkinFor(ID, today)] });
  await page.goto('/settings');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: pl.backup.export }).click(),
  ]);
  const path = (await download.path())!;
  const file = JSON.parse(await readFile(path, 'utf-8'));
  expect(file).toMatchObject({ kind: 'backup', schemaVersion: 1 });
  expect(file.data.woops).toHaveLength(1);
  expect(file.data.checkins).toHaveLength(1);

  await page.goto(`/woop/${ID}`);
  await page.getByRole('button', { name: pl.summary.deleteWoop }).click();
  await page.getByRole('dialog').getByRole('button', { name: pl.common.delete }).click();
  await expect(page.getByText(pl.home.empty)).toBeVisible();

  await page.goto('/settings');
  await page.getByTestId('backup-file').setInputFiles(path);
  await expect(page.getByText(/W pliku: WOOP-y 1, check-iny 1/u)).toBeVisible();
  await page.locator('label', { hasText: pl.backup.replace.label }).click();
  await page.getByRole('button', { name: pl.backup.apply, exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: pl.backup.replace.label }).click();
  await expect(page.getByText(pl.backup.done)).toBeVisible();
  await page.goto('/');
  await expect(card(page)).toBeVisible();
});

test('nieprawidłowy plik kopii pokazuje zrozumiały komunikat', async ({ page }) => {
  await page.goto('/settings');
  await page
    .getByTestId('backup-file')
    .setInputFiles({ name: 'zly.json', mimeType: 'application/json', buffer: Buffer.from('{nie json') });
  await expect(page.getByRole('alert')).toHaveText(pl.backup.errors.json);
});

test('więcej niż 3 aktywne WOOP-y: informacja, nie blokada', async ({ page }) => {
  await seed(page, { woops: [1, 2, 3, 4].map((n) => freshWoop({ id: `w${n}` })) });
  await page.goto('/');
  await expect(page.getByText(/Masz 4 aktywne WOOP-y/u)).toBeVisible();
  await page.getByRole('button', { name: pl.home.newWoop }).click();
  await expectStep(page, pl.steps['start-intro'].title);
});

test('przypomnienie o check-inie pojawia się w sekcji „Na dziś”', async ({ page }) => {
  const reminder: Reminder = {
    id: 'r1',
    woopId: ID,
    kind: 'checkin',
    time: '00:00',
    days: [1, 2, 3, 4, 5, 6, 7],
    enabled: true,
    lastNotified: null,
    createdAt: '',
    updatedAt: '',
  };
  await seed(page, { woops: [freshWoop({ id: ID })], reminders: [reminder] });
  await page.goto('/');
  const due = page.locator('[data-due="checkin"]');
  await expect(due).toContainText(pl.dashboard.due.checkin);
  await due.getByRole('link', { name: pl.dashboard.dueActions.checkin }).click();
  await expect(heading(page)).toHaveText(pl.checkin.title);
});

test('„Jak to działa” przypisuje metodę autorce i linkuje do woopmylife.org', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: pl.nav.mainNav }).getByRole('link', { name: pl.nav.about }).click();
  await expect(heading(page)).toHaveText(pl.about.title);
  await expect(page.getByText(/Gabriele Oettingen/u).first()).toBeVisible();
  await expect(page.getByRole('link', { name: pl.app.methodUrlLabel })).toHaveAttribute('href', pl.app.methodUrl);
});
