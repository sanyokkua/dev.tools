import { render, screen } from '@testing-library/react';
import type { DevEnvManagerBootstrap } from '../../../../src/common/dev-env-catalog';
import { ToasterProvider } from '../../../../src/components/contexts/ToasterContext';
import ManagerSetupSteps from '../../../../src/components/page-specific/dev-environment-setup/ManagerSetupSteps';

const BASE: DevEnvManagerBootstrap = {
    managerId: 'fixture',
    managerLabel: 'Fixture Manager',
    builtIntoOS: false,
    availableOn: ['macos'],
    installManager: 'brew install fixture-manager',
    installTool: 'fixture-manager install tool@21',
    verify: 'fixture-manager --version',
};

function renderSteps(entry: DevEnvManagerBootstrap, os: 'macos' | 'windows' | 'linux' = 'macos'): void {
    render(
        <ToasterProvider>
            <ManagerSetupSteps entry={entry} os={os} category="java" />
        </ToasterProvider>,
    );
}

describe('ManagerSetupSteps', () => {
    it('renders the manager heading with managerLabel', () => {
        renderSteps(BASE);
        expect(screen.getByRole('heading', { name: 'Fixture Manager' })).toBeInTheDocument();
    });

    it('renders the notes callout when notes is present, omits it when absent', () => {
        const { unmount } = render(
            <ToasterProvider>
                <ManagerSetupSteps entry={{ ...BASE, notes: 'A real caveat.' }} os="macos" category="java" />
            </ToasterProvider>,
        );
        expect(screen.getByText('A real caveat.')).toBeInTheDocument();
        unmount();

        renderSteps(BASE);
        expect(screen.queryByText('A real caveat.')).not.toBeInTheDocument();
    });

    it('renders "Install the package manager" only when !builtIntoOS && installManager is present', () => {
        renderSteps(BASE);
        expect(screen.getByText(/Install the package manager/)).toBeInTheDocument();
    });

    it('omits "Install the package manager" when builtIntoOS is true', () => {
        renderSteps({ ...BASE, builtIntoOS: true });
        expect(screen.queryByText(/Install the package manager/)).not.toBeInTheDocument();
    });

    it('places the repoSetup snippet before the Install snippet in DOM order', () => {
        renderSteps({ ...BASE, repoSetup: 'add-repo --now' });
        const titles = Array.from(document.querySelectorAll('.code-block-title')).map((el) => el.textContent);
        const repoIdx = titles.indexOf('Repository setup (one-time)');
        const installIdx = titles.indexOf('Install');
        expect(repoIdx).toBeGreaterThanOrEqual(0);
        expect(installIdx).toBeGreaterThan(repoIdx);
    });

    it('places the Configure snippet after the Install snippet', () => {
        renderSteps({ ...BASE, configure: 'export FOO=bar' });
        const titles = Array.from(document.querySelectorAll('.code-block-title')).map((el) => el.textContent);
        const installIdx = titles.indexOf('Install');
        const configureIdx = titles.indexOf('Configure');
        expect(configureIdx).toBeGreaterThan(installIdx);
    });

    it('omits the Update & remove step when neither update nor remove is set', () => {
        renderSteps(BASE);
        expect(screen.queryByText(/Update & remove/)).not.toBeInTheDocument();
    });

    it('shows the Update & remove step with both snippets when both are present', () => {
        renderSteps({ ...BASE, update: 'fixture-manager upgrade', remove: 'fixture-manager uninstall' });
        expect(screen.getByText(/Update & remove/)).toBeInTheDocument();
        const titles = Array.from(document.querySelectorAll('.code-block-title')).map((el) => el.textContent);
        expect(titles).toContain('Update');
        expect(titles).toContain('Remove');
    });

    it('renders "Switching versions" only when versionSwitch is present', () => {
        const first = render(
            <ToasterProvider>
                <ManagerSetupSteps entry={BASE} os="macos" category="java" />
            </ToasterProvider>,
        );
        expect(screen.queryByText(/Switching versions/)).not.toBeInTheDocument();
        first.unmount();

        renderSteps({ ...BASE, versionSwitch: 'fixture-manager use 21' });
        expect(screen.getByText(/Switching versions/)).toBeInTheDocument();
    });

    it('every rendered CodeSnippet has both a Copy and a Download button', () => {
        renderSteps({
            ...BASE,
            repoSetup: 'add-repo --now',
            configure: 'export FOO=bar',
            update: 'fixture-manager upgrade',
            remove: 'fixture-manager uninstall',
            versionSwitch: 'fixture-manager use 21',
        });
        const copyButtons = screen.getAllByRole('button', { name: 'Copy' });
        const downloadButtons = screen.getAllByRole('button', { name: /Download/ });
        expect(copyButtons.length).toBeGreaterThan(0);
        expect(copyButtons.length).toBe(downloadButtons.length);
    });

    it('uses powershell language on Windows and bash elsewhere', () => {
        const { unmount } = render(
            <ToasterProvider>
                <ManagerSetupSteps entry={BASE} os="windows" category="java" />
            </ToasterProvider>,
        );
        expect(document.querySelector('code.language-powershell')).not.toBeNull();
        unmount();

        renderSteps(BASE, 'macos');
        expect(document.querySelector('code.language-bash')).not.toBeNull();
    });
});
