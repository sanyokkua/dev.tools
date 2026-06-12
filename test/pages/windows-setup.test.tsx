import { fireEvent, render, screen } from '@testing-library/react';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/windows-setup/index';

function renderPage(): ReturnType<typeof render> {
    return render(
        <ToasterProvider>
            <PageProvider>
                <IndexPage />
            </PageProvider>
        </ToasterProvider>,
    );
}

describe('Windows Setup page', () => {
    it('renders the page heading', () => {
        renderPage();
        expect(screen.getByRole('heading', { name: 'Windows Setup' })).toBeInTheDocument();
    });

    it('renders both tab buttons', () => {
        renderPage();
        expect(screen.getByRole('tab', { name: 'Package managers' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Environment variables' })).toBeInTheDocument();
    });

    it('shows Package managers content by default', () => {
        renderPage();
        expect(screen.getByText(/winget \(built-in\)/i)).toBeInTheDocument();
    });

    it('switches to Environment variables tab on click', () => {
        renderPage();
        fireEvent.click(screen.getByRole('tab', { name: 'Environment variables' }));
        expect(screen.getAllByText(/SetEnvironmentVariable/).length).toBeGreaterThan(0);
    });

    it('Package managers tab is aria-pressed when active', () => {
        renderPage();
        const managersTab = screen.getByRole('tab', { name: 'Package managers' });
        expect(managersTab).toHaveAttribute('aria-pressed', 'true');
    });

    it('switching manager chips shows relevant install content', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Chocolatey' }));
        expect(screen.getByText(/community.chocolatey.org/i)).toBeInTheDocument();
    });
});
