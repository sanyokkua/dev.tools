type MermaidTheme = 'default' | 'dark';

function getTheme(): MermaidTheme {
    if (typeof document === 'undefined') return 'default';
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default';
}

/**
 * Validates mermaid source syntax. Throws if `src` contains a parse error.
 */
export async function parseMermaid(src: string): Promise<void> {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({ startOnLoad: false, theme: getTheme() });
    await mermaid.parse(src);
}

/**
 * Renders mermaid source to an SVG string.
 * `id` must be a unique DOM-safe id string (no spaces or leading digits).
 */
export async function renderMermaid(id: string, src: string): Promise<string> {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({ startOnLoad: false, theme: getTheme() });
    const { svg } = await mermaid.render(id, src);
    return svg;
}
