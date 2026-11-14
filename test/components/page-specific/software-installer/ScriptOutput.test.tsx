// test/components/page-specific/software-installer/ScriptOutput.test.tsx
import { fireEvent, render, screen, within } from '@testing-library/react';
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
        updateScope: 'selected-apps',
        onUpdateScopeChange: jest.fn(),
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
                updateScope="selected-apps"
                onUpdateScopeChange={jest.fn()}
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

    // Test 5: Scope selector renders per-app/combined options; global maintenance has its own strategy control.
    it('renders the two selected-app scope buttons', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} />);
        expect(screen.getByRole('button', { name: 'Single combined' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'One per app' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'System-wide maintenance' })).not.toBeInTheDocument();
    });

    // Test 6: Switching scope to "One per app" shows per-app structure
    it('shows output-per-app div after clicking "One per app"', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} />);

        fireEvent.click(screen.getByRole('button', { name: 'One per app' }));

        expect(screen.getByTestId('output-per-app')).toBeInTheDocument();
    });

    // ─── Task 4: Update-scope control visibility ───────────────────────────────

    it('hides the Update scope control for Install and Remove actions', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} />);
        expect(screen.queryByRole('group', { name: 'Update scope' })).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
        expect(screen.queryByRole('group', { name: 'Update scope' })).not.toBeInTheDocument();
    });

    it('shows the Update scope control for Update and Upgrade actions', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        expect(screen.getByRole('group', { name: 'Update scope' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Upgrade' }));
        expect(screen.getByRole('group', { name: 'Update scope' })).toBeInTheDocument();
    });

    it('hides selected-app scope controls when Batch maintenance is selected', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} updateScope="batch" />);
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        expect(screen.queryByRole('group', { name: 'Script scope' })).not.toBeInTheDocument();
        expect(screen.getByRole('group', { name: 'Batch maintenance managers' })).toBeInTheDocument();
    });

    // ─── Task 4: Batch maintenance strategy ────────────────────────────────────

    it('shows the empty state and no code block when Batch maintenance has no apps or managers picked', () => {
        renderWithToaster(
            <ScriptOutput
                {...gitOnMacosProps()}
                selectedApps={{}}
                selectedManagers={[]}
                prefMode="preferred"
                updateScope="batch"
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        const mgrGroup = screen.getByRole('group', { name: 'Batch maintenance managers' });
        fireEvent.click(within(mgrGroup).getByText('Homebrew'));

        expect(screen.getByTestId('output-empty')).toBeInTheDocument();
        expect(screen.queryByTestId('output-code')).not.toBeInTheDocument();
    });

    it('produces a batch script after selecting the Batch maintenance strategy', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} updateScope="batch" />);
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));

        const mgrGroup = screen.getByRole('group', { name: 'Batch maintenance managers' });
        expect(within(mgrGroup).getByText('Homebrew').closest('button')).toHaveAttribute('aria-pressed', 'true');

        const outputCode = screen.getByTestId('output-code');
        expect(outputCode.textContent).toContain('batch maintenance');
        expect(outputCode.textContent).toContain('brew update && brew upgrade\n');
        expect(screen.getByTestId('batch-maintenance-warning')).toHaveTextContent(
            'updates software outside the selected app basket',
        );
    });

    it('does not show Batch maintenance for Install', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} />);
        expect(screen.queryByRole('button', { name: 'Batch maintenance' })).not.toBeInTheDocument();
    });

    // ─── Task 4: batch update scope ────────────────────────────────────────────

    it('uses batch maintenance when updateScope is batch', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} updateScope="batch" />);
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));

        const outputCode = screen.getByTestId('output-code');
        expect(outputCode.textContent).toContain('batch maintenance');
        expect(outputCode.textContent).toContain('brew update && brew upgrade\n');
        expect(outputCode.textContent).not.toContain('brew upgrade git');
    });

    it('shows the cleanup checkbox whenever batch generation is possible', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} updateScope="batch" />);
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        expect(screen.getByRole('checkbox', { name: 'Include cleanup commands' })).toBeInTheDocument();
    });

    // ─── Task 4: edge-case visibility (winget limitation, rolling-release rule) ─

    it('surfaces the winget requiresExplicitUpgrade limitation in the DOM for Windows batch output', () => {
        renderWithToaster(
            <ScriptOutput
                {...gitOnMacosProps()}
                platform="windows"
                selectedManagers={['winget']}
                updateScope="batch"
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));

        expect(screen.getByText(/requiresExplicitUpgrade/)).toBeInTheDocument();
    });

    it('surfaces the openSUSE rolling-release guard in the DOM for Batch maintenance', () => {
        renderWithToaster(
            <ScriptOutput
                {...gitOnMacosProps()}
                platform="linux"
                linuxDistro="suse"
                selectedManagers={[]}
                updateScope="batch"
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));

        const mgrGroup = screen.getByRole('group', { name: 'Batch maintenance managers' });
        expect(within(mgrGroup).getByText('zypper').closest('button')).toHaveAttribute('aria-pressed', 'true');

        const text = screen.getByTestId('output-code').textContent ?? '';
        expect(text).toContain('tumbleweed');
        expect(text).toContain('zypper dup');
    });
});

