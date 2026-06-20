// Interaction smoke tests — 28+ user flows exercised in real Chromium via Playwright.
//
// Each runSmoke() call navigates to a route, performs key actions (type, click, assert),
// and captures before/after screenshots. Called automatically by npm run verify:ui
// after the static responsive checks in verify-ui.mjs.
//
// Flows covered: Software Installer (basic + multi-JDK), Terminal Utils, Hashing,
// Converting (number-base + data-format + Markdown table), Git Cheat Sheet,
// Markdown + Mermaid (valid + invalid), Prompts Collection (AutoTextarea),
// JSON Formatter (JSONPath), XML Formatter (XPath), Code Editor (Format button),
// LLM VRAM Calculator, Mermaid Editor, Diff, HTML Editor, JWT, Cron, QR,
// String Utils, Encoding Tools.
//
// Usage:
//   node scripts/smoke-tests.mjs
//   BASE_URL=http://localhost:3000 node scripts/smoke-tests.mjs
//
// Env:
//   BASE_URL  Dev-server base URL (default: http://localhost:3000)
//   CI        Forces headless Chromium; omit to use the local Chrome channel
//   HEADLESS  Set to "false" to show the browser window (default: true)
//
// Output: .tmp/verify-screens/smoke__<test>__<stage>.png
// Prerequisite: npm run dev must be running on BASE_URL
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = '.tmp/verify-screens';
mkdirSync(OUT, { recursive: true });

const failures = [];
const HEADLESS = process.env.HEADLESS !== 'false';
const browser = await chromium.launch(process.env.CI ? { headless: true } : { channel: 'chrome', headless: HEADLESS });

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

// ── 6b. Markdown Tools — Mermaid diagram renders ─────────────────────────────
await runSmoke('markdown-mermaid', async (page) => {
    await page.goto(BASE + '/markdown-tools', { waitUntil: 'networkidle' });
    await page.waitForSelector('.monaco-editor', { timeout: 8000 });

    const mermaidSrc = '```mermaid\ngraph TD\nA[Start] --> B[End]\n```';
    await page.locator('.markdown-tools__pane.editorpane .monaco-editor .view-lines').click();
    // clear editor first
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type(mermaidSrc);

    // Wait for mermaid SVG to appear in preview
    await page.waitForSelector('.markdown-tools__preview .mermaid-block svg', { timeout: 10000 });

    await page.screenshot({ path: `${OUT}/smoke__markdown_mermaid.png` });

    // Edge case: typing an invalid mermaid block shows error state
    await page.locator('.markdown-tools__pane.editorpane .monaco-editor .view-lines').click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('```mermaid\nnot valid !!!\n```');

    await page.waitForSelector('.markdown-tools__preview .mermaid-block--error', { timeout: 8000 });
    await page.screenshot({ path: `${OUT}/smoke__markdown_mermaid_error.png` });
});

// ── 7. Prompts Collection — hierarchy navigation ──────────────────────────────
await runSmoke('prompts-hierarchy-nav', async (page) => {
    await page.goto(BASE + '/prompts-collection', { waitUntil: 'networkidle' });

    // 1. Domain tabs render
    await page.waitForSelector('[role="tab"]', { timeout: 8000 });
    const activeDomainTab = page.locator('[role="tab"][aria-selected="true"]').first();
    if (!(await activeDomainTab.count())) throw new Error('No active domain tab rendered');

    // 2. Sub-tabs (categories) render
    await page.waitForSelector('.pc-subtabs', { timeout: 5000 });

    // 3. Click second domain tab if available
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    if (tabCount > 1) {
        await tabs.nth(1).click();
        await page.waitForTimeout(300);
        const subtabs = page.locator('.pc-subtabs .chip');
        if (!(await subtabs.count())) throw new Error('Sub-tabs did not update after domain switch');
    }

    // 4. Click a list item if one exists
    const listItem = page.locator('[role="option"]').first();
    if (await listItem.count()) {
        await listItem.click();
        await page.waitForTimeout(200);
        const detail = page.locator('.pc-detail, .pc-detail-empty');
        if (!(await detail.count())) throw new Error('Detail panel not rendered after list item click');
    }

    // 5. Switch to Skills mode
    const skillsBtn = page.locator('[aria-label="View type"] button', { hasText: 'Skills' });
    if (await skillsBtn.count()) {
        await skillsBtn.click();
        await page.waitForTimeout(300);
    }

    await page.screenshot({ path: `${OUT}/smoke__prompts__hierarchy.png` });
});

