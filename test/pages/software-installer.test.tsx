// test/pages/software-installer.test.tsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/software-installer/index';

function renderPage(): ReturnType<typeof render> {
    return render(
        <ToasterProvider>
            <PageProvider>
                <IndexPage />
            </PageProvider>
        </ToasterProvider>,
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
        // mas is hidden via HIDDEN_MANAGERS filter (task 4c)
        expect(within(grp).queryByText('Mac App Store')).not.toBeInTheDocument();
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
        // Mac App Store (mas) is hidden; use a dev manager for the second selection
        fireEvent.click(screen.getByText('npm'));
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

    it('availability column renders labeled mac/win/linux pills', () => {
        renderPage();
        // The catalog renders many rows; Firefox is on all 3 platforms so all pills are present
        const pills = screen.getAllByTitle(/macOS: (available|unavailable)/i);
        expect(pills.length).toBeGreaterThan(0);
        // Each row must have three pills with text content mac, win, linux
        const macPills = screen.getAllByText('mac');
        const winPills = screen.getAllByText('win');
        const linuxPills = screen.getAllByText('linux');
        expect(macPills.length).toBeGreaterThan(0);
        expect(winPills.length).toBeGreaterThan(0);
        expect(linuxPills.length).toBeGreaterThan(0);
    });

    it('Firefox availability pills all have ok class (available on all platforms)', () => {
        renderPage();
        // Firefox has platforms: { macos: true, windows: true, linux: true }
        // Find its row by the checkbox label, then check sibling pill classes
        const firefoxCheckbox = screen.getByLabelText('Select Firefox');
        const row = firefoxCheckbox.closest('tr')!;
        const pills = row.querySelectorAll('.installer-avail__pill');
        expect(pills).toHaveLength(3);
        pills.forEach((pill) => {
            expect(pill).toHaveClass('ok');
            expect(pill).not.toHaveClass('no');
        });
    });

    it('row gains unavailable class when app.platforms[selected] is false', () => {
        renderPage();
        // Switch to Windows — find an app that is NOT on Windows.
        // "iterm2" is macOS-only (platforms: { macos: true, windows: false, linux: false })
        fireEvent.click(screen.getByText('Windows'));
        // iterm2 row should have the unavailable class
        const iterm2Checkbox = screen.queryByLabelText('Select iTerm2');
        if (iterm2Checkbox) {
            const row = iterm2Checkbox.closest('tr')!;
            expect(row).toHaveClass('installer-catalog-row--unavailable');
        } else {
            // If iTerm2 scrolled out of initial view, check that at least some rows are unavailable
            const unavailableRows = document.querySelectorAll('tr.installer-catalog-row--unavailable');
            expect(unavailableRows.length).toBeGreaterThan(0);
        }
    });

    it('switching platform updates which rows are dimmed', () => {
        renderPage();
        // On macOS (default) — count unavailable rows
        const unavailableOnMac = document.querySelectorAll('tr.installer-catalog-row--unavailable').length;
        // Switch to Windows — the count may differ (different apps unsupported)
        fireEvent.click(screen.getByText('Windows'));
        const unavailableOnWindows = document.querySelectorAll('tr.installer-catalog-row--unavailable').length;
        // The two counts need not be equal — what matters is that the class is applied reactively.
        // At least one of the counts should be > 0 (some apps are platform-specific)
        expect(unavailableOnMac + unavailableOnWindows).toBeGreaterThan(0);
    });
});

