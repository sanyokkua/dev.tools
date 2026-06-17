// Parses public/sw.js precache manifest and asserts all page routes are covered.
// Run after `npm run build` via: node scripts/validate-sw-precache.mjs
import { readFileSync } from 'node:fs';

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
    '/mermaid-editor',
    '/diff',
    '/html-editor',
    '/jwt',
    '/cron',
    '/qr',
];

const sw = readFileSync('public/sw.js', 'utf8');

const match = sw.match(/precacheAndRoute\(\[(.*?)\],\{/s);
if (!match) {
    console.error('Could not find precacheAndRoute in sw.js');
    process.exit(1);
}
const urls = [...match[1].matchAll(/url:"([^"]+)"/g)].map((m) => m[1]);

const missing = [];
for (const route of ROUTES) {
    const slug = route === '/' ? 'index' : route.replace(/^\//, '').replace(/\//g, '/');
    const found = urls.some((u) => u.includes(`/pages/${slug}-`) || u.includes(`/pages/${slug}/`));
    if (!found) missing.push(route);
}

if (missing.length) {
    console.error('sw.js precache is missing page chunks for:');
    missing.forEach((r) => console.error('  ' + r));
    process.exit(1);
}
console.log(`sw.js precache OK — all ${ROUTES.length} routes covered.`);