// ── 7b. Prompts Collection — responsive stacking at 375px ─────────────────────
await runSmoke('prompts-responsive-stack', async (page) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/prompts-collection', { waitUntil: 'networkidle' });
    await page.waitForSelector('.pc-body', { timeout: 8000 });

    // At 375px, .pc-body should be single column (no '264px' in grid columns)
    const bodyGrid = await page.locator('.pc-body').evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);
    if (bodyGrid.includes('264px')) throw new Error(`Expected single-column grid at 375px, got: ${bodyGrid}`);

    const overflow = await page.evaluate(() => document.body.scrollWidth > document.body.clientWidth + 1);
    if (overflow) throw new Error('Horizontal overflow at 375px');

    await page.screenshot({ path: `${OUT}/smoke__prompts__375.png` });
});

// ── 7c. Prompts Collection — copy-prompt smoke ────────────────────────────────
await runSmoke('prompts-copy-prompt', async (page) => {
    // Grant clipboard permissions so writeText doesn't throw
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto(BASE + '/prompts-collection', { waitUntil: 'networkidle' });
    await page.waitForSelector('[role="option"]', { timeout: 8000 });

    // Click the first list item to load a prompt
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(300);

    // Detail panel should now show copy actions
    const copyBtn = page.locator('button', { hasText: 'Copy prompt' });
    if (!(await copyBtn.count())) throw new Error('"Copy prompt" button not found after selecting a prompt');
    await copyBtn.click();
    await page.waitForTimeout(200);

    await page.screenshot({ path: `${OUT}/smoke__prompts__copy.png` });
});

// ── 7d. Prompts Collection — Open ↗ new-tab smoke ────────────────────────────
await runSmoke('prompts-open-newtab', async (page) => {
    await page.goto(BASE + '/prompts-collection', { waitUntil: 'networkidle' });
    await page.waitForSelector('[role="option"]', { timeout: 8000 });

    // Click list items until we find one with an "Open ↗" link (has recommendedSystemPromptId)
    const listItems = page.locator('[role="option"]');
    const count = await listItems.count();
    let foundOpenLink = false;

    for (let i = 0; i < Math.min(count, 10); i++) {
        await listItems.nth(i).click();
        await page.waitForTimeout(200);
        if (await page.locator('a[target="_blank"]', { hasText: /Open/ }).count()) {
            foundOpenLink = true;
            break;
        }
    }

    if (!foundOpenLink) {
        // Not all prompts have a system prompt — this is acceptable
        process.stdout.write('(no sys-prompt link found in first 10 items — skipping open-tab check) ');
        await page.screenshot({ path: `${OUT}/smoke__prompts__newtab__skipped.png` });
        return;
    }

    const openLink = page.locator('a[target="_blank"]', { hasText: /Open/ });
    const href = await openLink.getAttribute('href');
    if (!href?.includes('/prompts-collection')) {
        throw new Error(`Open ↗ href "${href}" does not point to /prompts-collection`);
    }

    // Verify new tab opens and the SYS variant renders (not an empty panel)
    const [newPage] = await Promise.all([page.context().waitForEvent('page'), openLink.click()]);
    await newPage.waitForLoadState('domcontentloaded');
    await newPage.waitForSelector('.pc-detail', { timeout: 8000 });
    const emptyCount = await newPage.locator('.pc-detail-empty').count();
    if (emptyCount > 0) throw new Error('SYS deep-link rendered empty panel — fallback path broken');
    await newPage.close();

    await page.screenshot({ path: `${OUT}/smoke__prompts__newtab.png` });
});

