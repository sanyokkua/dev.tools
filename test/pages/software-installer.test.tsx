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

describe('Software Installer — Step 2: Manager selection', () => {
    it('renders platform manager chips for macOS', () => {
        renderPage();
        const grp = screen.getByRole('group', { name: 'Platform package managers' });
        expect(within(grp).getByText('Homebrew')).toBeInTheDocument();
        expect(within(grp).getByText('Mac App Store')).toBeInTheDocument();
    });

    it('renders dev manager chips always', () => {
        renderPage();
        const grp = screen.getByRole('group', { name: 'Dev package managers' });
        expect(within(grp).getByText('npm')).toBeInTheDocument();
        expect(within(grp).getByText('uv')).toBeInTheDocument();
        expect(within(grp).getByText('pipx')).toBeInTheDocument();
        expect(within(grp).getByText('cargo')).toBeInTheDocument();
        expect(within(grp).getByText('go')).toBeInTheDocument();
    });

    it('all chips start with aria-pressed=false', () => {
        renderPage();
        const grp = screen.getByRole('group', { name: 'Platform package managers' });
        within(grp)
            .getAllByRole('button')
            .forEach((btn) => {
                expect(btn).toHaveAttribute('aria-pressed', 'false');
            });
    });

    it('clicking a chip selects it', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        expect(screen.getByText('Homebrew').closest('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('clicking a selected chip deselects it', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByText('Homebrew'));
        expect(screen.getByText('Homebrew').closest('button')).toHaveAttribute('aria-pressed', 'false');
    });

    it('summary count updates on toggle', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        expect(screen.getByTestId('sum-managers')).toHaveTextContent('1 manager');
        fireEvent.click(screen.getByText('Homebrew'));
        expect(screen.getByTestId('sum-managers')).toHaveTextContent('0 managers');
    });

    it('plural form: 2 managers', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByText('Mac App Store'));
        expect(screen.getByTestId('sum-managers')).toHaveTextContent('2 managers');
    });

    it('platform change resets selected managers', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByText('Windows'));
        expect(screen.getByTestId('sum-managers')).toHaveTextContent('0 managers');
    });

    it('windows shows correct chips', () => {
        renderPage();
        fireEvent.click(screen.getByText('Windows'));
        const grp = screen.getByRole('group', { name: 'Platform package managers' });
        expect(within(grp).getByText('winget')).toBeInTheDocument();
        expect(within(grp).getByText('Chocolatey')).toBeInTheDocument();
        expect(within(grp).getByText('Scoop')).toBeInTheDocument();
    });

    it('linux-debian shows apt chip', () => {
        renderPage();
        fireEvent.click(screen.getByText('Linux'));
        const grp = screen.getByRole('group', { name: 'Platform package managers' });
        expect(within(grp).getByText('apt')).toBeInTheDocument();
    });

    it('pref control renders with two options', () => {
        renderPage();
        const grp = screen.getByRole('group', { name: 'Fallback preference' });
        expect(within(grp).getByText('Preferred only (skip)')).toBeInTheDocument();
        expect(within(grp).getByText('Fall back to any available')).toBeInTheDocument();
    });

    it('pref defaults to preferred-only', () => {
        renderPage();
        const grp = screen.getByRole('group', { name: 'Fallback preference' });
        expect(within(grp).getByText('Preferred only (skip)').closest('button')).toHaveAttribute(
            'aria-pressed',
            'true',
        );
    });

    it('switching pref updates summary', () => {
        renderPage();
        fireEvent.click(screen.getByText('Fall back to any available'));
        expect(screen.getByTestId('sum-pref')).toHaveTextContent('fallback on');
    });

    it('switching back to preferred restores preferred-only', () => {
        renderPage();
        fireEvent.click(screen.getByText('Fall back to any available'));
        fireEvent.click(screen.getByText('Preferred only (skip)'));
        expect(screen.getByTestId('sum-pref')).toHaveTextContent('preferred-only');
    });
});

describe('Software Installer — Step 3: App catalog', () => {
    it('renders the catalog table', () => {
        renderPage();
        expect(screen.getByTestId('app-catalog')).toBeInTheDocument();
    });

    it('renders the search input', () => {
        renderPage();
        expect(screen.getByPlaceholderText('Search apps…')).toBeInTheDocument();
    });

    it('renders the basket with empty-state hint', () => {
        renderPage();
        expect(screen.getByTestId('app-basket')).toBeInTheDocument();
        expect(screen.getByTestId('basket-empty')).toBeInTheDocument();
    });

    it('renders category filter chips including All', () => {
        renderPage();
        const grp = screen.getByRole('group', { name: 'Category filter' });
        expect(within(grp).getByText('All')).toBeInTheDocument();
    });

    it('Firefox is listed in the catalog', () => {
        renderPage();
        expect(screen.getByLabelText('Select Firefox')).toBeInTheDocument();
    });

    it('selecting an app removes the empty-state and shows it in the basket', () => {
        renderPage();
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        expect(screen.queryByTestId('basket-empty')).not.toBeInTheDocument();
        expect(screen.getByTestId('basket-count')).toHaveTextContent('(1)');
    });

    it('summary app pill updates on selection', () => {
        renderPage();
        expect(screen.getByTestId('sum-apps')).toHaveTextContent('0 apps');
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        expect(screen.getByTestId('sum-apps')).toHaveTextContent('1 app');
    });

    it('summary pluralises correctly for 2+ apps', () => {
        renderPage();
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        fireEvent.click(screen.getByLabelText('Select Google Chrome'));
        expect(screen.getByTestId('sum-apps')).toHaveTextContent('2 apps');
    });

    it('Build Scripts button is disabled initially', () => {
        renderPage();
        expect(screen.getByRole('button', { name: /Build Scripts/i })).toBeDisabled();
    });

    it('Build Scripts button enables when at least one app is selected', () => {
        renderPage();
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        expect(screen.getByRole('button', { name: /Build Scripts/i })).not.toBeDisabled();
    });

    it('deselecting an app from catalog removes it from basket', () => {
        renderPage();
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        expect(screen.getByTestId('basket-empty')).toBeInTheDocument();
        expect(screen.getByTestId('sum-apps')).toHaveTextContent('0 apps');
    });

    it('remove button (×) in basket card removes the app', () => {
        renderPage();
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        fireEvent.click(screen.getByRole('button', { name: /Remove Firefox/i }));
        expect(screen.getByTestId('basket-empty')).toBeInTheDocument();
    });

    it('Clear button removes all apps from basket', () => {
        renderPage();
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        fireEvent.click(screen.getByRole('button', { name: /Clear/i }));
        expect(screen.getByTestId('sum-apps')).toHaveTextContent('0 apps');
        expect(screen.getByTestId('basket-empty')).toBeInTheDocument();
    });

    it('per-app method override select is present in basket card', () => {
        renderPage();
        // Select Homebrew first so Firefox has an available preferred manager
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        expect(screen.getByLabelText('Install method for Firefox')).toBeInTheDocument();
    });

    it('search hides non-matching apps', () => {
        renderPage();
        const search = screen.getByPlaceholderText('Search apps…');
        fireEvent.change(search, { target: { value: 'zznonexistentzzz' } });
        // Firefox should be gone from the catalog
        expect(screen.queryByLabelText('Select Firefox')).not.toBeInTheDocument();
    });

    it('search is case-insensitive', () => {
        renderPage();
        const search = screen.getByPlaceholderText('Search apps…');
        fireEvent.change(search, { target: { value: 'FIREFOX' } });
        expect(screen.getByLabelText('Select Firefox')).toBeInTheDocument();
    });
});
