jest.mock('prettier/standalone', () => ({ __esModule: true, default: { format: jest.fn() } }));
jest.mock('prettier/plugins/babel', () => ({ __esModule: true, default: {} }));
jest.mock('prettier/plugins/estree', () => ({ __esModule: true, default: {} }));
jest.mock('prettier/plugins/typescript', () => ({ __esModule: true, default: {} }));
jest.mock('prettier/plugins/html', () => ({ __esModule: true, default: {} }));
jest.mock('prettier/plugins/postcss', () => ({ __esModule: true, default: {} }));
jest.mock('prettier/plugins/markdown', () => ({ __esModule: true, default: {} }));
jest.mock('sql-formatter', () => ({ format: jest.fn() }));
jest.mock('@prettier/plugin-xml', () => ({ __esModule: true, default: {} }));

import { formatCode, isFormattable } from '@/common/format-code';
import prettierStandalone from 'prettier/standalone';
import * as sqlFormatter from 'sql-formatter';

const prettierMock = prettierStandalone as { format: jest.Mock };
const sqlMock = sqlFormatter as { format: jest.Mock };

beforeEach(() => {
    jest.clearAllMocks();
    prettierMock.format.mockResolvedValue('formatted');
    sqlMock.format.mockReturnValue('formatted sql');
});

// ─── isFormattable ────────────────────────────────────────────────────────────

describe('isFormattable', () => {
    it.each([
        'javascript',
        'jsx',
        'typescript',
        'tsx',
        'json',
        'json5',
        'html',
        'css',
        'scss',
        'less',
        'markdown',
        'sql',
        'xml',
    ])('returns true for %s', (lang) => {
        expect(isFormattable(lang)).toBe(true);
    });

    it.each(['go', 'java', 'python', 'rust', 'shell', 'plaintext', ''])('returns false for %s', (lang) => {
        expect(isFormattable(lang)).toBe(false);
    });
});

// ─── formatCode: routing ──────────────────────────────────────────────────────

describe('formatCode routing', () => {
    it('formats javascript with parser babel', async () => {
        await formatCode('javascript', 'const x=1');
        expect(prettierMock.format).toHaveBeenCalledWith('const x=1', expect.objectContaining({ parser: 'babel' }));
    });

    it('formats jsx with parser babel', async () => {
        await formatCode('jsx', 'const x=1');
        expect(prettierMock.format).toHaveBeenCalledWith('const x=1', expect.objectContaining({ parser: 'babel' }));
    });

    it('formats typescript with parser typescript', async () => {
        await formatCode('typescript', 'const x:number=1');
        expect(prettierMock.format).toHaveBeenCalledWith(
            'const x:number=1',
            expect.objectContaining({ parser: 'typescript' }),
        );
    });

    it('formats tsx with parser typescript', async () => {
        await formatCode('tsx', 'const x:number=1');
        expect(prettierMock.format).toHaveBeenCalledWith(
            'const x:number=1',
            expect.objectContaining({ parser: 'typescript' }),
        );
    });

    it('formats json with parser json', async () => {
        await formatCode('json', '{"a":1}');
        expect(prettierMock.format).toHaveBeenCalledWith('{"a":1}', expect.objectContaining({ parser: 'json' }));
    });

    it('formats json5 with parser json5', async () => {
        await formatCode('json5', '{a:1}');
        expect(prettierMock.format).toHaveBeenCalledWith('{a:1}', expect.objectContaining({ parser: 'json5' }));
    });

    it('formats html with parser html', async () => {
        await formatCode('html', '<div></div>');
        expect(prettierMock.format).toHaveBeenCalledWith('<div></div>', expect.objectContaining({ parser: 'html' }));
    });

    it('formats css with parser css', async () => {
        await formatCode('css', 'a{color:red}');
        expect(prettierMock.format).toHaveBeenCalledWith('a{color:red}', expect.objectContaining({ parser: 'css' }));
    });

    it('formats scss with parser scss', async () => {
        await formatCode('scss', '$x:1;');
        expect(prettierMock.format).toHaveBeenCalledWith('$x:1;', expect.objectContaining({ parser: 'scss' }));
    });

    it('formats less with parser less', async () => {
        await formatCode('less', '@x:1;');
        expect(prettierMock.format).toHaveBeenCalledWith('@x:1;', expect.objectContaining({ parser: 'less' }));
    });

    it('formats markdown with parser markdown', async () => {
        await formatCode('markdown', '# Hello');
        expect(prettierMock.format).toHaveBeenCalledWith('# Hello', expect.objectContaining({ parser: 'markdown' }));
    });

    it('formats sql using sql-formatter', async () => {
        await formatCode('sql', 'select 1');
        expect(sqlMock.format).toHaveBeenCalledWith('select 1', expect.objectContaining({ language: 'sql' }));
        expect(prettierMock.format).not.toHaveBeenCalled();
    });

    it('formats xml with parser xml', async () => {
        await formatCode('xml', '<root/>');
        expect(prettierMock.format).toHaveBeenCalledWith('<root/>', expect.objectContaining({ parser: 'xml' }));
    });
});

// ─── formatCode: edge cases ───────────────────────────────────────────────────

describe('formatCode edge cases', () => {
    it('returns empty string unchanged without calling any formatter', async () => {
        const result = await formatCode('javascript', '');
        expect(result).toBe('');
        expect(prettierMock.format).not.toHaveBeenCalled();
        expect(sqlMock.format).not.toHaveBeenCalled();
    });

    it('returns whitespace-only string unchanged without calling any formatter', async () => {
        const result = await formatCode('javascript', '   \n');
        expect(result).toBe('   \n');
        expect(prettierMock.format).not.toHaveBeenCalled();
        expect(sqlMock.format).not.toHaveBeenCalled();
    });

    it('returns src unchanged for unsupported language', async () => {
        const result = await formatCode('go', 'package main');
        expect(result).toBe('package main');
        expect(prettierMock.format).not.toHaveBeenCalled();
        expect(sqlMock.format).not.toHaveBeenCalled();
    });

    it('propagates errors thrown by prettier.format', async () => {
        prettierMock.format.mockRejectedValue(new Error('parse error'));
        await expect(formatCode('javascript', 'const x=1')).rejects.toThrow('parse error');
    });

    it('propagates errors thrown by sql-formatter', async () => {
        sqlMock.format.mockImplementation(() => {
            throw new Error('sql error');
        });
        await expect(formatCode('sql', 'SELECT')).rejects.toThrow('sql error');
    });
});

// ─── Real integration test (unmocked) ────────────────────────────────────────

describe('real prettier integration', () => {
    it('formats javascript via actual prettier/standalone', async () => {
        jest.unmock('prettier/standalone');
        jest.unmock('prettier/plugins/babel');
        jest.unmock('prettier/plugins/estree');
        jest.resetModules();
        const { formatCode: realFormatCode } = await import('@/common/format-code');
        const out = await realFormatCode('javascript', 'const x=1');
        expect(out).toContain('const x = 1');
    });
});
