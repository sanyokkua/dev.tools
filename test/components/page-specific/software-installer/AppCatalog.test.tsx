// test/components/page-specific/software-installer/AppCatalog.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import type { CatalogApp } from '../../../../src/common/apps-catalog-types';
import AppCatalog from '../../../../src/components/page-specific/software-installer/AppCatalog';

// Minimal helper to render AppCatalog with overridable props.
// Default platform is 'macos', no apps selected, no managers selected.
function renderCatalog(overrides: Partial<React.ComponentProps<typeof AppCatalog>> = {}) {
    const onBulkAdd = jest.fn();
    const onToggle = jest.fn();

    const props: React.ComponentProps<typeof AppCatalog> = {
        platform: 'macos',
        selectedAppIds: new Set<string>(),
        onToggle,
        selectedManagers: [],
        linuxDistro: 'debian',
        onBulkAdd,
        ...overrides,
    };

    render(<AppCatalog {...props} />);

    return { onBulkAdd, onToggle };
}

describe('AppCatalog — bulk-add buttons', () => {
    it('renders the "Add All Visible" and "Add Supported" buttons', () => {
        renderCatalog();
        expect(screen.getByRole('button', { name: 'Add All Visible' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Supported' })).toBeInTheDocument();
    });

    describe('"Add All Visible" button', () => {
        it('calls onBulkAdd with apps available on the current platform', () => {
            const { onBulkAdd } = renderCatalog({ platform: 'macos' });

            // Search for "iterm" — matches only iTerm2 (macOS-only app).
            fireEvent.change(screen.getByPlaceholderText('Search apps…'), { target: { value: 'iterm' } });

            fireEvent.click(screen.getByRole('button', { name: 'Add All Visible' }));

            expect(onBulkAdd).toHaveBeenCalledTimes(1);
            const called: CatalogApp[] = onBulkAdd.mock.calls[0][0];

            // iTerm2 is available on macOS — it must appear.
            expect(called.length).toBeGreaterThan(0);
            // Every returned app must be available on macOS.
            called.forEach((app) => {
                expect(app.platforms.macos).toBe(true);
            });
        });

        it('skips apps that are already selected', () => {
            // Pre-select iTerm2 by id. "iterm" search returns only iTerm2.
            const iterm2Id = 'iterm2';
            const { onBulkAdd } = renderCatalog({ platform: 'macos', selectedAppIds: new Set([iterm2Id]) });

            fireEvent.change(screen.getByPlaceholderText('Search apps…'), { target: { value: 'iterm' } });

            fireEvent.click(screen.getByRole('button', { name: 'Add All Visible' }));

            expect(onBulkAdd).toHaveBeenCalledTimes(1);
            const called: CatalogApp[] = onBulkAdd.mock.calls[0][0];

            // iTerm2 is already selected so it must NOT appear in the bulk-add list.
            expect(called.map((a) => a.id)).not.toContain(iterm2Id);
        });

        it('calls onBulkAdd with empty array when all visible apps are already selected', () => {
            // "iterm" uniquely matches only iTerm2; pre-select it so the filtered set is fully selected.
            const iterm2Id = 'iterm2';
            const { onBulkAdd } = renderCatalog({ platform: 'macos', selectedAppIds: new Set([iterm2Id]) });

            fireEvent.change(screen.getByPlaceholderText('Search apps…'), { target: { value: 'iterm' } });

            fireEvent.click(screen.getByRole('button', { name: 'Add All Visible' }));

            expect(onBulkAdd).toHaveBeenCalledWith([]);
        });
    });

    describe('"Add Supported" button', () => {
        it('calls onBulkAdd only with apps whose managers match selectedManagers', () => {
            // Homebrew ('brew') is a macOS manager. iTerm2 supports brew.
            // "iterm" search returns only iTerm2, so the result set is predictable.
            const { onBulkAdd } = renderCatalog({ platform: 'macos', selectedManagers: ['brew'] });

            fireEvent.change(screen.getByPlaceholderText('Search apps…'), { target: { value: 'iterm' } });

            fireEvent.click(screen.getByRole('button', { name: 'Add Supported' }));

            expect(onBulkAdd).toHaveBeenCalledTimes(1);
            const called: CatalogApp[] = onBulkAdd.mock.calls[0][0];

            // iTerm2 must appear — it has a brew method on macOS.
            expect(called.some((a) => a.id === 'iterm2')).toBe(true);
        });

        it('calls onBulkAdd with empty array when no managers are selected', () => {
            // With no selectedManagers, .some(...) is always false → empty result.
            const { onBulkAdd } = renderCatalog({ platform: 'macos', selectedManagers: [] });

            fireEvent.change(screen.getByPlaceholderText('Search apps…'), { target: { value: 'iterm' } });

            fireEvent.click(screen.getByRole('button', { name: 'Add Supported' }));

            expect(onBulkAdd).toHaveBeenCalledWith([]);
        });

        it('skips apps that are already selected even when their managers match', () => {
            const iterm2Id = 'iterm2';
            const { onBulkAdd } = renderCatalog({
                platform: 'macos',
                selectedManagers: ['brew'],
                selectedAppIds: new Set([iterm2Id]),
            });

            fireEvent.change(screen.getByPlaceholderText('Search apps…'), { target: { value: 'iterm' } });

            fireEvent.click(screen.getByRole('button', { name: 'Add Supported' }));

            expect(onBulkAdd).toHaveBeenCalledTimes(1);
            const called: CatalogApp[] = onBulkAdd.mock.calls[0][0];

            // iTerm2 is already selected → must not appear.
            expect(called.map((a) => a.id)).not.toContain(iterm2Id);
        });

        it('returns an empty array when no visible app matches the selected manager', () => {
            // Use 'apt' (Linux-only) as the manager while platform is 'macos':
            // getAvailableManagers returns [] for macOS apps, so .some() is false.
            const { onBulkAdd } = renderCatalog({ platform: 'macos', selectedManagers: ['apt'] });

            fireEvent.change(screen.getByPlaceholderText('Search apps…'), { target: { value: 'iterm' } });

            fireEvent.click(screen.getByRole('button', { name: 'Add Supported' }));

            expect(onBulkAdd).toHaveBeenCalledWith([]);
        });
    });

    describe('row click unavailability guard', () => {
        it('clicking the row for a platform-available app calls onToggle', () => {
            // iTerm2 is available on macOS.
            const { onToggle } = renderCatalog({ platform: 'macos' });

            fireEvent.change(screen.getByPlaceholderText('Search apps…'), { target: { value: 'iterm' } });

            const checkbox = screen.getByLabelText('Select iTerm2');
            const row = checkbox.closest('tr')!;
            expect(row).not.toHaveClass('installer-catalog-row--unavailable');

            fireEvent.click(row);

            // onToggle should be called for the available app.
            expect(onToggle).toHaveBeenCalledTimes(1);
            expect(onToggle.mock.calls[0][0].id).toBe('iterm2');
        });

        it('clicking a row for a platform-unavailable app does not call onToggle', () => {
            // iTerm2 is macOS-only; when platform is 'windows' it is unavailable.
            const { onToggle } = renderCatalog({ platform: 'windows' });

            // Narrow to iTerm2.
            fireEvent.change(screen.getByPlaceholderText('Search apps…'), { target: { value: 'iterm' } });

            // Find the row for iTerm2 (unavailable on windows) and click it.
            const checkbox = screen.getByLabelText('Select iTerm2');
            const row = checkbox.closest('tr')!;
            expect(row).toHaveClass('installer-catalog-row--unavailable');

            fireEvent.click(row);

            // The early-return guard must prevent onToggle from being called.
            expect(onToggle).not.toHaveBeenCalled();
        });
    });
});
