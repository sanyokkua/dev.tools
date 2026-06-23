jest.mock('browser-fs-access', () => ({ __esModule: true, fileSave: jest.fn(), supported: false }));
jest.mock('fflate', () => ({
    strToU8: jest.fn((s: string) => new TextEncoder().encode(s)),
    zipSync: jest.fn(() => new Uint8Array()),
}));

import {
    createDefaultFile,
    createEmptyFile,
    createFileInfo,
    createFileReadPromise,
    downloadSkillZip,
    handleFileOpenFailure,
    saveAsFile,
    saveTextFile,
} from '@/common/file-utils';
import type { Skill } from '@/common/prompts/types';
import { fileSave } from 'browser-fs-access';

const mockFileSave = fileSave as jest.MockedFunction<typeof fileSave>;

beforeEach(() => {
    jest.clearAllMocks();
});

// ─── saveAsFile ───────────────────────────────────────────────────────────────

describe('saveAsFile', () => {
    it('calls fileSave with correct blob and options', async () => {
        mockFileSave.mockResolvedValue(undefined as unknown as FileSystemFileHandle);
        await saveAsFile({ fileName: 'x', fileExtension: '.txt', fileContent: 'hello', fileMimeType: 'text/plain' });
        expect(mockFileSave).toHaveBeenCalledWith(
            expect.any(Blob),
            { fileName: 'x.txt', extensions: ['.txt'], mimeTypes: ['text/plain'] },
            null,
        );
    });

    it('returns handle from fileSave when native picker used', async () => {
        const mockHandle = { kind: 'file' } as unknown as FileSystemFileHandle;
        mockFileSave.mockResolvedValue(mockHandle);
        const result = await saveAsFile({ fileName: 'doc', fileExtension: '.md' });
        expect(result).toBe(mockHandle);
    });

    it('returns undefined when fileSave returns undefined (download fallback)', async () => {
        mockFileSave.mockResolvedValue(undefined as unknown as FileSystemFileHandle);
        const result = await saveAsFile({ fileName: 'doc', fileExtension: '.txt' });
        expect(result).toBeUndefined();
    });

    it('passes existingHandle as 3rd arg to fileSave', async () => {
        const mockHandle = { kind: 'file' } as unknown as FileSystemFileHandle;
        mockFileSave.mockResolvedValue(mockHandle);
        await saveAsFile({ fileName: 'doc', fileExtension: '.txt' }, mockHandle);
        expect(mockFileSave).toHaveBeenCalledWith(expect.any(Blob), expect.any(Object), mockHandle);
    });

    it('throws when fileName is empty', async () => {
        await expect(saveAsFile({ fileName: '', fileExtension: '.txt' })).rejects.toThrow("File name can't be empty");
    });

    it('throws when fileExtension is empty', async () => {
        await expect(saveAsFile({ fileName: 'doc', fileExtension: '' })).rejects.toThrow(
            "File extension can't be empty",
        );
    });

    it('throws when fileExtension has no leading dot', async () => {
        await expect(saveAsFile({ fileName: 'doc', fileExtension: 'txt' })).rejects.toThrow(
            'File extension should start from . (dot)',
        );
    });

    it('throws when fileName already contains extension', async () => {
        await expect(saveAsFile({ fileName: 'doc.txt', fileExtension: '.txt' })).rejects.toThrow(
            'File name already contains file extension',
        );
    });
});

// ─── saveTextFile ─────────────────────────────────────────────────────────────

describe('saveTextFile', () => {
    let createElementSpy: jest.SpyInstance;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;
    let mockAnchor: { href: string; download: string; click: jest.Mock };

    beforeEach(() => {
        mockAnchor = { href: '', download: '', click: jest.fn() };
        createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);
        appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
        removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
        // jsdom doesn't implement URL.createObjectURL — define as jest.fn() directly
        global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
        global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
    });

    it('creates an anchor element and clicks it', () => {
        saveTextFile({ fileName: 'test', fileExtension: '.txt', fileContent: 'hello' });
        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(mockAnchor.click).toHaveBeenCalled();
        expect(mockAnchor.download).toBe('test.txt');
    });

    it('throws when fileName is empty', () => {
        expect(() => saveTextFile({ fileName: '', fileExtension: '.txt' })).toThrow("File name can't be empty");
    });
});

// ─── createFileInfo ───────────────────────────────────────────────────────────

