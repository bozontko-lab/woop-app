import { expect, test } from '@playwright/test';
import { heading, pl } from './helpers';

test('manifest pozwala zainstalować aplikację', async ({ request }) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest).toMatchObject({ name: pl.app.name, lang: 'pl', display: 'standalone', start_url: '/' });
  const sizes = manifest.icons.map(
    (icon: { sizes: string; purpose?: string }) => `${icon.sizes}:${icon.purpose ?? 'any'}`,
  );
  expect(sizes).toEqual(expect.arrayContaining(['192x192:any', '512x512:any', '512x512:maskable']));
});

test('działa offline po pierwszej wizycie', async ({ page, context }) => {
  await page.goto('/');
  await expect(heading(page)).toHaveText(pl.home.title);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(heading(page)).toHaveText(pl.home.title);
  await page.goto('/settings');
  await expect(heading(page)).toHaveText(pl.settings.title);

  await page.goto('/');
  await page.getByRole('button', { name: pl.home.newWoop }).click();
  await expect(heading(page)).toHaveText(pl.steps['start-intro'].title);
});
