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

// ── 7. Prompts Collection — AutoTextarea auto-grow ───────────────────────────
await runSmoke('prompts-autogrow', async (page) => {
    await page.goto(BASE + '/prompts-collection', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/smoke__prompts__before.png` });

    // Click the first prompt item whose hint shows "N params" (parametrized prompts only)
    await page.waitForSelector('.prompt-list-item', { timeout: 5000 });
    const paramItem = page
        .locator('.prompt-list-item')
        .filter({ has: page.locator('.prompt-list-hint', { hasText: /\d+ param/ }) })
        .first();
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
    await page.locator('details.detailsbox summary').click();
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

await browser.close();

if (failures.length) {
    console.error('\nSMOKE FAILED — ' + failures.length + ' issue(s):\n');
    failures.forEach((f) => console.error('  ✗ ' + f));
    console.error('');
    process.exit(1);
}

console.log('\nSMOKE OK — all 17 interaction flows passed. Screenshots in ' + OUT);
