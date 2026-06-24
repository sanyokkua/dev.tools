jest.mock('browser-fs-access', () => ({ __esModule: true, fileSave: jest.fn(), supported: false }));

jest.mock('@/common/file-utils', () => ({ ...jest.requireActual('@/common/file-utils'), saveAsFile: jest.fn() }));

import { saveAsFile } from '@/common/file-utils';
import { FileSaveDialogProvider, useFileSaveDialog } from '@/contexts/FileSaveDialogContext';
import { ToasterProvider } from '@/contexts/ToasterContext';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as bfa from 'browser-fs-access';

const mockSaveAsFile = saveAsFile as jest.MockedFunction<typeof saveAsFile>;

const defaultOpts = { fileName: 'myfile', fileExtension: '.txt', fileContent: 'hello', availableExtensions: ['.txt'] };

function Wrapper() {
    const { showFileSaveDialog, saveAs, save, currentHandle, setCurrentHandle } = useFileSaveDialog();
    return (
        <div>
            <button onClick={() => showFileSaveDialog(defaultOpts)}>show-dialog</button>
            <button onClick={() => saveAs(defaultOpts)}>save-as</button>
            <button onClick={() => save(defaultOpts)}>save</button>
            <button onClick={() => setCurrentHandle({ kind: 'file', name: 'mock' } as unknown as FileSystemFileHandle)}>
                set-handle
            </button>
            <span data-testid="handle">{currentHandle ? 'has-handle' : 'no-handle'}</span>
        </div>
    );
}

function renderWrapper() {
    return render(
        <ToasterProvider>
            <FileSaveDialogProvider>
                <Wrapper />
            </FileSaveDialogProvider>
        </ToasterProvider>,
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    (bfa as { supported: boolean }).supported = false;
});

// ─── showFileSaveDialog ───────────────────────────────────────────────────────

describe('showFileSaveDialog', () => {
    it('opens the modal regardless of supported flag', () => {
        renderWrapper();
        fireEvent.click(screen.getByText('show-dialog'));
        expect(screen.getByText('Save File As')).toBeInTheDocument();
    });
});

// ─── saveAs ───────────────────────────────────────────────────────────────────

describe('saveAs', () => {
    it('shows modal when supported === false', () => {
        renderWrapper();
        fireEvent.click(screen.getByText('save-as'));
        expect(screen.getByText('Save File As')).toBeInTheDocument();
        expect(mockSaveAsFile).not.toHaveBeenCalled();
    });

    it('calls saveAsFile directly when supported === true (no modal)', async () => {
        mockSaveAsFile.mockResolvedValue(undefined);
        (bfa as { supported: boolean }).supported = true;

        renderWrapper();
        fireEvent.click(screen.getByText('save-as'));

        await waitFor(() => expect(mockSaveAsFile).toHaveBeenCalledTimes(1));
        expect(screen.queryByText('Save File As')).toBeNull();
    });

    it('shows success toast after saveAsFile resolves when supported', async () => {
        mockSaveAsFile.mockResolvedValue(undefined);
        (bfa as { supported: boolean }).supported = true;

        renderWrapper();
        fireEvent.click(screen.getByText('save-as'));

        await waitFor(() => expect(screen.getByText('File Saved')).toBeInTheDocument());
    });

    it('stores returned handle in currentHandle after successful saveAs', async () => {
        const mockHandle = { kind: 'file', name: 'saved.txt' } as unknown as FileSystemFileHandle;
        mockSaveAsFile.mockResolvedValue(mockHandle);
        (bfa as { supported: boolean }).supported = true;

        renderWrapper();
        expect(screen.getByTestId('handle').textContent).toBe('no-handle');

        fireEvent.click(screen.getByText('save-as'));

        await waitFor(() => expect(screen.getByTestId('handle').textContent).toBe('has-handle'));
    });

    it('shows error toast when saveAsFile rejects', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockSaveAsFile.mockRejectedValue(new Error('disk full'));
        (bfa as { supported: boolean }).supported = true;

        renderWrapper();
        fireEvent.click(screen.getByText('save-as'));

        await waitFor(() => expect(screen.getByText('Failed to Save file')).toBeInTheDocument());
        consoleSpy.mockRestore();
    });
});

// ─── save ────────────────────────────────────────────────────────────────────

describe('save', () => {
    it('falls through to saveAs (shows modal) when no currentHandle and not supported', () => {
        renderWrapper();
        fireEvent.click(screen.getByText('save'));
        expect(screen.getByText('Save File As')).toBeInTheDocument();
        expect(mockSaveAsFile).not.toHaveBeenCalled();
    });

    it('calls saveAsFile directly when no handle but supported === true', async () => {
        mockSaveAsFile.mockResolvedValue(undefined);
        (bfa as { supported: boolean }).supported = true;

        renderWrapper();
        fireEvent.click(screen.getByText('save'));

        await waitFor(() => expect(mockSaveAsFile).toHaveBeenCalledTimes(1));
    });

    it('calls saveAsFile with currentHandle when handle is set', async () => {
        mockSaveAsFile.mockResolvedValue(undefined);
        (bfa as { supported: boolean }).supported = true;

        renderWrapper();
        // Set a handle first
        fireEvent.click(screen.getByText('set-handle'));
        await waitFor(() => expect(screen.getByTestId('handle').textContent).toBe('has-handle'));

        fireEvent.click(screen.getByText('save'));

        await waitFor(() => {
            const call = mockSaveAsFile.mock.calls[0];
            expect(call[1]).toEqual(expect.objectContaining({ kind: 'file' }));
        });
    });
});

// ─── setCurrentHandle ────────────────────────────────────────────────────────

describe('setCurrentHandle', () => {
    it('updates currentHandle in context', () => {
        renderWrapper();
        expect(screen.getByTestId('handle').textContent).toBe('no-handle');
        fireEvent.click(screen.getByText('set-handle'));
        expect(screen.getByTestId('handle').textContent).toBe('has-handle');
    });
});