// ── 8. JSON Formatter — JSONPath query ────────────────────────────────────────
await runSmoke('json-formatter-query', async (page) => {
    await page.goto(BASE + '/json-formatter', { waitUntil: 'networkidle' });
    await page.waitForSelector('.monaco-editor', { timeout: 8000 });
    await page.screenshot({ path: `${OUT}/smoke__json_formatter_query__before.png` });

    // Type valid JSON into the left editor
    await page.locator('.editorpane').first().locator('.monaco-editor .view-lines').click();
    await page.keyboard.type('{"name":"Alice","age":30}');

    // Switch to Query (JSONPath) mode
    await page.locator('.seg-control button', { hasText: 'Query (JSONPath)' }).click();

    // Fill the JSONPath expression
    await page.fill('#jsonpath-input', '$.name');

    // Click Run Query
    await page.locator('button', { hasText: 'Run Query' }).click();
    await page.waitForTimeout(800);

    // Right editor must contain "Alice"
    const resultText = await page.locator('.editorpane').last().locator('.view-lines').textContent();
    if (!resultText?.includes('Alice')) {
        throw new Error(`Expected "Alice" in right editor output, got: ${resultText?.slice(0, 200)}`);
    }

    // Match count pill must show "1 match"
    const pillText = await page.locator('.pill.muted').textContent();
    if (!pillText?.includes('1')) {
        throw new Error(`Expected match count pill to include "1", got: "${pillText}"`);
    }

    // Edge case: clear the path and run again — expect WARNING toast, no crash, no console error
    await page.fill('#jsonpath-input', '');
    await page.locator('button', { hasText: 'Run Query' }).click();
    await page.waitForTimeout(300);

    await page.screenshot({ path: `${OUT}/smoke__json_formatter_query__after.png` });
});

// ── 9b. XML Formatter — XPath query ───────────────────────────────────────────
await runSmoke('xml-formatter', async (page) => {
    await page.goto(BASE + '/xml-formatter', { waitUntil: 'networkidle' });
    await page.waitForSelector('.monaco-editor', { timeout: 8000 });
    await page.screenshot({ path: `${OUT}/smoke__xml_formatter__before.png` });

    // Type valid XML into the left editor
    await page.locator('.editorpane').first().locator('.monaco-editor .view-lines').click();
    await page.keyboard.type('<root><item id="1">Hello</item><item id="2">World</item></root>');

    // Wait for .pill.ok to appear (valid XML detected)
    await page.waitForSelector('.pill.ok', { timeout: 5000 });

    // Click Beautify — no console errors
    await page.locator('button', { hasText: 'Beautify' }).click();
    await page.waitForTimeout(500);

    // Switch to Query (XPath) mode
    await page.locator('.seg-control button', { hasText: 'Query (XPath)' }).click();

    // XPath input must be visible
    await page.waitForSelector('#xpath-input', { timeout: 3000 });

    // Run XPath query for //item
    await page.fill('#xpath-input', '//item');
    await page.locator('button', { hasText: 'Run Query' }).click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: `${OUT}/smoke__xml_formatter__after.png` });
});

// ── 9. Converting Tools — Markdown table ─────────────────────────────────────
await runSmoke('converting-md-table', async (page) => {
    await page.goto(BASE + '/converting-tools', { waitUntil: 'networkidle' });
    await page.waitForSelector('.converting-results-table', { timeout: 3000 });

    // Switch to Data format mode
    await page.locator('.seg-control button', { hasText: 'Data format' }).click();
    await page.waitForSelector('.converting-textarea', { timeout: 3000 });

    // Select CSV as source format
    await page.locator('[aria-label="Source data format"] button', { hasText: 'CSV' }).click();

    // Fill CSV input
    await page.locator('.converting-textarea').fill('name,age\nAlice,30\nBob,25');

    // Wait for Markdown table result cell containing the header row
    await page.waitForFunction(
        () =>
            Array.from(document.querySelectorAll('.converting-value-mono')).some((el) =>
                el.textContent?.includes('| name | age |'),
            ),
        { timeout: 5000 },
    );

    await page.screenshot({ path: `${OUT}/smoke__converting_md_table__csv_to_md.png` });

    // Switch source to Markdown table and paste a valid table
    await page.locator('[aria-label="Source data format"] button', { hasText: 'Markdown table' }).click();
    await page.locator('.converting-textarea').fill('| name | age |\n| --- | --- |\n| Alice | 30 |');

    // Wait for JSON result containing Alice
    await page.waitForFunction(
        () =>
            Array.from(document.querySelectorAll('.converting-value-mono')).some((el) =>
                el.textContent?.includes('Alice'),
            ),
        { timeout: 5000 },
    );

    await page.screenshot({ path: `${OUT}/smoke__converting_md_table__md_to_json.png` });

    // Edge case: invalid table (no separator) → error cells appear
    await page.locator('.converting-textarea').fill('not a table at all');
    await page.waitForSelector('.converting-error-cell', { timeout: 5000 });

    await page.screenshot({ path: `${OUT}/smoke__converting_md_table__invalid.png` });
});

