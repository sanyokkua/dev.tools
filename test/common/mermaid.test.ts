jest.mock('mermaid', () => ({
    __esModule: true,
    default: { initialize: jest.fn(), parse: jest.fn(), render: jest.fn() },
}));

import { parseMermaid, renderMermaid } from '@/common/mermaid';
import mermaidDefault from 'mermaid';

const mm = mermaidDefault as { initialize: jest.Mock; parse: jest.Mock; render: jest.Mock };

beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.removeAttribute('data-theme');
    mm.parse.mockResolvedValue(true);
    mm.render.mockResolvedValue({ svg: '<svg>mock</svg>' });
});

// ─── renderMermaid ────────────────────────────────────────────────────────────

describe('renderMermaid', () => {
    it('returns the svg string from mermaid.render', async () => {
        mm.render.mockResolvedValue({ svg: '<svg>diagram</svg>' });
        const result = await renderMermaid('d1', 'graph TD\nA --> B');
        expect(result).toBe('<svg>diagram</svg>');
    });

    it('forwards id and src to mermaid.render', async () => {
        await renderMermaid('my-id', 'flowchart LR\nX --> Y');
        expect(mm.render).toHaveBeenCalledWith('my-id', 'flowchart LR\nX --> Y');
    });

    it('initializes mermaid with startOnLoad: false', async () => {
        await renderMermaid('d2', 'graph TD\nA --> B');
        expect(mm.initialize).toHaveBeenCalledWith(expect.objectContaining({ startOnLoad: false }));
    });

    it('passes theme: "default" when no data-theme attribute is set', async () => {
        await renderMermaid('d3', 'graph TD\nA --> B');
        expect(mm.initialize).toHaveBeenCalledWith(expect.objectContaining({ theme: 'default' }));
    });

    it('passes theme: "dark" when data-theme="dark"', async () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        await renderMermaid('d4', 'graph TD\nA --> B');
        expect(mm.initialize).toHaveBeenCalledWith(expect.objectContaining({ theme: 'dark' }));
    });

    it('passes theme: "default" when data-theme="light"', async () => {
        document.documentElement.setAttribute('data-theme', 'light');
        await renderMermaid('d5', 'graph TD\nA --> B');
        expect(mm.initialize).toHaveBeenCalledWith(expect.objectContaining({ theme: 'default' }));
    });

    it('propagates errors thrown by mermaid.render', async () => {
        mm.render.mockRejectedValue(new Error('render failure'));
        await expect(renderMermaid('d6', 'bad diagram')).rejects.toThrow('render failure');
    });
});

// ─── parseMermaid ─────────────────────────────────────────────────────────────

describe('parseMermaid', () => {
    it('resolves when mermaid.parse succeeds', async () => {
        mm.parse.mockResolvedValue(true);
        await expect(parseMermaid('graph TD\nA --> B')).resolves.toBeUndefined();
    });

    it('forwards the source string to mermaid.parse', async () => {
        await parseMermaid('flowchart LR\nA --> B');
        expect(mm.parse).toHaveBeenCalledWith('flowchart LR\nA --> B');
    });

    it('initializes mermaid with startOnLoad: false', async () => {
        await parseMermaid('graph TD\nA --> B');
        expect(mm.initialize).toHaveBeenCalledWith(expect.objectContaining({ startOnLoad: false }));
    });

    it('passes theme: "dark" when data-theme="dark"', async () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        await parseMermaid('graph TD\nA --> B');
        expect(mm.initialize).toHaveBeenCalledWith(expect.objectContaining({ theme: 'dark' }));
    });

    it('passes theme: "default" when no data-theme attribute', async () => {
        await parseMermaid('graph TD\nA --> B');
        expect(mm.initialize).toHaveBeenCalledWith(expect.objectContaining({ theme: 'default' }));
    });

    it('propagates parse errors thrown by mermaid.parse', async () => {
        mm.parse.mockRejectedValue(new Error('Syntax error at line 1'));
        await expect(parseMermaid('invalid !!!')).rejects.toThrow('Syntax error at line 1');
    });

    it('resolves when mermaid.parse returns false (non-throwing empty/unknown)', async () => {
        mm.parse.mockResolvedValue(false);
        await expect(parseMermaid('')).resolves.toBeUndefined();
    });
});
