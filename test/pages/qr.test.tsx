import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { FileOpenProvider } from '../../src/components/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '../../src/components/contexts/FileSaveDialogContext';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/qr/index';

jest.mock('qrcode', () => ({
    toCanvas: jest.fn().mockResolvedValue(undefined),
    toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock'),
    toString: jest.fn().mockResolvedValue('<svg/>'),
}));

Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
    writable: true,
});

function renderPage() {
    return render(
        <ToasterProvider>
            <PageProvider>
                <FileOpenProvider>
                    <FileSaveDialogProvider>
                        <IndexPage />
                    </FileSaveDialogProvider>
                </FileOpenProvider>
            </PageProvider>
        </ToasterProvider>,
    );
}

describe('QR page', () => {
    it('renders ToolAbout (hidden by default)', () => {
        renderPage();
        expect(screen.queryByTestId('tool-about')).not.toBeInTheDocument();
    });

    it('renders heading "QR Generator"', () => {
        renderPage();
        expect(screen.getByRole('heading', { name: 'QR Generator' })).toBeInTheDocument();
    });

    it('renders type selector', () => {
        renderPage();
        expect(screen.getByTestId('qr-type-select')).toBeInTheDocument();
    });

    it('shows placeholder when all fields empty', () => {
        renderPage();
        expect(screen.getByTestId('qr-canvas-placeholder')).toBeInTheDocument();
        expect(screen.queryByTestId('qr-canvas')).toBeNull();
    });

    it('shows URL input for URL type (default)', () => {
        renderPage();
        expect(screen.getByTestId('qr-url-input')).toBeInTheDocument();
    });

    it('shows canvas after typing a URL', async () => {
        renderPage();
        fireEvent.change(screen.getByTestId('qr-url-input'), { target: { value: 'https://example.com' } });
        await waitFor(() => expect(screen.getByTestId('qr-canvas')).toBeInTheDocument());
        expect(screen.queryByTestId('qr-canvas-placeholder')).not.toBeInTheDocument();
    });

    it('shows WiFi fields when type switched to wifi', () => {
        renderPage();
        const typeWrapper = screen.getByTestId('qr-type-select');
        const selectEl = typeWrapper.querySelector('select') as HTMLSelectElement;
        fireEvent.change(selectEl, { target: { value: 'wifi' } });
        expect(screen.getByTestId('qr-wifi-ssid')).toBeInTheDocument();
        expect(screen.getByTestId('qr-wifi-password')).toBeInTheDocument();
    });

    it('renders EC level selector with L/M/Q/H buttons', () => {
        renderPage();
        expect(screen.getByRole('group', { name: 'Error correction level' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'L' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'M' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Q' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'H' })).toBeInTheDocument();
    });

    it('download buttons are disabled when payload is empty', () => {
        renderPage();
        const downloadPngBtn = within(screen.getByTestId('qr-download-png')).getByRole('button');
        const downloadSvgBtn = within(screen.getByTestId('qr-download-svg')).getByRole('button');
        expect(downloadPngBtn).toBeDisabled();
        expect(downloadSvgBtn).toBeDisabled();
    });

    it('download buttons are enabled after typing a URL', async () => {
        renderPage();
        fireEvent.change(screen.getByTestId('qr-url-input'), { target: { value: 'https://example.com' } });
        await waitFor(() =>
            expect(within(screen.getByTestId('qr-download-png')).getByRole('button')).not.toBeDisabled(),
        );
    });

    it('Copy Payload button is present', () => {
        renderPage();
        expect(screen.getByTestId('qr-copy-payload')).toBeInTheDocument();
    });
});