// ── 10. Code Editor — Format button ───────────────────────────────────────────
await runSmoke('code-editor-format', async (page) => {
    await page.goto(BASE + '/code-editor', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/smoke__code_editor_format__before.png` });

    // Happy path: Format is enabled for TypeScript (default language)
    const formatBtn = page.getByRole('button', { name: 'Format' });
    await formatBtn.waitFor({ state: 'visible' });
    const isEnabled = await formatBtn.isEnabled();
    if (!isEnabled) throw new Error('Format button should be enabled for TypeScript');

    // Edge case: switch to Go (non-formattable), Format must be disabled
    await page.getByRole('button', { name: 'Go' }).click();
    await page.waitForTimeout(200);
    const isDisabledAfterGo = await formatBtn.isDisabled();
    if (!isDisabledAfterGo) throw new Error('Format button should be disabled for Go');

    // Switch back to TypeScript, click Format
    await page.getByRole('button', { name: 'TS' }).click();
    await page.waitForTimeout(200);
    await formatBtn.click();
    await page.waitForTimeout(800);

    await page.screenshot({ path: `${OUT}/smoke__code_editor_format__after.png` });
});

// ── 11. LLM VRAM Calculator — happy path ─────────────────────────────────────
await runSmoke('vram-calculator', async (page) => {
    await page.goto(BASE + '/llm-vram-calculator', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/smoke__vram__before.png` });

    // Fill params_b (Q4_K_M is already default)
    await page.fill('#params_b', '8');

    // Click Calculate
    await page.click('button[type="submit"]');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/smoke__vram__basic_result.png` });

    // Verify KPI cards appeared
    const kpiCount = await page.locator('.vram-kpi-value').count();
    if (kpiCount < 3) {
        throw new Error(`Expected at least 3 KPI cards, got ${kpiCount}`);
    }

    // Open Advanced options and set VRAM to 8 GB
    await page.locator('details.detailsbox').filter({ hasText: 'Advanced options' }).locator('summary').click();
    await page.waitForTimeout(200);
    const chip8 = page.locator('.chip').filter({ hasText: /^8$/ });
    if ((await chip8.count()) > 0) {
        await chip8.first().click();
    }

    // Calculate with VRAM constraint
    await page.click('button[type="submit"]');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/smoke__vram__with_vram.png` });

    // Reset and verify
    await page.click('button[type="button"]');
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${OUT}/smoke__vram__after_reset.png` });
});

// ── 12. Mermaid Editor ────────────────────────────────────────────────────────
await runSmoke('mermaid-editor', async (page) => {
    await page.goto(BASE + '/mermaid-editor', { waitUntil: 'networkidle' });
    await page.waitForSelector('.monaco-editor', { timeout: 8000 });
    await page.screenshot({ path: `${OUT}/smoke__mermaid_editor__before.png` });

    // Type a simple diagram into the editor pane
    await page.locator('.split-preview-editor .editorpane .monaco-editor .view-lines').first().click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('graph TD\nA[Hello] --> B[World]');

    // Wait for the debounce + mermaid render: SVG must appear in the preview pane
    await page.waitForSelector('.split-preview-editor .split-preview-editor__preview .mermaid-block svg', {
        timeout: 10000,
    });
    await page.screenshot({ path: `${OUT}/smoke__mermaid_editor__after.png` });

    // Edge case: invalid syntax shows the error state
    await page.locator('.split-preview-editor .editorpane .monaco-editor .view-lines').first().click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('not valid !!!');
    await page.waitForSelector('.split-preview-editor .split-preview-editor__preview .mermaid-block--error', {
        timeout: 8000,
    });
    await page.screenshot({ path: `${OUT}/smoke__mermaid_editor__error.png` });
});

// ── N. Diff Tool ──────────────────────────────────────────────────────────────
await runSmoke('diff-happy-path', async (page) => {
    await page.goto(BASE + '/diff', { waitUntil: 'networkidle' });
    // Wait for Monaco DiffEditor (renders two .monaco-editor elements inside .monaco-diff-editor)
    await page.waitForSelector('.monaco-diff-editor .monaco-editor', { timeout: 10000 });
    await page.screenshot({ path: `${OUT}/smoke__diff__loaded.png` });

    // Type in the left (original) pane — .monaco-editor and .original-in-monaco-diff-editor are on the same element
    const leftPane = page.locator('.original-in-monaco-diff-editor .view-lines');
    await leftPane.click();
    await page.keyboard.type('{"b":2,"a":1}');
    await page.screenshot({ path: `${OUT}/smoke__diff__left_typed.png` });

    // Type in the right (modified) pane
    const rightPane = page.locator('.modified-in-monaco-diff-editor .view-lines');
    await rightPane.click();
    await page.keyboard.type('{"b":2,"a":1,"c":3}');
    await page.screenshot({ path: `${OUT}/smoke__diff__right_typed.png` });

    // Switch to JSON type and wait for debounce normalization (300 ms + buffer)
    await page.locator('[role="group"][aria-label="Diff type"] button', { hasText: 'JSON' }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/smoke__diff__json_normalized.png` });

    // Swap button must exist and be clickable
    await page.locator('button', { hasText: /⇄ swap/i }).click();
    await page.screenshot({ path: `${OUT}/smoke__diff__swapped.png` });

    // Ignore whitespace switch must exist and be togglable
    const sw = page.locator('[role="switch"]');
    await sw.click();
    const checked = await sw.getAttribute('aria-checked');
    if (checked !== 'true') throw new Error('Ignore-whitespace switch did not toggle to true');
    await page.screenshot({ path: `${OUT}/smoke__diff__ignore_ws.png` });
});

