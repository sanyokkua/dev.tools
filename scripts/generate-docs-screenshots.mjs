// Generates docs/screenshots/*.png — 20 realistic marketing screenshots.
//
// Each capture navigates to a route, seeds it with demo data, sets the theme,
// and expands/collapses the sidebar to match the scenario table below.
//
// Usage:
//   node scripts/generate-docs-screenshots.mjs
//   BASE_URL=http://localhost:3000 node scripts/generate-docs-screenshots.mjs
//
// Env:
//   BASE_URL  Dev-server base URL (default: http://localhost:3000)
//   CI        Forces headless Chromium; omit to use the local Chrome channel
//   HEADLESS  Set to "false" to show the browser window (default: true)
//
// Prerequisite: npm run dev must be running on BASE_URL
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = 'docs/screenshots';
mkdirSync(OUT, { recursive: true });

const HEADLESS = process.env.HEADLESS !== 'false';
const browser = await chromium.launch(process.env.CI ? { headless: true } : { channel: 'chrome', headless: HEADLESS });

const failures = [];

async function capture(name, url, { theme, sidebar, showInfo = false, setup } = {}) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    process.stdout.write(`  ${name} … `);
    try {
        // Navigate, reset sidebar localStorage, reload for clean state
        await page.goto(BASE + url, { waitUntil: 'networkidle' });
        await page.evaluate(() => localStorage.removeItem('sidebarCollapsed'));
        await page.reload({ waitUntil: 'networkidle' });

        // Apply theme
        await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
        await page.waitForTimeout(300);

        // Sidebar is collapsed by default; expand only when requested
        if (sidebar === 'expanded') {
            await page.click('[aria-label="Expand sidebar"]');
            await page.waitForTimeout(200);
        }

        // Scenario-specific data setup
        if (setup) await setup(page);

        // Show info panel if requested
        if (showInfo) {
            const btn = page.locator('button[aria-label="Toggle tool info"]');
            if (await btn.count()) {
                await btn.click();
                await page.waitForTimeout(300);
            }
        }

        await page.screenshot({ path: `${OUT}/${name}.png` });
        process.stdout.write('ok\n');
    } catch (err) {
        process.stdout.write('FAILED\n');
        failures.push(`${name}: ${err.message.split('\n')[0]}`);
        try {
            await page.screenshot({ path: `${OUT}/${name}.png` });
        } catch {}
    } finally {
        await ctx.close();
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function typeInMonaco(page, selector, text) {
    await page.waitForSelector('.monaco-editor', { timeout: 8000 });
    await page.locator(selector).first().click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type(text);
    await page.waitForTimeout(400);
}

// ── 1. code-editor — dark / expanded / info visible ──────────────────────────
await capture('code-editor', '/code-editor', {
    theme: 'dark',
    sidebar: 'expanded',
    showInfo: true,
    setup: async (page) => {
        await typeInMonaco(
            page,
            '.code-editor__editor .monaco-editor .view-lines',
            'class UserService {\n' +
                '  constructor(private readonly db: Database) {}\n\n' +
                '  async findById(id: string): Promise<User | null> {\n' +
                "    return this.db.query('SELECT * FROM users WHERE id = $1', [id]);\n" +
                '  }\n\n' +
                '  async create(data: CreateUserDto): Promise<User> {\n' +
                '    const hash = await bcrypt.hash(data.password, 10);\n' +
                "    return this.db.insert('users', { ...data, password: hash });\n" +
                '  }\n' +
                '}',
        );
        // Click Format so the output pane shows the formatted result
        const formatBtn = page.getByRole('button', { name: 'Format' });
        if (await formatBtn.isEnabled()) {
            await formatBtn.click();
            await page.waitForTimeout(600);
        }
    },
});

// ── 2. cron — light / collapsed ───────────────────────────────────────────────
await capture('cron', '/cron', {
    theme: 'light',
    sidebar: 'collapsed',
    setup: async (page) => {
        await page.locator('[data-testid="cron-input"]').fill('0 9 * * 1-5');
        await page.waitForSelector('[data-testid="cron-description"]', { timeout: 5000 });
        await page.waitForTimeout(300);
    },
});

// ── 3. diff — dark / collapsed ────────────────────────────────────────────────
await capture('diff', '/diff', {
    theme: 'dark',
    sidebar: 'collapsed',
    setup: async (page) => {
        await page.waitForSelector('.monaco-diff-editor .monaco-editor', { timeout: 10000 });

        const leftPane = page.locator('.original-in-monaco-diff-editor .view-lines');
        await leftPane.click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.type(
            'function fetchUser(id) {\n' +
                '  const user = db.find(id);\n' +
                '  if (!user) {\n' +
                "    throw new Error('Not found');\n" +
                '  }\n' +
                '  return user;\n' +
                '}',
        );
        await page.waitForTimeout(300);

        const rightPane = page.locator('.modified-in-monaco-diff-editor .view-lines');
        await rightPane.click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.type(
            'async function fetchUser(id) {\n' +
                '  const user = await db.findAsync(id);\n' +
                '  if (!user) {\n' +
                '    throw new UserNotFoundError(id);\n' +
                '  }\n' +
                '  return user;\n' +
                '}',
        );
        await page.waitForTimeout(400);
    },
});

// ── 4. encoding — light / expanded ───────────────────────────────────────────
await capture('encoding', '/encoding-tools', {
    theme: 'light',
    sidebar: 'expanded',
    setup: async (page) => {
        await typeInMonaco(page, '.editorpane .monaco-editor .view-lines', 'Hello, Developer World!');
        await page.waitForSelector('.func-btn', { timeout: 3000 });
        await page
            .locator('.func-btn')
            .filter({ hasText: /^Encode Base64$/ })
            .click();
        await page.waitForTimeout(500);
    },
});

// ── 5. git-cheat-sheet — dark / expanded ─────────────────────────────────────
await capture('git-cheat-sheet', '/git-cheat-sheet', {
    theme: 'dark',
    sidebar: 'expanded',
    setup: async (page) => {
        await page.fill('#git-name', 'Alice Johnson');
        await page.fill('#git-email', 'alice@example.com');
        await page.locator('button[type="submit"]').click();
        await page.waitForSelector('.git-cheat-sheet__output-col .code-block', { timeout: 5000 });
        await page.waitForTimeout(300);
    },
});

// ── 6. hashing — light / collapsed ───────────────────────────────────────────
await capture('hashing', '/hashing-tools', {
    theme: 'light',
    sidebar: 'collapsed',
    setup: async (page) => {
        await typeInMonaco(
            page,
            '.editorpane .eb .monaco-editor .view-lines',
            'The quick brown fox jumps over the lazy dog',
        );
        await page.waitForFunction(
            () =>
                Array.from(document.querySelectorAll('table.t td.mono')).some(
                    (td) => td.textContent?.trim() && !td.querySelector('.spinner'),
                ),
            { timeout: 8000 },
        );
    },
});

// ── 7. json-formatter — dark / collapsed ─────────────────────────────────────
await capture('json-formatter', '/json-formatter', {
    theme: 'dark',
    sidebar: 'collapsed',
    setup: async (page) => {
        await typeInMonaco(
            page,
            '.editorpane .monaco-editor .view-lines',
            '{"users":[{"id":1,"name":"Alice Johnson","email":"alice@example.com","role":"admin"},' +
                '{"id":2,"name":"Bob Smith","email":"bob@example.com","role":"user"},' +
                '{"id":3,"name":"Carol White","email":"carol@example.com","role":"user"}],"total":3,"page":1}',
        );
        // Beautify so the right pane shows the formatted output
        await page.locator('button', { hasText: 'Beautify' }).click();
        await page.waitForTimeout(600);
    },
});

// ── 8. jwt — light / expanded ─────────────────────────────────────────────────
await capture('jwt', '/jwt', {
    theme: 'light',
    sidebar: 'expanded',
    setup: async (page) => {
        await page
            .locator('[data-testid="jwt-input"]')
            .fill(
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
                    '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
                    '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
            );
        await page.waitForFunction(() => document.body.innerText.includes('John Doe'), { timeout: 5000 });
        await page.waitForTimeout(300);
    },
});

// ── 9. main-page — light / expanded ──────────────────────────────────────────
await capture('main-page', '/', { theme: 'light', sidebar: 'expanded' });

// ── 10. markdown-tools — dark / expanded ─────────────────────────────────────
await capture('markdown-tools', '/markdown-tools', {
    theme: 'dark',
    sidebar: 'expanded',
    setup: async (page) => {
        await typeInMonaco(
            page,
            '.markdown-tools__pane.editorpane .monaco-editor .view-lines',
            '# dev.tools\n\n' +
                'A browser-based developer utilities suite.\n\n' +
                '## Quick Start\n\n' +
                '| Command | Description |\n' +
                '|---------|-------------|\n' +
                '| `npm install` | Install dependencies |\n' +
                '| `npm run dev` | Start dev server |\n\n' +
                '```bash\nnpm run build\n```\n\n' +
                '- [x] Setup complete\n' +
                '- [x] Tests passing\n' +
                '- [ ] Deploy to production\n',
        );
        await page.waitForFunction(
            () => document.querySelector('.markdown-tools__preview')?.textContent?.includes('dev.tools'),
            { timeout: 5000 },
        );
    },
});

// ── 11. mermaid-editor — light / collapsed ────────────────────────────────────
await capture('mermaid-editor', '/mermaid-editor', {
    theme: 'light',
    sidebar: 'collapsed',
    setup: async (page) => {
        await typeInMonaco(
            page,
            '.split-preview-editor .editorpane .monaco-editor .view-lines',
            'graph TD\n' +
                '  A[Request] --> B[Validate]\n' +
                '  B --> C[Authenticate]\n' +
                '  C --> D[Process]\n' +
                '  D --> E[Respond]\n' +
                '  B --> F[Reject]\n' +
                '  C --> F',
        );
        await page.waitForSelector('.split-preview-editor .split-preview-editor__preview .mermaid-block svg', {
            timeout: 12000,
        });
        // Extra wait for the SVG rendering to finish painting
        await page.waitForTimeout(1200);
    },
});

// ── 12. prompts-collection-catalog — dark / collapsed ─────────────────────────
await capture('prompts-collection-catalog', '/prompts-collection?view=catalog', {
    theme: 'dark',
    sidebar: 'collapsed',
    setup: async (page) => {
        await page.waitForSelector('.pc-catalog-table', { timeout: 8000 });
        await page.waitForTimeout(300);
    },
});

// ── 13. prompts-collection-skill — light / expanded ──────────────────────────
await capture('prompts-collection-skill', '/prompts-collection?type=skills', {
    theme: 'light',
    sidebar: 'expanded',
    setup: async (page) => {
        await page.waitForSelector('[role="option"]', { timeout: 8000 });
        const firstItem = page.locator('[role="option"]').first();
        if (await firstItem.count()) {
            await firstItem.click();
            await page.waitForTimeout(400);
        }
    },
});

// ── 14. prompts-collection — dark / expanded ─────────────────────────────────
await capture('prompts-collection', '/prompts-collection', {
    theme: 'dark',
    sidebar: 'expanded',
    setup: async (page) => {
        await page.waitForSelector('[role="option"]', { timeout: 8000 });
        const firstItem = page.locator('[role="option"]').first();
        if (await firstItem.count()) {
            await firstItem.click();
            await page.waitForTimeout(400);
        }
    },
});

// ── 15. qr — light / collapsed ───────────────────────────────────────────────
await capture('qr', '/qr', {
    theme: 'light',
    sidebar: 'collapsed',
    setup: async (page) => {
        await page.locator('[data-testid="qr-url-input"]').fill('https://github.com/ok-github/dev.tools');
        await page.waitForSelector('[data-testid="qr-canvas"]', { timeout: 5000 });
        await page.waitForFunction(
            () => {
                const c = document.querySelector('[data-testid="qr-canvas"]');
                return c && Number(c.getAttribute('width')) > 0;
            },
            { timeout: 8000 },
        );
        await page.waitForTimeout(200);
    },
});

// ── 16. software-installer — dark / expanded ──────────────────────────────────
await capture('software-installer', '/software-installer', {
    theme: 'dark',
    sidebar: 'expanded',
    setup: async (page) => {
        await page.waitForSelector('[data-testid^="select-app-"]', { timeout: 5000 });

        // Try to use a search/filter input if present
        const searchInput = page.locator(
            'input[type="search"], input[placeholder*="search" i], input[placeholder*="filter" i]',
        );
        if (await searchInput.count()) {
            await searchInput.first().fill('node');
            await page.waitForTimeout(500);
        }

        // Select Node.js if available; otherwise select the first app
        const nodejsChk = page.locator('[aria-label="Select Node.js"]');
        if (await nodejsChk.count()) {
            await nodejsChk.click();
            await page.waitForTimeout(200);
            const npmChk = page.locator('[aria-label="Select npm"]');
            if (await npmChk.count()) {
                await npmChk.click();
                await page.waitForTimeout(200);
            }
        } else {
            await page.locator('[data-testid^="select-app-"]').first().click();
            await page.waitForTimeout(200);
        }

        await page.waitForSelector('[data-testid="output-code"]', { timeout: 5000 });
        await page.waitForTimeout(300);
    },
});

// ── 17. string-utils — light / expanded ──────────────────────────────────────
await capture('string-utils', '/string-utils', {
    theme: 'light',
    sidebar: 'expanded',
    setup: async (page) => {
        await typeInMonaco(
            page,
            '.editorpane .monaco-editor .view-lines',
            'hello world developer tools\nopen source utilities\nbrowser based toolkit',
        );
        // Switch to Case Utils and apply Title Case so the output pane is populated
        await page.locator('.card.pad select.input').selectOption('case-utils');
        await page.waitForTimeout(200);
        await page.locator('.func-btn', { hasText: 'Title Case' }).click();
        await page.waitForTimeout(500);
    },
});

// ── 18. terminal-utils — dark / collapsed ────────────────────────────────────
await capture('terminal-utils', '/terminal-utils', {
    theme: 'dark',
    sidebar: 'collapsed',
    setup: async (page) => {
        await typeInMonaco(
            page,
            '.terminal-utils .eb .monaco-editor .view-lines',
            'git clone https://github.com/example/project.git\n' + 'cd project\n' + 'npm install\n' + 'npm run dev',
        );
        // Join the commands so the output pane is populated
        await page.locator('button', { hasText: 'Join with &&' }).click();
        await page.waitForTimeout(500);
        const resultText = await page.locator('.terminal-utils .eb').last().locator('.view-lines').textContent();
        if (!resultText?.trim()) throw new Error('Result editor is empty after Join with &&');
    },
});

// ── 19. vram-calculator — light / collapsed ───────────────────────────────────
await capture('vram-calculator', '/llm-vram-calculator', {
    theme: 'light',
    sidebar: 'collapsed',
    setup: async (page) => {
        // Fill params and calculate to show results
        await page.fill('#params_b', '7');
        await page.click('button[type="submit"]');
        await page.waitForSelector('.vram-kpi-value', { timeout: 5000 });
        await page.waitForTimeout(300);
    },
});

// ── 20. xml-formatter — dark / expanded ──────────────────────────────────────
await capture('xml-formatter', '/xml-formatter', {
    theme: 'dark',
    sidebar: 'expanded',
    setup: async (page) => {
        await typeInMonaco(
            page,
            '.editorpane .monaco-editor .view-lines',
            '<project>\n' +
                '  <modelVersion>4.0.0</modelVersion>\n' +
                '  <groupId>com.example</groupId>\n' +
                '  <artifactId>my-app</artifactId>\n' +
                '  <version>1.0.0</version>\n' +
                '  <dependencies>\n' +
                '    <dependency>\n' +
                '      <groupId>org.springframework.boot</groupId>\n' +
                '      <artifactId>spring-boot-starter</artifactId>\n' +
                '    </dependency>\n' +
                '  </dependencies>\n' +
                '</project>',
        );
        await page.waitForSelector('.pill.ok', { timeout: 5000 });
        // Beautify so the right pane shows the formatted output
        await page.locator('button', { hasText: 'Beautify' }).click();
        await page.waitForTimeout(600);
    },
});

// ── Wrap up ───────────────────────────────────────────────────────────────────
await browser.close();

if (failures.length) {
    console.error('\nSCREENSHOT GENERATION — ' + failures.length + ' failure(s):\n');
    failures.forEach((f) => console.error('  ✗ ' + f));
    console.error('');
    process.exit(1);
}

console.log(`\nSCREENSHOT OK — all 20 screenshots written to ${OUT}/`);
