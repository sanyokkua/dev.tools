import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = '.tmp/verify-screens';
mkdirSync(OUT, { recursive: true });

const failures = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });

async function runSmoke(name, fn) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const consoleErrors = [];

    page.on('console', (m) => {
        if (m.type() === 'error') {
            const text = m.text();
            // Skip one known pre-existing duplicate-key warning in git-cheat-sheet (Copy-SSH-Public-Key slug)
            if (text.includes('same key') && text.includes('Copy-SSH-Public-Key')) return;
            consoleErrors.push(text);
        }
    });
    page.on('pageerror', (e) => consoleErrors.push(String(e)));

    process.stdout.write(`  smoke:${name} … `);
    try {
        await fn(page);
        if (consoleErrors.length) {
            process.stdout.write('CONSOLE ERRORS\n');
            failures.push(`CONSOLE    smoke:${name}: ${consoleErrors.slice(0, 3).join(' | ')}`);
        } else {
            process.stdout.write('ok\n');
        }
    } catch (err) {
        process.stdout.write('FAILED\n');
        failures.push(`FAILED     smoke:${name}: ${err.message.split('\n')[0]}`);
    } finally {
        await ctx.close();
    }
}

// ── 1. Software Installer ─────────────────────────────────────────────────────
await runSmoke('installer', async (page) => {
    await page.goto(BASE + '/software-installer', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/smoke__installer__before.png` });

    // Wait for app catalog to populate and click the first app checkbox
    await page.waitForSelector('[data-testid^="select-app-"]', { timeout: 5000 });
    await page.locator('[data-testid^="select-app-"]').first().click();

    // Selecting an app switches the output from empty-state to the code block
    await page.waitForSelector('[data-testid="output-code"]', { timeout: 5000 });

    const text = await page.locator('[data-testid="output-code"]').innerText();
    if (!text.trim()) throw new Error('[data-testid="output-code"] innerText is empty');

    await page.screenshot({ path: `${OUT}/smoke__installer__after.png` });
});

// ── 1b. Software Installer — multi-JDK (Corretto) ────────────────────────────
await runSmoke('installer-multi-jdk', async (page) => {
    await page.goto(BASE + '/software-installer', { waitUntil: 'networkidle' });

    // Select Homebrew manager
    await page.locator('.installer-chip-row button', { hasText: 'Homebrew' }).click();

    // Add Amazon Corretto
    await page.waitForSelector('[aria-label="Select Amazon Corretto"]', { timeout: 5000 });
    await page.locator('[aria-label="Select Amazon Corretto"]').click();

    // Wait for version chip group to appear
    await page.waitForSelector('[aria-label="Versions for Amazon Corretto"]', { timeout: 5000 });

    // Click an unselected version chip to select a second version
    const versionGroup = page.locator('[aria-label="Versions for Amazon Corretto"]');
    const unselected = versionGroup.locator('button[aria-pressed="false"]').first();
    await unselected.click();

    // Output panel should contain at least 2 corretto@ references
    await page.waitForSelector('[data-testid="output-code"]', { timeout: 5000 });
    const outputText = await page.locator('[data-testid="output-code"]').innerText();
    const matches = outputText.match(/corretto@\d+/g) ?? [];
    if (matches.length < 2) {
        throw new Error(
            `Expected ≥2 corretto@ commands in output, got: ${matches.length}\n${outputText.slice(0, 300)}`,
        );
    }

    await page.screenshot({ path: `${OUT}/smoke__installer_multi_jdk__after.png` });
});

// ── 2. Terminal Utils ─────────────────────────────────────────────────────────
await runSmoke('terminal', async (page) => {
    await page.goto(BASE + '/terminal-utils', { waitUntil: 'networkidle' });
    await page.waitForSelector('.monaco-editor', { timeout: 8000 });
    await page.screenshot({ path: `${OUT}/smoke__terminal__before.png` });

    // Focus the input pane editor and type commands (click .view-lines — .inputarea has z-index:-10)
    await page.locator('.terminal-utils .eb').first().locator('.monaco-editor .view-lines').click();
    await page.keyboard.type('echo hello\necho world');

    // Click the "Join with &&" button
    await page.locator('button', { hasText: 'Join with &&' }).click();
    await page.waitForTimeout(500);

    // Result editor must have content
    const resultText = await page.locator('.terminal-utils .eb').last().locator('.view-lines').textContent();
    if (!resultText?.trim()) throw new Error('Result editor is empty after Join with &&');

    await page.screenshot({ path: `${OUT}/smoke__terminal__after.png` });
});

// ── 3. Hashing Tools ─────────────────────────────────────────────────────────
await runSmoke('hashing', async (page) => {
    await page.goto(BASE + '/hashing-tools', { waitUntil: 'networkidle' });
    await page.waitForSelector('.monaco-editor', { timeout: 8000 });
    await page.screenshot({ path: `${OUT}/smoke__hashing__before.png` });

    // Type text into Monaco editor — hash computation debounces 300ms (.view-lines: .inputarea has z-index:-10)
    await page.locator('.editorpane .eb .monaco-editor .view-lines').first().click();
    await page.keyboard.type('hello world');

    // Wait until at least one digest cell has non-empty text and no spinner
    await page.waitForFunction(
        () =>
            Array.from(document.querySelectorAll('table.t td.mono')).some(
                (td) => td.textContent?.trim() && !td.querySelector('.spinner'),
            ),
        { timeout: 8000 },
    );

    await page.screenshot({ path: `${OUT}/smoke__hashing__after.png` });
});

// ── 4. Converting Tools ───────────────────────────────────────────────────────
await runSmoke('converting', async (page) => {
    await page.goto(BASE + '/converting-tools', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/smoke__converting__before.png` });

    // Default mode: number-base. Fill 127 and assert hex result shows '0x7F'
    await page.waitForSelector('.converting-results-table', { timeout: 3000 });
    await page.locator('.input-base').first().fill('127');

    // Wait for the hex result cell to update to 0x7F (127 decimal = 7F hex)
    await page.waitForFunction(
        () =>
            Array.from(document.querySelectorAll('.converting-value-mono')).some((el) =>
                /7[Ff]/.test(el.textContent?.trim() ?? ''),
            ),
        { timeout: 3000 },
    );

    await page.screenshot({ path: `${OUT}/smoke__converting__after.png` });
});