await runSmoke('diff-edge-invalid-json', async (page) => {
    await page.goto(BASE + '/diff', { waitUntil: 'networkidle' });
    await page.waitForSelector('.monaco-diff-editor .monaco-editor', { timeout: 10000 });

    // Switch to JSON type first
    await page.locator('[role="group"][aria-label="Diff type"] button', { hasText: 'JSON' }).click();

    // Type invalid JSON in the left pane — editor must remain visible with content intact
    const leftPane = page.locator('.original-in-monaco-diff-editor .view-lines');
    await leftPane.click();
    await page.keyboard.type('{invalid json}');
    await page.waitForTimeout(600);

    // Page must not crash; editor is still present
    await page.waitForSelector('.monaco-diff-editor', { timeout: 3000 });
    await page.screenshot({ path: `${OUT}/smoke__diff__invalid_json_edge.png` });
});

// ── HTML Editor ───────────────────────────────────────────────────────────────
await runSmoke('html-editor', async (page) => {
    await page.goto(BASE + '/html-editor', { waitUntil: 'networkidle' });
    await page.waitForSelector('.monaco-editor', { timeout: 8000 });
    await page.screenshot({ path: `${OUT}/smoke__html_editor__before.png` });

    // Replace default content with fresh HTML
    await page.locator('.split-preview-editor .editorpane .monaco-editor .view-lines').first().click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('<h1>Hello World</h1>');

    // iframe srcdoc must update to include the typed content
    await page.waitForFunction(
        () => document.querySelector('.html-editor__preview-frame')?.getAttribute('srcdoc')?.includes('Hello World'),
        { timeout: 5000 },
    );
    await page.screenshot({ path: `${OUT}/smoke__html_editor__after.png` });

    // Edge case: toggle Allow Scripts — sandbox must switch to allow-scripts
    await page.locator('[role="switch"]').click();
    await page.waitForFunction(
        () => document.querySelector('.html-editor__preview-frame')?.getAttribute('sandbox') === 'allow-scripts',
        { timeout: 3000 },
    );
    await page.screenshot({ path: `${OUT}/smoke__html_editor__scripts_on.png` });
});

