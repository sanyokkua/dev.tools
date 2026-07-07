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

    it('Environment variables section covers reaching GUI apps via a LaunchAgent', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Environment variables' }));
        expect(screen.getAllByText(/LaunchAgent/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/launchctl setenv/i).length).toBeGreaterThan(0);
    });

    it('Environment variables section covers the session-only launchctl setenv command', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Environment variables' }));
        expect(screen.getAllByText(/this login session only/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/launchctl setenv OPENROUTER_API_KEY/i)).toBeInTheDocument();
    });

    it('switches to Platform scripts on click', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Platform scripts' }));
        expect(screen.getAllByText(/Apple Silicon VRAM Manager/i).length).toBeGreaterThan(0);
    });

    it('renders the brew PATH snippet with a portable ~/.zprofile path, not a hardcoded /Users/ path', () => {
        const { container } = renderPage();
        expect(container.textContent).toContain('~/.zprofile');
        expect(container.textContent).not.toContain('/Users/');
    });

    it('Package managers tab shows manual-install guidance for tools like Maven/Gradle', () => {
        renderPage();
        expect(screen.getByText(/Where to put manually installed tools/i)).toBeInTheDocument();
    });
});