describe('ScriptOutput — combine per package manager', () => {
    const twoFormulae = (): React.ComponentProps<typeof ScriptOutput> => ({
        ...gitOnMacosProps(),
        selectedApps: { git: null, jq: null },
    });
    const combineBox = () => screen.getByRole('checkbox', { name: 'Combine commands per package manager' });

    it('shows the combine toggle on by default and merges brew formulae into one command', () => {
        renderWithToaster(<ScriptOutput {...twoFormulae()} />);
        expect(combineBox()).toBeChecked();
        expect(screen.getByTestId('output-code').textContent).toContain('brew install git jq');
    });

    it('emits one command per app when the toggle is off', () => {
        renderWithToaster(<ScriptOutput {...twoFormulae()} />);
        fireEvent.click(combineBox());

        const text = screen.getByTestId('output-code').textContent ?? '';
        expect(text).not.toContain('brew install git jq');
        expect(text).toContain('run_task "install Git (brew)" _task_1');
        expect(text).toContain('run_task "install jq (brew)" _task_2');
    });

    it('offers the toggle for Install, Remove and "Selected apps only" updates, not for Batch maintenance', () => {
        const { rerender } = renderWithToaster(<ScriptOutput {...twoFormulae()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
        expect(combineBox()).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        expect(combineBox()).toBeInTheDocument();
        expect(screen.getByTestId('output-code').textContent).toContain('brew update && brew upgrade git jq');

        rerender(
            <ToasterProvider>
                <ScriptOutput {...twoFormulae()} updateScope="batch" />
            </ToasterProvider>,
        );
        expect(screen.queryByRole('checkbox', { name: 'Combine commands per package manager' })).toBeNull();
    });

    it('shows the cleanup checkbox for "Selected apps only" and appends cleanup when ticked', () => {
        renderWithToaster(<ScriptOutput {...twoFormulae()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));

        const cleanup = screen.getByRole('checkbox', { name: 'Include cleanup commands' });
        expect(screen.getByTestId('output-code').textContent).toContain('brew autoremove && brew cleanup -s');
        fireEvent.click(cleanup);
        expect(screen.getByTestId('output-code').textContent).not.toContain('brew autoremove');
    });

    it('keeps the batch-manager selection when switching from Update to Upgrade', () => {
        renderWithToaster(<ScriptOutput {...gitOnMacosProps()} updateScope="batch" />);
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        const homebrew = () =>
            within(screen.getByRole('group', { name: 'Batch maintenance managers' }))
                .getByText('Homebrew')
                .closest('button');
        fireEvent.click(homebrew()!);
        expect(homebrew()).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(screen.getByRole('button', { name: 'Upgrade' }));
        expect(homebrew()).toHaveAttribute('aria-pressed', 'false');
        expect(screen.getByTestId('output-code').textContent).not.toContain('brew upgrade --greedy');
    });

    it('ignores per-app method overrides in Batch maintenance, as the basket says', () => {
        const props: React.ComponentProps<typeof ScriptOutput> = {
            ...gitOnMacosProps(),
            selectedManagers: ['brew', 'npm'],
            selectedApps: { bun: 'npm' },
        };
        const { rerender } = renderWithToaster(<ScriptOutput {...props} />);
        fireEvent.click(screen.getByRole('button', { name: 'Upgrade' }));
        expect(screen.getByTestId('output-code').textContent).toContain('npm install -g bun@latest');

        rerender(
            <ToasterProvider>
                <ScriptOutput {...props} updateScope="batch" />
            </ToasterProvider>,
        );
        // Without the override bun resolves to brew, which the Homebrew batch already covers.
        const text = screen.getByTestId('output-code').textContent ?? '';
        expect(text).toContain('brew update && brew upgrade --greedy');
        expect(text).not.toContain('bun@latest');
    });
});
