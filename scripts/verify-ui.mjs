// Responsive UI verification — all routes × 3 viewport widths × 2 themes.
//
// Checks 4 gates on every page × combination:
//   1. No horizontal overflow (scrollWidth > clientWidth + 1 px)
//   2. Body font must be sans-serif (not serif / Times)
//   3. Monaco editor height > 200 px on editor pages
//   4. No browser console errors or page errors
//
// Usage:
//   node scripts/verify-ui.mjs
//   BASE_URL=http://localhost:3000 node scripts/verify-ui.mjs
//
// Env:
//   BASE_URL  Dev-server base URL (default: http://localhost:3000)
//   CI        Forces headless Chromium; omit to use the local Chrome channel
//   HEADLESS  Set to "false" to show the browser window (default: true)
//
// Output: .tmp/verify-screens/<slug>__<theme>__<width>.png
// Prerequisite: npm run dev must be running on BASE_URL
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

const ROUTES = [
    '/',
    '/string-utils',
    '/json-formatter',
    '/xml-formatter',
    '/hashing-tools',
    '/encoding-tools',
    '/terminal-utils',
    '/code-editor',
    '/markdown-tools',
    '/converting-tools',
    '/date-tools',
    '/software-installer',
    '/mac-os-setup',
    '/windows-setup',
    '/linux-setup',
    '/git-cheat-sheet',
    '/llm-vram-calculator',
    '/prompts-collection',
    '/prompts-collection?view=catalog',
    '/mermaid-editor',
    '/diff',
    '/html-editor',
    '/jwt',
    '/cron',
    '/qr',
];

// Routes that must have a Monaco editor with height > 200px
const MONACO_ROUTES = new Set([
    '/string-utils',
    '/json-formatter',
    '/xml-formatter',
    '/encoding-tools',
    '/terminal-utils',
    '/code-editor',
    '/markdown-tools',
    '/mermaid-editor',
    '/diff',
    '/html-editor',
]);

const WIDTHS = [375, 768, 1280];
const THEMES = ['light', 'dark'];
const OUT = '.tmp/verify-screens';
mkdirSync(OUT, { recursive: true });

const failures = [];
const HEADLESS = process.env.HEADLESS !== 'false';
const browser = await chromium.launch(process.env.CI ? { headless: true } : { channel: 'chrome', headless: HEADLESS });

for (const theme of THEMES) {
    for (const width of WIDTHS) {
        process.stdout.write(`\n── ${theme} ${width}px ──\n`);
        const ctx = await browser.newContext({ viewport: { width, height: 900 } });
        const page = await ctx.newPage();

        for (const route of ROUTES) {
            const errors = [];
            page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
            page.on('pageerror', (e) => errors.push(String(e)));

            process.stdout.write(`  ${route} … `);
            await page.goto(BASE + route, { waitUntil: 'networkidle' });

            // Apply theme via data-theme attribute
            await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
            await page.waitForTimeout(300);

            // Gate 1: No horizontal overflow (allow ±1px rounding)
            const overflow = await page.evaluate(() => {
                const d = document.documentElement;
                return d.scrollWidth - d.clientWidth > 1;
            });

            // Gate 2: Base font must be sans (not serif/Times)
            const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);

            // Gate 3: Monaco height > 200px on editor pages
            let monacoCollapsed = false;
            if (MONACO_ROUTES.has(route)) {
                const monacoHeight = await page.evaluate(() => {
                    const el = document.querySelector('.monaco-editor');
                    return el ? el.getBoundingClientRect().height : -1;
                });
                if (monacoHeight >= 0 && monacoHeight <= 200) {
                    monacoCollapsed = true;
                }
            }

            const slug = route.replace(/\W+/g, '_') || 'home';
            const screenshotPath = `${OUT}/${slug}__${theme}__${width}.png`;

            if (overflow) failures.push(`OVERFLOW   ${theme} ${width}px ${route}`);
            const sansStripped = bodyFont.replace(/sans-serif/gi, '');
            if (/serif|times/i.test(sansStripped))
                failures.push(`SERIF-FONT ${theme} ${width}px ${route} -> ${bodyFont}`);
            if (errors.length)
                failures.push(`CONSOLE    ${theme} ${width}px ${route}: ${errors.slice(0, 3).join(' | ')}`);
            if (monacoCollapsed) failures.push(`MONACO-HT  ${theme} ${width}px ${route} (height ≤ 200px)`);

            const routeFailed =
                overflow ||
                /serif|times/i.test(bodyFont.replace(/sans-serif/gi, '')) ||
                errors.length > 0 ||
                monacoCollapsed;
            process.stdout.write(routeFailed ? 'FAILED\n' : 'ok\n');

            await page.screenshot({ path: screenshotPath, fullPage: true });
        }

        await ctx.close();
    }
}

await browser.close();

if (failures.length) {
    console.error('\nVERIFY FAILED — ' + failures.length + ' issue(s):\n');
    failures.forEach((f) => console.error('  ✗ ' + f));
    console.error('');
    process.exit(1);
}

console.log('VERIFY OK — all routes, widths, themes clean. Screenshots in ' + OUT);
