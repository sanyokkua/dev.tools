// test/components/page-specific/software-installer/AppBasket.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import type { CatalogManager, CatalogPlatform, LinuxDistro } from '../../../../src/common/apps-catalog-types';
import AppBasket from '../../../../src/components/page-specific/software-installer/AppBasket';

// Base props helper — overrides merged in per test.
function buildProps(
    overrides: Partial<React.ComponentProps<typeof AppBasket>> = {},
): React.ComponentProps<typeof AppBasket> {
    return {
        platform: 'macos' as CatalogPlatform,
        linuxDistro: 'debian' as LinuxDistro,
        selectedManagers: ['brew'] as CatalogManager[],
        prefMode: 'preferred' as const,
        selectedApps: {},
        selectedVersions: {},
        onRemove: jest.fn(),
        onOverride: jest.fn(),
        onVersionSelect: jest.fn(),
        onClear: jest.fn(),
        ...overrides,
    };
}

describe('AppBasket', () => {
    // Test 1: empty basket shows basket-empty element
    it('shows basket-empty when no apps are selected', () => {
        render(<AppBasket {...buildProps({ selectedApps: {} })} />);
        expect(screen.getByTestId('basket-empty')).toBeInTheDocument();
    });

    // Test 2: git via brew on macos → status "Via Homebrew"
    it('shows "Via Homebrew" for git on macos with brew as preferred manager', () => {
        render(
            <AppBasket
                {...buildProps({
                    platform: 'macos',
                    selectedManagers: ['brew'],
                    prefMode: 'preferred',
                    selectedApps: { git: null },
                })}
            />,
        );
        expect(screen.getByText('Via Homebrew')).toBeInTheDocument();
    });

    // Test 3: git on macos with winget preferred and prefMode=fallback → "Fallback: Homebrew"
    // brew is the only macOS manager for git; winget is preferred but unavailable on macOS,
    // so fallbackMode='fallback' causes resolveManager to fall back to brew → isFallback=true
    it('shows "Fallback: Homebrew" for git on macos when winget is preferred but brew is resolved', () => {
        render(
            <AppBasket
                {...buildProps({
                    platform: 'macos',
                    selectedManagers: ['winget'],
                    prefMode: 'fallback',
                    selectedApps: { git: null },
                })}
            />,
        );
        expect(screen.getByText('Fallback: Homebrew')).toBeInTheDocument();
    });

    // Test 4: git on macos with winget preferred and prefMode=preferred → "No preferred manager — skipped"
    // fallbackMode='preferred-only' means resolveManager returns null when preferred manager has no method
    it('shows "No preferred manager — skipped" for git on macos when winget is preferred and fallback is off', () => {
        render(
            <AppBasket
                {...buildProps({
                    platform: 'macos',
                    selectedManagers: ['winget'],
                    prefMode: 'preferred',
                    selectedApps: { git: null },
                })}
            />,
        );
        expect(screen.getByText('No preferred manager — skipped')).toBeInTheDocument();
    });

    // Test 5: clicking the Remove button calls onRemove with the app id
    it('calls onRemove with "git" when the Remove Git button is clicked', () => {
        const onRemove = jest.fn();
        render(
            <AppBasket
                {...buildProps({
                    platform: 'macos',
                    selectedManagers: ['brew'],
                    prefMode: 'preferred',
                    selectedApps: { git: null },
                    onRemove,
                })}
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Remove Git' }));
        expect(onRemove).toHaveBeenCalledWith('git');
    });

    // Test 6: clicking the Clear button calls onClear
    it('calls onClear when the Clear button is clicked', () => {
        const onClear = jest.fn();
        render(
            <AppBasket
                {...buildProps({
                    platform: 'macos',
                    selectedManagers: ['brew'],
                    prefMode: 'preferred',
                    selectedApps: { git: null },
                    onClear,
                })}
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
        expect(onClear).toHaveBeenCalled();
    });
});