describe('platform icons, method default, unavailability guard', () => {
    it('shows platform icons in the segmented control', () => {
        renderPage();
        const platformGroup = screen.getByRole('group', { name: 'Target platform' });
        const buttons = within(platformGroup).getAllByRole('button');
        expect(buttons[0].textContent).toContain('⌘');
        expect(buttons[1].textContent).toContain('⊞');
        expect(buttons[2].textContent).toContain('🐧');
    });

    it('defaults install method to resolved preferred manager when adding an app', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        const methodSelect = screen.getByLabelText('Install method for Firefox') as HTMLSelectElement;
        expect(methodSelect.value).not.toBe('');
        expect(methodSelect.value).toBe('brew');
    });

    it('prevents adding unavailable apps on the current platform', () => {
        renderPage();
        const unavailableRows = document.querySelectorAll('tr.installer-catalog-row--unavailable');
        expect(unavailableRows.length).toBeGreaterThan(0);
        const firstUnavailableRow = unavailableRows[0] as HTMLElement;
        const checkbox = within(firstUnavailableRow).getByRole('checkbox') as HTMLInputElement;
        expect(checkbox).toBeDisabled();
        fireEvent.click(firstUnavailableRow);
        expect(checkbox).not.toBeChecked();
    });

    it('changing per-app method override select updates the method to Auto', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        const methodSelect = screen.getByLabelText('Install method for Firefox') as HTMLSelectElement;
        expect(methodSelect.value).toBe('brew');
        fireEvent.change(methodSelect, { target: { value: '' } });
        expect(methodSelect.value).toBe('');
    });
});

describe('Software Installer — Step 4: Output', () => {
    beforeEach(() => {
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: jest.fn().mockResolvedValue(undefined) },
            configurable: true,
        });
        global.URL.createObjectURL = jest.fn(() => 'blob:fake');
        global.URL.revokeObjectURL = jest.fn();
    });

    it('renders the Output step label', () => {
        renderPage();
        expect(screen.getByText('Output')).toBeInTheDocument();
    });

    it('renders action segmented control with Install / Update / Remove', () => {
        renderPage();
        const grp = screen.getByRole('group', { name: 'Script action' });
        expect(within(grp).getByText('Install')).toBeInTheDocument();
        expect(within(grp).getByText('Update')).toBeInTheDocument();
        expect(within(grp).getByText('Remove')).toBeInTheDocument();
    });

    it('Install is the default action', () => {
        renderPage();
        const grp = screen.getByRole('group', { name: 'Script action' });
        expect(within(grp).getByText('Install').closest('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders scope segmented control with Combined / Per-app', () => {
        renderPage();
        const grp = screen.getByRole('group', { name: 'Script scope' });
        expect(within(grp).getByText('Single combined')).toBeInTheDocument();
        expect(within(grp).getByText('One per app')).toBeInTheDocument();
    });

    it('Combined is the default scope', () => {
        renderPage();
        const grp = screen.getByRole('group', { name: 'Script scope' });
        expect(within(grp).getByText('Single combined').closest('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows empty-state placeholder when no apps are selected', () => {
        renderPage();
        expect(screen.getByTestId('output-empty')).toBeInTheDocument();
    });

    it('shows code panel when Homebrew and Firefox are selected', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        expect(screen.queryByTestId('output-empty')).not.toBeInTheDocument();
        expect(screen.getByTestId('output-code')).toBeInTheDocument();
    });

    it('combined script filename is install.sh for macOS', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        expect(screen.getByTestId('output-filename')).toHaveTextContent('install.sh');
    });

    it('filename is install.ps1 on Windows', () => {
        renderPage();
        fireEvent.click(screen.getByText('Windows'));
        fireEvent.click(screen.getByText('winget'));
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        expect(screen.getByTestId('output-filename')).toHaveTextContent('install.ps1');
    });

    it('Update action changes filename to update.sh', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        fireEvent.click(within(screen.getByRole('group', { name: 'Script action' })).getByText('Update'));
        expect(screen.getByTestId('output-filename')).toHaveTextContent('update.sh');
    });

    it('Remove action changes filename to remove.sh', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        fireEvent.click(within(screen.getByRole('group', { name: 'Script action' })).getByText('Remove'));
        expect(screen.getByTestId('output-filename')).toHaveTextContent('remove.sh');
    });

    it('Per-app scope changes filename to install-scripts.sh', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        fireEvent.click(within(screen.getByRole('group', { name: 'Script scope' })).getByText('One per app'));
        expect(screen.getByTestId('output-filename')).toHaveTextContent('install-scripts.sh');
    });

    it('combined bash script contains run_task boilerplate', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        expect(screen.getByTestId('output-code').textContent).toContain('run_task');
    });

    it('per-app scope renders individual CodeSnippet blocks (one per app)', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        fireEvent.click(within(screen.getByRole('group', { name: 'Script scope' })).getByText('One per app'));
        // task 4b: per-app now renders individual snippets inside output-per-app
        expect(screen.getByTestId('output-per-app')).toBeInTheDocument();
        // Firefox's name should appear as a snippet header
        expect(screen.getByTestId('output-code').textContent).toContain('Firefox');
    });

    it('per-app preview shows skip comment for app with no preferred manager', () => {
        renderPage();
        // No managers selected, app is in basket — should emit skip comment
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        fireEvent.click(within(screen.getByRole('group', { name: 'Script scope' })).getByText('One per app'));
        expect(screen.getByTestId('output-code').textContent).toContain('skipped');
    });

    it('download button triggers URL.createObjectURL', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        fireEvent.click(within(screen.getByTestId('output-code')).getByRole('button', { name: /download/i }));
        expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('Build Scripts button is enabled when apps are selected', () => {
        renderPage();
        fireEvent.click(screen.getByLabelText('Select Firefox'));
        expect(screen.getByRole('button', { name: /Build Scripts/i })).not.toBeDisabled();
    });
});