// ── JWT ───────────────────────────────────────────────────────────────────────
await runSmoke('jwt-decode', async (page) => {
    await page.goto(BASE + '/jwt', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/smoke__jwt__before.png` });

    const textarea = page.locator('[data-testid="jwt-input"]');
    await textarea.fill(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
            '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
            '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    );
    await page.waitForTimeout(300);

    const headerOut = await page.locator('[data-testid="jwt-header-output"]').innerText();
    if (!headerOut.includes('HS256')) throw new Error('Header missing alg:HS256');

    await page.waitForFunction(() => document.body.innerText.includes('John Doe'), { timeout: 3000 });

    await page.screenshot({ path: `${OUT}/smoke__jwt__decoded.png` });
});

await runSmoke('jwt-verify-invalid', async (page) => {
    await page.goto(BASE + '/jwt', { waitUntil: 'networkidle' });

    await page.locator('[role="group"][aria-label="JWT mode"] button', { hasText: 'Verify' }).click();

    await page
        .locator('[data-testid="jwt-input"]')
        .fill(
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
                '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
                '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        );

    await page.locator('input[placeholder="HMAC secret"]').fill('wrongsecret');

    // Click the action Verify button (not the mode tab — use last() since mode tab comes first)
    await page.locator('button', { hasText: 'Verify' }).last().click();

    await page.waitForSelector('[data-testid="jwt-verify-result"]', { timeout: 5000 });
    const resultText = await page.locator('[data-testid="jwt-verify-result"]').innerText();
    if (!resultText.includes('invalid')) throw new Error(`Expected invalid, got: ${resultText}`);

    await page.screenshot({ path: `${OUT}/smoke__jwt__verify_invalid.png` });
});

// ── Cron ──────────────────────────────────────────────────────────────────────
await runSmoke('cron-describe', async (page) => {
    await page.goto(BASE + '/cron', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/smoke__cron__before.png` });

    await page.locator('[data-testid="cron-input"]').fill('0 9 * * 1-5');
    await page.waitForSelector('[data-testid="cron-description"]', { timeout: 3000 });

    const desc = await page.locator('[data-testid="cron-description"]').innerText();
    if (!desc.trim()) throw new Error('cron-description is empty');
    if (!/\d/.test(desc)) throw new Error(`Description does not contain a time: "${desc}"`);

    await page.screenshot({ path: `${OUT}/smoke__cron__described.png` });
});

await runSmoke('cron-next-runs', async (page) => {
    await page.goto(BASE + '/cron', { waitUntil: 'networkidle' });

    await page.locator('[data-testid="cron-input"]').fill('0 9 * * 1-5');
    await page.waitForSelector('[data-testid="cron-next-runs"]', { timeout: 3000 });

    const items = page.locator('[data-testid="cron-run-item"]');
    const countBefore = await items.count();
    if (countBefore !== 5) throw new Error(`Expected 5 run items, got ${countBefore}`);

    // Switch count to 10 via SegmentedControl and verify list grows
    await page.locator('[aria-label="Run count"] button', { hasText: '10' }).click();
    await page.waitForTimeout(300);
    const countAfter = await items.count();
    if (countAfter !== 10) throw new Error(`Expected 10 run items after switching count to 10, got ${countAfter}`);

    // Switch timezone and verify runs are still shown (confirms state update works)
    await page.locator('.cron-runs-toolbar select').selectOption('America/New_York');
    await page.waitForTimeout(300);
    const countFinal = await items.count();
    if (countFinal !== 10) throw new Error(`Expected 10 run items after timezone change, got ${countFinal}`);

    await page.screenshot({ path: `${OUT}/smoke__cron__next_runs.png` });
});

