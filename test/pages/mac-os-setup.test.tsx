import { fireEvent, render, screen } from '@testing-library/react';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/mac-os-setup/index';

function renderPage(): ReturnType<typeof render> {
    return render(
        <ToasterProvider>
            <PageProvider>
                <IndexPage />
            </PageProvider>
        </ToasterProvider>,
    );
}

describe('macOS Setup page', () => {
    it('renders the page heading', () => {
        renderPage();
        expect(screen.getByRole('heading', { name: 'macOS Setup' })).toBeInTheDocument();
    });

    it('renders all three section buttons in the segmented control', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Package managers' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Environment variables' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Platform scripts' })).toBeInTheDocument();
    });

    it('Package managers button is aria-pressed by default', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Package managers' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows Homebrew install steps by default', () => {
        renderPage();
        expect(screen.getByText(/Install Homebrew/i)).toBeInTheDocument();
    });

    it('switches to Environment variables on click', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Environment variables' }));
        expect(screen.getAllByText(/Set an environment variable/i).length).toBeGreaterThan(0);
    });

    it('switches to Platform scripts on click', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Platform scripts' }));
        expect(screen.getAllByText(/Apple Silicon VRAM Manager/i).length).toBeGreaterThan(0);
    });
});
