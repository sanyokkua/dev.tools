import { fireEvent, render, screen } from '@testing-library/react';
import { FileOpenProvider } from '../../src/components/contexts/FileOpenContext';
import { FileSaveDialogProvider } from '../../src/components/contexts/FileSaveDialogContext';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/cron/index';

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

describe('Cron page', () => {
    it('renders ToolAbout (hidden by default)', () => {
        renderPage();
        expect(screen.queryByTestId('tool-about')).not.toBeInTheDocument();
    });

    it('renders dialect selector with Linux, Quartz, AWS buttons', () => {
        renderPage();
        const group = screen.getByRole('group', { name: 'Cron dialect' });
        expect(group).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Linux' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Quartz' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'AWS' })).toBeInTheDocument();
    });

    it('renders cron input textarea', () => {
        renderPage();
        expect(screen.getByTestId('cron-input')).toBeInTheDocument();
    });

    it('shows no output cards when input is empty', () => {
        renderPage();
        expect(screen.queryByTestId('cron-description')).not.toBeInTheDocument();
        expect(screen.queryByTestId('cron-next-runs')).not.toBeInTheDocument();
    });

    it('shows description and next-runs when valid expression entered', () => {
        renderPage();
        fireEvent.change(screen.getByTestId('cron-input'), { target: { value: '* * * * *' } });
        const description = screen.getByTestId('cron-description');
        expect(description).toBeInTheDocument();
        expect(description.textContent).not.toBe('');
        expect(screen.getByTestId('cron-next-runs')).toBeInTheDocument();
    });

    it('shows error pill for invalid expression', () => {
        renderPage();
        fireEvent.change(screen.getByTestId('cron-input'), { target: { value: 'not a cron' } });
        expect(screen.getByTestId('cron-error')).toBeInTheDocument();
    });

    it('shows hints card when Quartz dialect selected', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Quartz' }));
        fireEvent.change(screen.getByTestId('cron-input'), { target: { value: '0 * * * * ?' } });
        expect(screen.getByTestId('cron-hints')).toBeInTheDocument();
    });

    it('shows no hints for Linux dialect', () => {
        renderPage();
        fireEvent.change(screen.getByTestId('cron-input'), { target: { value: '* * * * *' } });
        expect(screen.queryByTestId('cron-hints')).not.toBeInTheDocument();
    });
});