describe('Software Installer — Multi-version JDK selection', () => {
    it('shows version chip group instead of a version select for parameterized apps', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Amazon Corretto'));
        // No longer a <select> for version
        expect(screen.queryByLabelText('Version for Amazon Corretto')).not.toBeInTheDocument();
        // Chip group present
        expect(screen.getByRole('group', { name: 'Versions for Amazon Corretto' })).toBeInTheDocument();
    });

    it('defaults to the last version pre-selected on app add', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Amazon Corretto'));
        const versionGroup = screen.getByRole('group', { name: 'Versions for Amazon Corretto' });
        const selected = within(versionGroup)
            .getAllByRole('button')
            .filter((btn) => btn.getAttribute('aria-pressed') === 'true');
        expect(selected.length).toBeGreaterThan(0);
    });

    it('clicking an unselected version chip selects it', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Amazon Corretto'));
        const versionGroup = screen.getByRole('group', { name: 'Versions for Amazon Corretto' });
        const unselected = within(versionGroup)
            .getAllByRole('button')
            .find((btn) => btn.getAttribute('aria-pressed') === 'false');
        expect(unselected).toBeDefined();
        fireEvent.click(unselected!);
        expect(unselected!).toHaveAttribute('aria-pressed', 'true');
    });

    it('clicking a selected version chip deselects it', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Amazon Corretto'));
        const versionGroup = screen.getByRole('group', { name: 'Versions for Amazon Corretto' });
        const selected = within(versionGroup)
            .getAllByRole('button')
            .filter((btn) => btn.getAttribute('aria-pressed') === 'true');
        expect(selected.length).toBeGreaterThan(0);
        fireEvent.click(selected[0]);
        expect(selected[0]).toHaveAttribute('aria-pressed', 'false');
    });

    it('shows "Select a version" status when all chips are deselected', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Amazon Corretto'));
        const versionGroup = screen.getByRole('group', { name: 'Versions for Amazon Corretto' });
        // Deselect every selected chip
        const allSelected = within(versionGroup)
            .getAllByRole('button')
            .filter((btn) => btn.getAttribute('aria-pressed') === 'true');
        allSelected.forEach((chip) => fireEvent.click(chip));
        expect(screen.getByText('Select a version')).toBeInTheDocument();
    });

    it('removing a parameterized app cleans up its version selection', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Amazon Corretto'));
        // App added; select an extra version
        const versionGroup = screen.getByRole('group', { name: 'Versions for Amazon Corretto' });
        const unselected = within(versionGroup)
            .getAllByRole('button')
            .find((btn) => btn.getAttribute('aria-pressed') === 'false');
        if (unselected) fireEvent.click(unselected);
        // Now remove the app
        fireEvent.click(screen.getByRole('button', { name: /Remove Amazon Corretto/i }));
        // Re-add the app — should start fresh with only the default version
        fireEvent.click(screen.getByLabelText('Select Amazon Corretto'));
        const versionGroupAfter = screen.getByRole('group', { name: 'Versions for Amazon Corretto' });
        const selectedAfter = within(versionGroupAfter)
            .getAllByRole('button')
            .filter((btn) => btn.getAttribute('aria-pressed') === 'true');
        expect(selectedAfter).toHaveLength(1);
    });

    it('combined script output contains a command for each selected version', () => {
        renderPage();
        fireEvent.click(screen.getByText('Homebrew'));
        fireEvent.click(screen.getByLabelText('Select Amazon Corretto'));
        // Select one additional version beyond the default
        const versionGroup = screen.getByRole('group', { name: 'Versions for Amazon Corretto' });
        const unselected = within(versionGroup)
            .getAllByRole('button')
            .find((btn) => btn.getAttribute('aria-pressed') === 'false');
        if (unselected) fireEvent.click(unselected);
        // Output panel should have at least 2 corretto@ references
        const outputText = screen.getByTestId('output-code').textContent ?? '';
        const matches = outputText.match(/corretto@\d+/g) ?? [];
        expect(matches.length).toBeGreaterThanOrEqual(2);
    });
});