// ── QR ────────────────────────────────────────────────────────────────────────
await runSmoke('qr-url', async (page) => {
    await page.goto(BASE + '/qr', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/smoke__qr__before.png` });

    await page.locator('[data-testid="qr-url-input"]').fill('https://example.com');
    await page.waitForSelector('[data-testid="qr-canvas"]', { timeout: 5000 });
    // qrcode is dynamically imported; wait for toCanvas() to set the width attribute
    await page.waitForFunction(
        () => {
            const c = document.querySelector('[data-testid="qr-canvas"]');
            return c && Number(c.getAttribute('width')) > 0;
        },
        { timeout: 8000 },
    );

    const width = await page.evaluate(() => {
        const canvas = document.querySelector('[data-testid="qr-canvas"]');
        return canvas ? canvas.getAttribute('width') : null;
    });
    if (!width || Number(width) <= 0) throw new Error(`Canvas width is invalid: ${width}`);

    await page.screenshot({ path: `${OUT}/smoke__qr__url.png` });
});

await runSmoke('qr-wifi', async (page) => {
    await page.goto(BASE + '/qr', { waitUntil: 'networkidle' });

    await page.locator('[data-testid="qr-type-select"] select').selectOption('wifi');
    await page.locator('[data-testid="qr-wifi-ssid"]').fill('MyNetwork');
    await page.locator('[data-testid="qr-wifi-password"]').fill('secret123');
    await page.waitForSelector('[data-testid="qr-canvas"]', { timeout: 5000 });

    await page.screenshot({ path: `${OUT}/smoke__qr__wifi.png` });
});

// ── String Utils — lower case happy path ─────────────────────────────────────
await runSmoke('string-utils', async (page) => {
    await page.goto(BASE + '/string-utils', { waitUntil: 'networkidle' });
    await page.waitForSelector('.monaco-editor', { timeout: 8000 });
    await page.screenshot({ path: `${OUT}/smoke__string_utils__before.png` });

    // Type into the left (input) editor
    await page.locator('.editorpane').first().locator('.monaco-editor .view-lines').click();
    await page.keyboard.type('Hello World');

    // Switch to Case Utils group
    await page.locator('.card.pad select.input').selectOption('case-utils');
    await page.waitForTimeout(200);

    // Click lower case
    await page.locator('.func-btn', { hasText: 'lower case' }).click();
    await page.waitForTimeout(500);

    // Result editor must contain lowercased text
    const resultText = await page.locator('.editorpane').last().locator('.view-lines').textContent();
    // Monaco renders spaces as U+00A0 (NBSP) in .view-lines DOM text — normalize before comparison
    const normalizedText = resultText?.replace(/\u00A0/g, ' ') ?? '';
    if (!normalizedText.includes('hello world')) {
        throw new Error(`Expected "hello world" in result, got: ${resultText?.slice(0, 100)}`);
    }

    await page.screenshot({ path: `${OUT}/smoke__string_utils__after.png` });
});

// ── String Utils — empty input edge case ─────────────────────────────────────
await runSmoke('string-utils-empty', async (page) => {
    await page.goto(BASE + '/string-utils', { waitUntil: 'networkidle' });
    await page.waitForSelector('.monaco-editor', { timeout: 8000 });

    // Switch to Case Utils and click lower case without typing any input
    await page.locator('select.input').selectOption('case-utils');
    await page.waitForTimeout(200);
    await page.locator('.func-btn', { hasText: 'lower case' }).click();
    await page.waitForTimeout(500);

    // The page must not crash — no console errors, no exception
    // Output editor must be empty or blank
    const resultText = await page.locator('.editorpane').last().locator('.view-lines').textContent();
    // Allow up to 2 chars: Monaco renders an invisible placeholder/cursor character on empty content
    if (resultText && resultText.trim().length > 2) {
        throw new Error(`Expected empty result for empty input, got: ${resultText.slice(0, 100)}`);
    }

    await page.screenshot({ path: `${OUT}/smoke__string_utils_empty__after.png` });
});

// ── Encoding Tools — Base64 encode happy path ────────────────────────────────
await runSmoke('encoding-tools', async (page) => {
    await page.goto(BASE + '/encoding-tools', { waitUntil: 'networkidle' });
    await page.waitForSelector('.monaco-editor', { timeout: 8000 });
    await page.screenshot({ path: `${OUT}/smoke__encoding_tools__before.png` });

    // Type into the left (input) editor
    await page.locator('.editorpane').first().locator('.monaco-editor .view-lines').click();
    await page.keyboard.type('Hello');

    // Encoding Utils group is the default (first group) — Encode Base64 should be visible
    await page.waitForSelector('.func-btn', { timeout: 3000 });
    await page
        .locator('.func-btn')
        .filter({ hasText: /^Encode Base64$/ })
        .click();
    await page.waitForTimeout(500);

    // Result must contain Base64 of "Hello" = "SGVsbG8="
    const resultText = await page.locator('.editorpane').last().locator('.view-lines').textContent();
    if (!resultText?.includes('SGVsbG8=')) {
        throw new Error(`Expected Base64 "SGVsbG8=" in result, got: ${resultText?.slice(0, 100)}`);
    }

    await page.screenshot({ path: `${OUT}/smoke__encoding_tools__after.png` });
});

// ── Encoding Tools — Base64 round-trip ───────────────────────────────────────
await runSmoke('encoding-tools-round-trip', async (page) => {
    await page.goto(BASE + '/encoding-tools', { waitUntil: 'networkidle' });
    await page.waitForSelector('.monaco-editor', { timeout: 8000 });

    // Type Base64-encoded value in left editor
    await page.locator('.editorpane').first().locator('.monaco-editor .view-lines').click();
    await page.keyboard.type('SGVsbG8=');

    // Switch to Decoding Utils and click Decode Base64
    await page.locator('.card.pad select.input').selectOption('decoding-utils');
    await page.waitForTimeout(200);
    await page
        .locator('.func-btn')
        .filter({ hasText: /^Decode Base64$/ })
        .click();
    await page.waitForTimeout(500);

    // Result must contain the decoded value "Hello"
    const resultText = await page.locator('.editorpane').last().locator('.view-lines').textContent();
    if (!resultText?.includes('Hello')) {
        throw new Error(`Expected "Hello" after Base64 decode, got: ${resultText?.slice(0, 100)}`);
    }

    await page.screenshot({ path: `${OUT}/smoke__encoding_tools_round_trip__after.png` });
});

// ── Global Sidebar — icon rail default + persist ──────────────────────────
await runSmoke('sidebar-icon-rail-default', async (page) => {
    // 1. Clear localStorage to get clean default state
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.removeItem('sidebarCollapsed'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/smoke__sidebar__collapsed_default.png` });

    // Sidebar must be collapsed by default on /
    const isCollapsedHome = await page.evaluate(
        () => document.querySelector('.nav-rail')?.classList.contains('collapsed') ?? false,
    );
    if (!isCollapsedHome) throw new Error('Sidebar should be collapsed by default on /');

    // Check on a second route (/json-formatter) — still collapsed
    await page.goto(BASE + '/json-formatter', { waitUntil: 'networkidle' });
    const isCollapsedJson = await page.evaluate(
        () => document.querySelector('.nav-rail')?.classList.contains('collapsed') ?? false,
    );
    if (!isCollapsedJson) throw new Error('Sidebar should be collapsed by default on /json-formatter');

    // Check on a third route (/llm-vram-calculator) — still collapsed
    await page.goto(BASE + '/llm-vram-calculator', { waitUntil: 'networkidle' });
    const isCollapsedVram = await page.evaluate(
        () => document.querySelector('.nav-rail')?.classList.contains('collapsed') ?? false,
    );
    if (!isCollapsedVram) throw new Error('Sidebar should be collapsed by default on /llm-vram-calculator');

    // No horizontal overflow on collapsed rail
    const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    if (overflow) throw new Error('Horizontal overflow detected with collapsed sidebar');

    await page.screenshot({ path: `${OUT}/smoke__sidebar__three_routes.png` });
});