// ── 5. Git Cheat Sheet ────────────────────────────────────────────────────────
await runSmoke('git', async (page) => {
    await page.goto(BASE + '/git-cheat-sheet', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/smoke__git__before.png` });

    await page.fill('#git-name', 'Test User');
    await page.fill('#git-email', 'test@example.com');
    await page.locator('button[type="submit"]').click();

    // Output column must show at least one code block
    await page.waitForSelector('.git-cheat-sheet__output-col .code-block', { timeout: 3000 });

    // Empty-state hint must be gone
    const emptyHintVisible = await page
        .locator('.git-cheat-sheet__empty-hint')
        .isVisible()
        .catch(() => false);
    if (emptyHintVisible) throw new Error('.git-cheat-sheet__empty-hint still visible after Generate');

    await page.screenshot({ path: `${OUT}/smoke__git__after.png` });
});

// ── 6. Markdown Tools ─────────────────────────────────────────────────────────
await runSmoke('markdown', async (page) => {
    await page.goto(BASE + '/markdown-tools', { waitUntil: 'networkidle' });
    await page.waitForSelector('.monaco-editor', { timeout: 8000 });
    await page.screenshot({ path: `${OUT}/smoke__markdown__before.png` });

    // Type markdown into the editor pane (.view-lines: .inputarea has z-index:-10)
    await page.locator('.markdown-tools__pane.editorpane .monaco-editor .view-lines').click();
    await page.keyboard.type('# Hello\n\nWorld');

    // Wait for preview to reflect the typed content
    await page.waitForFunction(
        () => document.querySelector('.markdown-tools__preview')?.textContent?.includes('Hello'),
        { timeout: 5000 },
    );

    // Print button must be present
    const printVisible = await page
        .locator('button', { hasText: 'Print / Export PDF' })
        .isVisible()
        .catch(() => false);
    if (!printVisible) throw new Error('"Print / Export PDF" button not visible');

    await page.screenshot({ path: `${OUT}/smoke__markdown__after.png` });
});

// ── 7. Prompts Collection — AutoTextarea auto-grow ───────────────────────────
await runSmoke('prompts-autogrow', async (page) => {
    await page.goto(BASE + '/prompts-collection', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/smoke__prompts__before.png` });

    // Click the first prompt item that mentions params (parametrized prompts show "N params" hint)
    await page.waitForSelector('.prompt-list-item', { timeout: 5000 });
    const paramItem = page.locator('.prompt-list-item').filter({ hasText: /param/ }).first();
    await paramItem.click();

    // Wait for the detail panel with an AutoTextarea
    await page.waitForSelector('.textarea-auto', { timeout: 5000 });

    const textarea = page.locator('.field .textarea-auto').first();
    const initialHeight = await textarea.evaluate((el) => el.getBoundingClientRect().height);

    // Type a multi-line value to trigger JS auto-grow (scrollHeight > initialHeight)
    await textarea.click();
    await textarea.fill(
        'This is a sufficiently long value to trigger the AutoTextarea auto-grow behavior.\nLine two adds more content.\nLine three makes it taller.',
    );
    await page.waitForTimeout(200);

    const newHeight = await textarea.evaluate((el) => el.getBoundingClientRect().height);
    if (initialHeight > 0 && newHeight <= initialHeight) {
        throw new Error(`AutoTextarea did not grow: was ${initialHeight}px, now ${newHeight}px`);
    }

    await page.screenshot({ path: `${OUT}/smoke__prompts__after.png` });
});

await browser.close();

if (failures.length) {
    console.error('\nSMOKE FAILED — ' + failures.length + ' issue(s):\n');
    failures.forEach((f) => console.error('  ✗ ' + f));
    console.error('');
    process.exit(1);
}

console.log('\nSMOKE OK — all 8 interaction flows passed. Screenshots in ' + OUT);
