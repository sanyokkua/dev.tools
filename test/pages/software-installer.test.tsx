// test/pages/software-installer.test.tsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import { PageProvider } from '../../src/components/contexts/PageContext';
import IndexPage from '../../src/pages/software-installer/index';

function renderPage(): ReturnType<typeof render> {
    return render(
        <PageProvider>
            <IndexPage />
        </PageProvider>,
    );
}

describe('Software Installer — page shell', () => {
    it('renders the platform segmented control with three options', () => {
        renderPage();
        const platformControl = screen.getByRole('group', { name: 'Target platform' });
        expect(platformControl).toBeInTheDocument();
        expect(within(platformControl).getByText('macOS')).toBeInTheDocument();
        expect(within(platformControl).getByText('Windows')).toBeInTheDocument();
        expect(within(platformControl).getByText('Linux')).toBeInTheDocument();
    });

    it('defaults to macOS selected', () => {
        renderPage();
        const platformControl = screen.getByRole('group', { name: 'Target platform' });
        expect(within(platformControl).getByText('macOS').closest('button')).toHaveAttribute('aria-pressed', 'true');
        expect(within(platformControl).getByText('Windows').closest('button')).toHaveAttribute('aria-pressed', 'false');
        expect(within(platformControl).getByText('Linux').closest('button')).toHaveAttribute('aria-pressed', 'false');
    });

    it('does not show the distro section when platform is macOS', () => {
        renderPage();
        expect(screen.queryByTestId('distro-section')).not.toBeInTheDocument();
    });

    it('shows the distro section when Linux is selected', () => {
        renderPage();
        fireEvent.click(screen.getByText('Linux'));
        expect(screen.getByTestId('distro-section')).toBeInTheDocument();
        expect(screen.getByRole('group', { name: 'Linux distribution family' })).toBeInTheDocument();
    });

    it('hides the distro section when switching from Linux to macOS', () => {
        renderPage();
        fireEvent.click(screen.getByText('Linux'));
        expect(screen.getByTestId('distro-section')).toBeInTheDocument();
        fireEvent.click(screen.getByText('macOS'));
        expect(screen.queryByTestId('distro-section')).not.toBeInTheDocument();
    });

    it('distro control defaults to Debian / Ubuntu · apt', () => {
        renderPage();
        fireEvent.click(screen.getByText('Linux'));
        expect(screen.getByText('Debian / Ubuntu · apt').closest('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders the sticky summary bar', () => {
        renderPage();
        expect(screen.getByRole('region', { name: 'Selection summary' })).toBeInTheDocument();
    });

    it('summary shows current platform name', () => {
        renderPage();
        expect(screen.getByTestId('sum-platform')).toHaveTextContent('macOS');
        fireEvent.click(screen.getByText('Windows'));
        expect(screen.getByTestId('sum-platform')).toHaveTextContent('Windows');
    });

    it('summary shows 0 managers and 0 apps initially', () => {
        renderPage();
        expect(screen.getByTestId('sum-managers')).toHaveTextContent('0 managers');
        expect(screen.getByTestId('sum-apps')).toHaveTextContent('0 apps');
    });

    it('summary shows preferred-only as default pref mode', () => {
        renderPage();
        expect(screen.getByTestId('sum-pref')).toHaveTextContent('preferred-only');
    });

    it('renders all four numbered step labels', () => {
        renderPage();
        expect(screen.getByText('Target platform')).toBeInTheDocument();
        expect(screen.getByText('Preferred package managers')).toBeInTheDocument();
        expect(screen.getByText('Applications')).toBeInTheDocument();
        expect(screen.getByText('Output')).toBeInTheDocument();
    });
});
