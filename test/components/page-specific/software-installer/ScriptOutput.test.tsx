// test/components/page-specific/software-installer/ScriptOutput.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ToasterProvider } from '../../../../src/components/contexts/ToasterContext';
import ScriptOutput from '../../../../src/components/page-specific/software-installer/ScriptOutput';

// All renders go through ToasterProvider because ScriptOutput → CodeSnippet → useToast.
function renderWithToaster(ui: React.ReactElement) {
    return render(<ToasterProvider>{ui}</ToasterProvider>);
}

// Default git-on-macos props used by most tests.
function gitOnMacosProps(): React.ComponentProps<typeof ScriptOutput> {
    return {
        platform: 'macos',
        linuxDistro: 'debian',
        selectedManagers: ['brew'],
        prefMode: 'fallback',
        selectedApps: { git: null },
        selectedVersions: {},
    };
}

describe('ScriptOutput', () => {
    // Test 1: Empty state
    it('shows output-empty when no apps are selected', () => {
        renderWithToaster(
            <ScriptOutput
                platform="macos"
                linuxDistro="debian"
                selectedManagers={[]}
                prefMode="preferred"
                selectedApps={{}}
                selectedVersions={{}}
            />,
        );
        expect(screen.getByTestId('output-empty')).toBeInTheDocument();
    });

    // Test 2: One selected app → generates install script
    it('shows output-code and brew install git when git is selected on macos with brew', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} />);
        const outputCode = screen.getByTestId('output-code');
        expect(outputCode).toBeInTheDocument();
        expect(outputCode.textContent).toContain('brew install git');
    });

    // Test 3: Action selector renders all 4 options
    it('renders all 4 action buttons (Install, Update, Upgrade, Remove)', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} />);
        expect(screen.getByRole('button', { name: 'Install' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });

    // Test 4: Switching action to "Update" changes the script
    it('switches to brew upgrade git after clicking Update', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} />);

        // Default action is install — confirm baseline.
        const outputCode = screen.getByTestId('output-code');
        expect(outputCode.textContent).toContain('brew install git');

        // Click the Update button.
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));

        // After switching to Update the catalog command is "brew upgrade git".
        expect(outputCode.textContent).toContain('brew upgrade git');
    });

    // Test 5: Scope selector renders both options
    it('renders both scope buttons (Single combined and One per app)', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} />);
        expect(screen.getByRole('button', { name: 'Single combined' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'One per app' })).toBeInTheDocument();
    });

    // Test 6: Switching scope to "One per app" shows per-app structure
    it('shows output-per-app div after clicking "One per app"', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} />);

        fireEvent.click(screen.getByRole('button', { name: 'One per app' }));

        expect(screen.getByTestId('output-per-app')).toBeInTheDocument();
    });
});
