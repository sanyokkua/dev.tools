import { fireEvent, render, screen } from '@testing-library/react';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/linux-setup/index';

function renderPage(): ReturnType<typeof render> {
    return render(
        <ToasterProvider>
            <PageProvider>
                <IndexPage />
            </PageProvider>
        </ToasterProvider>,
    );
}

describe('Linux Setup page', () => {
    it('renders both section buttons in the segmented control', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Package managers' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Environment variables' })).toBeInTheDocument();
    });

    it('renders all four distro buttons', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Debian / Ubuntu' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Fedora / RHEL' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Arch' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'openSUSE' })).toBeInTheDocument();
    });

    it('shows Package managers content by default (Debian/apt)', () => {
        renderPage();
        expect(screen.getByText(/apt --version/i)).toBeInTheDocument();
    });

    it('switching to Fedora / RHEL shows dnf content', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Fedora / RHEL' }));
        expect(screen.getByText(/dnf --version/i)).toBeInTheDocument();
    });

    it('clicking Environment variables section shows env-var content', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Environment variables' }));
        expect(screen.getAllByText(/Reload the shell profile/i).length).toBeGreaterThan(0);
    });

    it('Debian / Ubuntu distro button has aria-pressed true by default', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Debian / Ubuntu' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('Fedora / RHEL distro button has aria-pressed false by default', () => {
        renderPage();
        expect(screen.getByRole('button', { name: 'Fedora / RHEL' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('Snap section is visible on the default Debian distro', () => {
        renderPage();
        expect(screen.getByText(/snapd/i)).toBeInTheDocument();
    });
});
