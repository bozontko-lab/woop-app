// Renders the app icons (SVG → PNG) with the Chromium that ships with Playwright.
// Usage: npm run icons
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const dots = (scale, offset) =>
  [
    ['#fcd34d', 14, 46],
    ['#5eead4', 26, 38],
    ['#fda4af', 38, 30],
    ['#a5b4fc', 50, 20],
  ]
    .map(
      ([color, x, y]) =>
        `<circle cx="${offset + x * scale}" cy="${offset + y * scale}" r="${6 * scale}" fill="${color}"/>`,
    )
    .join('');

const line = (scale, offset) =>
  `<path d="M${offset + 14 * scale} ${offset + 46 * scale} L${offset + 26 * scale} ${offset + 38 * scale} L${offset + 38 * scale} ${offset + 30 * scale} L${offset + 50 * scale} ${offset + 20 * scale}" stroke="#f8fafc" stroke-opacity="0.35" stroke-width="${3 * scale}" fill="none" stroke-linecap="round"/>`;

const gradient = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f766e"/><stop offset="1" stop-color="#312e81"/></linearGradient></defs>`;

/** Rounded icon (favicon, "any" purpose). */
const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${gradient}<rect width="64" height="64" rx="16" fill="url(#g)"/>${line(1, 0)}${dots(1, 0)}</svg>`;

/** Full-bleed square; the mark is shrunk into the safe zone for maskable / Apple icons. */
const fullBleed = (scale) => {
  const offset = (64 - 64 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${gradient}<rect width="64" height="64" fill="url(#g)"/>${line(scale, offset)}${dots(scale, offset)}</svg>`;
};

const targets = [
  { file: 'public/icons/icon-192.png', svg: rounded, size: 192 },
  { file: 'public/icons/icon-512.png', svg: rounded, size: 512 },
  { file: 'public/icons/icon-maskable-512.png', svg: fullBleed(0.7), size: 512 },
  { file: 'public/icons/apple-touch-icon.png', svg: fullBleed(0.85), size: 180 },
];

await mkdir('public/icons', { recursive: true });
await writeFile('public/favicon.svg', rounded);

const browser = await chromium.launch();
const page = await browser.newPage();
for (const { file, svg, size } of targets) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`,
  );
  await page.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  console.log('✓', file);
}
await browser.close();