describe('createFileInfo', () => {
    it('extracts name, extension, fullName, size, content', () => {
        const file = new File(['hello'], 'myfile.txt', { type: 'text/plain' });
        const info = createFileInfo(file, 'hello');
        expect(info.name).toBe('myfile');
        expect(info.extension).toBe('.txt');
        expect(info.fullName).toBe('myfile.txt');
        expect(info.size).toBe(5);
        expect(info.content).toBe('hello');
    });

    it('handles filenames with multiple dots', () => {
        const file = new File(['data'], 'archive.tar.gz', { type: 'application/gzip' });
        const info = createFileInfo(file, 'data');
        expect(info.name).toBe('archive.tar');
        expect(info.extension).toBe('.gz');
    });
});

// ─── createEmptyFile ──────────────────────────────────────────────────────────

describe('createEmptyFile', () => {
    it('returns object with all fields empty or zero', () => {
        const file = createEmptyFile();
        expect(file.fullName).toBe('');
        expect(file.size).toBe(0);
        expect(file.content).toBe('');
        expect(file.name).toBe('');
        expect(file.extension).toBe('');
    });
});

// ─── createDefaultFile ────────────────────────────────────────────────────────

describe('createDefaultFile', () => {
    it('returns Untitled with default extension', () => {
        const file = createDefaultFile();
        expect(file.name).toBe('Untitled');
        expect(file.extension).toBe('.txt');
        expect(file.content).toBe('');
        expect(file.size).toBe(0);
    });
});

// ─── handleFileOpenFailure ────────────────────────────────────────────────────

describe('handleFileOpenFailure', () => {
    it('returns empty file', () => {
        const result = handleFileOpenFailure(new Error('read error'));
        expect(result).toEqual(createEmptyFile());
    });

    it('logs the error', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const err = new Error('boom');
        handleFileOpenFailure(err);
        expect(consoleSpy).toHaveBeenCalledWith('Error reading file:', err);
        consoleSpy.mockRestore();
    });
});

// ─── createFileReadPromise ────────────────────────────────────────────────────

describe('createFileReadPromise', () => {
    it('resolves with file text content', async () => {
        const file = new File(['hello world'], 'test.txt', { type: 'text/plain' });
        const content = await createFileReadPromise(file);
        expect(content).toBe('hello world');
    });

    it('rejects when FileReader errors', async () => {
        const mockReader = {
            onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
            onerror: null as (() => void) | null,
            readAsText: jest.fn(function (this: typeof mockReader) {
                setTimeout(() => this.onerror?.(), 0);
            }),
        };
        jest.spyOn(window, 'FileReader').mockImplementation(() => mockReader as unknown as FileReader);

        await expect(createFileReadPromise(new File(['x'], 'x.txt'))).rejects.toThrow('Failed to read file');
        (window.FileReader as jest.MockedClass<typeof FileReader>).mockRestore();
    });
});

// ─── downloadSkillZip ─────────────────────────────────────────────────────────

describe('downloadSkillZip', () => {
    const mockSkill: Skill = {
        id: 'SKILL-my-skill',
        slug: 'my-skill',
        domainCode: 'A',
        title: 'My Skill',
        version: '1.0.0',
        description: 'test skill',
        tags: [],
        allowedTools: [],
        relatedSkillIds: [],
        files: [
            { path: 'SKILL.md', role: 'skill', content: '# My Skill' },
            { path: 'references/guide.md', role: 'reference', content: '# Guide' },
            { path: 'scripts/run.sh', role: 'script', content: '#!/bin/sh\necho hi' },
        ],
    };

    let mockAnchor: { href: string; download: string; click: jest.Mock };

    beforeEach(() => {
        mockAnchor = { href: '', download: '', click: jest.fn() };
        jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);
        jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
        jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
        global.URL.createObjectURL = jest.fn(() => 'blob:mock');
        global.URL.revokeObjectURL = jest.fn();
    });

    it('calls zipSync with slug-prefixed paths for all files', async () => {
        const { zipSync } = jest.requireMock('fflate') as { zipSync: jest.Mock };
        await downloadSkillZip(mockSkill);
        expect(zipSync).toHaveBeenCalledWith(
            expect.objectContaining({
                'my-skill/SKILL.md': expect.anything(),
                'my-skill/references/guide.md': expect.anything(),
                'my-skill/scripts/run.sh': expect.anything(),
            }),
        );
    });

    it('sets anchor download attribute to slug.zip', async () => {
        await downloadSkillZip(mockSkill);
        expect(mockAnchor.download).toBe('my-skill.zip');
    });

    it('revokes the object URL after triggering download', async () => {
        await downloadSkillZip(mockSkill);
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
    });
});
