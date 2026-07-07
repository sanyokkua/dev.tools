import { fireEvent, render, screen, within } from '@testing-library/react';
import { DEV_ENV_CATALOG, type DevEnvCategory, type DevEnvOS } from '../../src/common/dev-env-catalog';
import { PageProvider } from '../../src/components/contexts/PageContext';
import { ToasterProvider } from '../../src/components/contexts/ToasterContext';
import IndexPage from '../../src/pages/dev-environment-setup/index';

function renderPage(): ReturnType<typeof render> {
    return render(
        <ToasterProvider>
            <PageProvider>
                <IndexPage />
            </PageProvider>
        </ToasterProvider>,
    );
}

describe('Dev Environment Setup page', () => {
    it('renders the category segmented control with 7 options, Java pressed by default', () => {
        renderPage();
        const grp = screen.getByRole('group', { name: 'Category' });
        expect(within(grp).getByText('Java (JDK)')).toBeInTheDocument();
        expect(within(grp).getByText('Maven')).toBeInTheDocument();
        expect(within(grp).getByText('Gradle')).toBeInTheDocument();
        expect(within(grp).getByText('Python')).toBeInTheDocument();
        expect(within(grp).getByText('Go')).toBeInTheDocument();
        expect(within(grp).getByText('Node.js')).toBeInTheDocument();
        expect(within(grp).getByText('Bun')).toBeInTheDocument();
        expect(within(grp).getByText('Java (JDK)').closest('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('does not show the distro section for macOS, shows it (defaulting to Debian) for Linux', () => {
        renderPage();
        expect(screen.queryByTestId('distro-section')).not.toBeInTheDocument();
        fireEvent.click(screen.getByText('Linux'));
        expect(screen.getByTestId('distro-section')).toBeInTheDocument();
        expect(screen.getByText('Debian / Ubuntu · apt').closest('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders Java/macOS manager chips', () => {
        renderPage();
        const grp = screen.getByRole('group', { name: 'Package / version managers' });
        expect(within(grp).getByText('Homebrew (JDK vendor casks)')).toBeInTheDocument();
        expect(within(grp).getByText('jenv')).toBeInTheDocument();
        expect(within(grp).getByText('SDKMAN!')).toBeInTheDocument();
    });

    it('selecting a manager chip renders its step group', () => {
        renderPage();
        fireEvent.click(screen.getByText('jenv'));
        expect(screen.queryAllByText(/Verify/).length).toBeGreaterThan(0);
    });

    it('switching Category resets OS back to macOS and clears manager selection', () => {
        renderPage();
        const grp = screen.getByRole('group', { name: 'Package / version managers' });
        fireEvent.click(within(grp).getByText('jenv'));
        expect(within(grp).getByText('jenv').closest('button')).toHaveAttribute('aria-pressed', 'true');

        fireEvent.click(screen.getByText('Python'));
        expect(screen.getByTestId('dev-env-empty')).toBeInTheDocument();
        expect(screen.getByText('macOS').closest('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('switching OS clears manager selection', () => {
        renderPage();
        fireEvent.click(screen.getByText('jenv'));
        fireEvent.click(screen.getByText('Windows'));
        expect(screen.getByTestId('dev-env-empty')).toBeInTheDocument();
    });

    it('Java on Windows has no jenv chip but does have the manual JAVA_HOME fallback', () => {
        renderPage();
        fireEvent.click(screen.getByText('Windows'));
        const grp = screen.getByRole('group', { name: 'Package / version managers' });
        expect(within(grp).queryByText('jenv')).not.toBeInTheDocument();
        expect(within(grp).getByText('Manual JAVA_HOME (PowerShell)')).toBeInTheDocument();
    });

    it('Go/macOS Homebrew configure step adds $(go env GOPATH)/bin to PATH', () => {
        renderPage();
        fireEvent.click(screen.getByText('Go'));
        fireEvent.click(screen.getByText('Homebrew'));
        expect(screen.getAllByText(/go env GOPATH/).length).toBeGreaterThan(0);
    });

    it('Maven shows only Manual and Automated install script chips (no package manager) on every OS', () => {
        renderPage();
        fireEvent.click(screen.getByText('Maven'));
        for (const os of ['macOS', 'Windows', 'Linux']) {
            if (os !== 'macOS') fireEvent.click(screen.getByText(os));
            const grp = screen.getByRole('group', { name: 'Package / version managers' });
            expect(within(grp).getByText(/^Manual/)).toBeInTheDocument();
            expect(within(grp).getByText(/^Automated install script/)).toBeInTheDocument();
            expect(
                within(grp).queryByText(/winget|Homebrew|apt|dnf|pacman|zypper|Chocolatey|Scoop/),
            ).not.toBeInTheDocument();
        }
    });

    it('Maven manual entry never assigns M2_HOME', () => {
        renderPage();
        fireEvent.click(screen.getByText('Maven'));
        fireEvent.click(screen.getByText(/^Manual/));
        expect(screen.queryByText(/M2_HOME=/)).not.toBeInTheDocument();
    });

    it('Gradle shows only Manual and Automated install script chips (no package manager) on every OS', () => {
        renderPage();
        fireEvent.click(screen.getByText('Gradle'));
        for (const os of ['macOS', 'Windows', 'Linux']) {
            if (os !== 'macOS') fireEvent.click(screen.getByText(os));
            const grp = screen.getByRole('group', { name: 'Package / version managers' });
            expect(within(grp).getByText(/^Manual/)).toBeInTheDocument();
            expect(within(grp).getByText(/^Automated install script/)).toBeInTheDocument();
            expect(
                within(grp).queryByText(/winget|Homebrew|apt|dnf|pacman|zypper|Chocolatey|Scoop/),
            ).not.toBeInTheDocument();
        }
    });

    it('Node.js on Windows: selecting nvm-windows surfaces its caveat notes', () => {
        renderPage();
        fireEvent.click(screen.getByText('Node.js'));
        fireEvent.click(screen.getByText('Windows'));
        fireEvent.click(screen.getByText('nvm-windows'));
        expect(screen.getByText(/feature freeze/i)).toBeInTheDocument();
    });

    it('shows the empty state with no manager selected, and it disappears once one is selected', () => {
        renderPage();
        expect(screen.getByTestId('dev-env-empty')).toHaveTextContent(
            'Select one or more package managers above to see setup instructions.',
        );
        fireEvent.click(screen.getByText('jenv'));
        expect(screen.queryByTestId('dev-env-empty')).not.toBeInTheDocument();
    });

    it('every rendered CodeSnippet has both a Copy and a Download button', () => {
        renderPage();
        fireEvent.click(screen.getByText('jenv'));
        const copyButtons = screen.getAllByRole('button', { name: 'Copy' });
        const downloadButtons = screen.getAllByRole('button', { name: /Download/ });
        expect(copyButtons.length).toBeGreaterThan(0);
        expect(copyButtons.length).toBe(downloadButtons.length);
    });
});

describe('DEV_ENV_CATALOG — no managerId collisions once linux overrides are merged', () => {
    const CATEGORIES = Object.keys(DEV_ENV_CATALOG) as DevEnvCategory[];
    const OSES: DevEnvOS[] = ['macos', 'windows', 'linux'];

    it('every (category, os[, distro]) manager list used by the page has unique managerIds', () => {
        for (const category of CATEGORIES) {
            const data = DEV_ENV_CATALOG[category];
            for (const os of OSES) {
                const base = data.managersByOS[os];
                if (os !== 'linux') {
                    expect(new Set(base.map((m) => m.managerId)).size).toBe(base.length);
                    continue;
                }
                const distros = Object.keys(data.linuxDistroOverrides ?? {});
                if (distros.length === 0) {
                    expect(new Set(base.map((m) => m.managerId)).size).toBe(base.length);
                    continue;
                }
                for (const distro of distros) {
                    const override =
                        data.linuxDistroOverrides?.[distro as keyof typeof data.linuxDistroOverrides] ?? [];
                    const combined = [...base, ...override];
                    expect(new Set(combined.map((m) => m.managerId)).size).toBe(combined.length);
                }
            }
        }
    });
});