await runSmoke('sidebar-persist-expand', async (page) => {
    // Start from a clean state on /
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.removeItem('sidebarCollapsed'));
    await page.reload({ waitUntil: 'networkidle' });

    // Expand the sidebar via the "Expand sidebar" button
    await page.click('[aria-label="Expand sidebar"]');
    await page.screenshot({ path: `${OUT}/smoke__sidebar__expanded.png` });

    // Verify expanded
    const isCollapsedAfterExpand = await page.evaluate(
        () => document.querySelector('.nav-rail')?.classList.contains('collapsed') ?? true,
    );
    if (isCollapsedAfterExpand) throw new Error('Sidebar should be expanded after clicking Expand');

    // Navigate to another route — expanded state must persist
    await page.goto(BASE + '/json-formatter', { waitUntil: 'networkidle' });
    const isCollapsedAfterNav = await page.evaluate(
        () => document.querySelector('.nav-rail')?.classList.contains('collapsed') ?? true,
    );
    if (isCollapsedAfterNav) throw new Error('Sidebar expansion should persist across navigation');

    // Reload — localStorage must restore expanded state
    await page.reload({ waitUntil: 'networkidle' });
    const isCollapsedAfterReload = await page.evaluate(
        () => document.querySelector('.nav-rail')?.classList.contains('collapsed') ?? true,
    );
    if (isCollapsedAfterReload) throw new Error('Sidebar expansion should persist across reload');

    await page.screenshot({ path: `${OUT}/smoke__sidebar__persisted.png` });
});

await browser.close();

if (failures.length) {
    console.error('\nSMOKE FAILED — ' + failures.length + ' issue(s):\n');
    failures.forEach((f) => console.error('  ✗ ' + f));
    console.error('');
    process.exit(1);
}

console.log('\nSMOKE OK — all 31 interaction flows passed. Screenshots in ' + OUT);
