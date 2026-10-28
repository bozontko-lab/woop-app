import { expect, test, type Download } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { exportFileName } from '../src/domain/summary/format';
import { freshWoop, pl, REFERENCE, seedWoop } from './helpers';

const ID = 'e2e-reference';

async function read(download: Download): Promise<Buffer> {
  return readFile((await download.path())!);
}

function pngSize(buffer: Buffer) {
  expect(buffer.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const woop = freshWoop({ id: ID });
const until = woop.timeframe!.endDate.replace(/-/gu, '');

test.beforeEach(async ({ page }) => {
  await seedWoop(page, woop);
  await page.goto(`/woop/${ID}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(pl.summary.title);
});

test('kopiuje kartę jako tekst', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: pl.summary.copyText }).click();
  await expect(page.getByText(pl.summary.copied)).toBeVisible();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain('Życzenie: 3 treningi w tygodniu');
  expect(text).toContain(`Plan: ${REFERENCE.planSentence}`);
});

test('pobiera PNG 9:16 i kwadrat', async ({ page }) => {
  for (const [label, size, suffix] of [
    [pl.summary.pngStory, { width: 1080, height: 1920 }, '9x16'],
    [pl.summary.pngSquare, { width: 1080, height: 1080 }, '1x1'],
  ] as const) {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: label }).click(),
    ]);
    expect(download.suggestedFilename()).toBe(exportFileName(woop, 'png', suffix));
    expect(pngSize(await read(download))).toEqual(size);
  }
});

test('pobiera .md i .json', async ({ page }) => {
  const [md] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: pl.summary.markdown }).click(),
  ]);
  expect(md.suggestedFilename()).toMatch(/\.md$/u);
  expect((await read(md)).toString('utf-8')).toContain(`- **Plan:** ${REFERENCE.planSentence}`);

  const [json] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: pl.summary.json }).click(),
  ]);
  const data = JSON.parse((await read(json)).toString('utf-8'));
  expect(data).toMatchObject({ app: pl.app.name, kind: 'woop', schemaVersion: 1, woop: { id: ID, status: 'active' } });
});

test('drukuje tylko kartę A6', async ({ page }) => {
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByTestId('print-card')).toBeVisible();
  await expect(page.getByTestId('print-card')).toContainText('Zmęczenie i „zrobię to jutro”');
  await expect(page.locator('#root')).toBeHidden();
  const pdf = await page.pdf({ format: 'A6' });
  expect(pdf.length).toBeGreaterThan(1000);
});

test('„Popraw” z checklisty prowadzi do właściwego kroku i z powrotem', async ({ page }) => {
  const broken = freshWoop({ id: 'e2e-fix' });
  await seedWoop(page, { ...broken, obstacle: { ...broken.obstacle, text: 'Brak czasu' } });
  await page.goto('/woop/e2e-fix');
  await expect(page.locator('[data-check="obstacleInternal"]')).toHaveAttribute('data-ok', 'false');
  await page
    .getByRole('link', { name: `${pl.summary.checklist.fix}: ${pl.summary.checklist.items.obstacleInternal.label}` })
    .click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(pl.steps['obstacle-text'].title);
  await expect(page.getByText(pl.edit.editing)).toBeVisible();
  await page.locator('main textarea').first().fill(REFERENCE.obstacle);
  await page.getByRole('button', { name: pl.edit.returnToSummary }).click();

  await expect(page).toHaveURL(/\/woop\/e2e-fix$/u);
  await expect(page.locator('[data-check][data-ok="false"]')).toHaveCount(0);
});

test('„Co dalej”: przypomnienia i plik kalendarza na porę przeszkody', async ({ page }) => {
  await page.getByRole('link', { name: pl.summary.nextSteps }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(pl.nextSteps.title);
  const obstacle = page.locator('[data-reminder="obstacle"]');
  await expect(obstacle.getByLabel(`${pl.reminders.time}: ${pl.reminders.kinds.obstacle.label}`)).toHaveValue('18:00');
  // Weekdays only for the check-in.
  const checkin = page.locator('[data-reminder="checkin"]');
  await checkin.getByRole('button', { name: /^Sb/u }).click();
  await checkin.getByRole('button', { name: /^Nd/u }).click();
  await expect(checkin.getByRole('button', { name: /^Sb/u })).toHaveAttribute('aria-pressed', 'false');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: pl.reminders.ics }).click(),
  ]);
  const ics = (await read(download)).toString('utf-8');
  expect(ics).toContain('BEGIN:VCALENDAR');
  expect(ics).toMatch(/DTSTART:\d{8}T180000/u);
  expect(ics).toContain(`RRULE:FREQ=DAILY;UNTIL=${until}T235959`);
  expect(ics).toContain(`RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=${until}T235959`);
  expect(ics).toContain('BEGIN:VALARM');
  expect(ics).toContain('SUMMARY:Przegląd WOOP: 3 treningi w tygodniu');

  // Saved with the export: the reminders are there after a reload.
  await page.reload();
  await expect(page.locator('[data-reminder="checkin"]').getByRole('button', { name: /^Nd/u })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});
