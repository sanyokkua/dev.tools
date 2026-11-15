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

export interface RenderMermaidOptions {
    /** Set false to render labels as native SVG text (no foreignObject), needed for canvas rasterisation. */
    htmlLabels?: boolean;
}

/**
 * Renders mermaid source to an SVG string.
 * `id` must be a unique DOM-safe id string (no spaces or leading digits).
 * Every call re-initializes mermaid (which resets to defaults), so options never leak into later renders.
 */
export async function renderMermaid(id: string, src: string, options: RenderMermaidOptions = {}): Promise<string> {
    const { default: mermaid } = await import('mermaid');
    const config: Parameters<typeof mermaid.initialize>[0] = { startOnLoad: false, theme: getTheme() };
    if (options.htmlLabels === false) {
        config.htmlLabels = false;
        config.flowchart = { htmlLabels: false };
    }
    mermaid.initialize(config);
    await mermaid.parse(src);
    const { svg } = await mermaid.render(id, src);
    return svg;
}

/**
 * Converts mermaid's HTML-serialised SVG (e.g. `<br>`, `&nbsp;`) into well-formed standalone XML.
 */
export function toXmlSvg(svg: string): string {
    const doc = new DOMParser().parseFromString(svg, 'text/html');
    const el = doc.querySelector('svg');
    if (!el) throw new Error('No <svg> element found');
    // The HTML parser keeps `xmlns` as a plain attribute; XMLSerializer derives it from the element
    // namespace, so leaving both in place would emit a duplicate attribute.
    for (const node of [el, ...el.querySelectorAll('[xmlns]')]) node.removeAttribute('xmlns');
    return new XMLSerializer().serializeToString(el);
}