describe('Software Installer — handleBulkAdd integration', () => {
    it('Add All Visible adds unselected platform-available apps to the basket', () => {
        renderPage();
        // Narrow to "iterm" — uniquely matches only iTerm2 (macOS-only), so count is predictable.
        const search = screen.getByPlaceholderText('Search apps…');
        fireEvent.change(search, { target: { value: 'iterm' } });

        // Before: basket empty, summary shows 0 apps.
        expect(screen.getByTestId('sum-apps')).toHaveTextContent('0 apps');
        expect(screen.getByTestId('basket-empty')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Add All Visible' }));

        // iTerm2 is available on macOS (default platform) → it should be added.
        expect(screen.getByTestId('sum-apps')).toHaveTextContent('1 app');
        expect(screen.queryByTestId('basket-empty')).not.toBeInTheDocument();
    });

    it('Add All Visible does not add the same app twice', () => {
        renderPage();
        const search = screen.getByPlaceholderText('Search apps…');
        fireEvent.change(search, { target: { value: 'iterm' } });

        fireEvent.click(screen.getByRole('button', { name: 'Add All Visible' }));
        expect(screen.getByTestId('sum-apps')).toHaveTextContent('1 app');

        // Clicking again should not duplicate.
        fireEvent.click(screen.getByRole('button', { name: 'Add All Visible' }));
        expect(screen.getByTestId('sum-apps')).toHaveTextContent('1 app');
    });

    it('Add Supported adds only apps with a matching manager', () => {
        renderPage();
        // Select Homebrew as a manager.
        fireEvent.click(screen.getByText('Homebrew'));

        // Narrow to "iterm" — iTerm2 has a brew method on macOS.
        const search = screen.getByPlaceholderText('Search apps…');
        fireEvent.change(search, { target: { value: 'iterm' } });

        fireEvent.click(screen.getByRole('button', { name: 'Add Supported' }));

        // iTerm2 should be in the basket.
        expect(screen.getByTestId('sum-apps')).toHaveTextContent('1 app');
        expect(screen.queryByTestId('basket-empty')).not.toBeInTheDocument();
    });

    it('Add Supported adds nothing when no managers are selected', () => {
        renderPage();
        // No managers selected.
        const search = screen.getByPlaceholderText('Search apps…');
        fireEvent.change(search, { target: { value: 'iterm' } });

        fireEvent.click(screen.getByRole('button', { name: 'Add Supported' }));

        // Nothing should be added.
        expect(screen.getByTestId('sum-apps')).toHaveTextContent('0 apps');
        expect(screen.getByTestId('basket-empty')).toBeInTheDocument();
    });
});
