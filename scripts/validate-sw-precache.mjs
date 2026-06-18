// Validates that the service worker precache manifest covers all app routes.
//
// Reads public/sw.js, parses the precacheAndRoute() manifest, and asserts a page
// chunk exists for every route in ROUTES. Exits 1 on missing routes; exits 0 on success.
//
// Usage:
//   node scripts/validate-sw-precache.mjs
//
// Prerequisite: npm run build must have completed first (requires public/sw.js)
// Wired as:     npm run validate:sw
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
