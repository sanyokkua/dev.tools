import type { CatalogManager } from '@/common/apps-catalog-types';
import { MANAGER_MAINTENANCE } from '@/common/manager-maintenance-catalog';

const ALL_ENTRIES = [
    ...MANAGER_MAINTENANCE.macos,
    ...MANAGER_MAINTENANCE.windows,
    ...Object.values(MANAGER_MAINTENANCE.linux).flat(),
];

describe('MANAGER_MAINTENANCE integrity', () => {
    it('includes all 11 managers from the spec', () => {
        const expected: CatalogManager[] = [
            'brew',
            'mas',
            'winget',
            'choco',
            'scoop',
            'apt',
            'dnf',
            'pacman',
            'zypper',
            'flatpak',
            'snap',
        ];
        const actual = new Set(ALL_ENTRIES.map((e) => e.manager));
        for (const manager of expected) {
            expect(actual.has(manager)).toBe(true);
        }
    });

    it('has exactly one entry per manager within each platform/distro array', () => {
        const arrays = [
            MANAGER_MAINTENANCE.macos,
            MANAGER_MAINTENANCE.windows,
            ...Object.values(MANAGER_MAINTENANCE.linux),
        ];
        for (const arr of arrays) {
            const managers = (arr ?? []).map((e) => e.manager);
            expect(new Set(managers).size).toBe(managers.length);
        }
    });

    it('every entry with an update operation has a non-empty label and executable steps', () => {
        for (const entry of ALL_ENTRIES) {
            if (entry.operations.update) {
                expect(entry.label).toBeTruthy();
                expect(entry.operations.update.steps.length).toBeGreaterThan(0);
                expect(entry.operations.update.steps.every((step) => step.trim().length > 0)).toBe(true);
            }
        }
    });

    it('openSUSE zypper entry self-detects Tumbleweed vs Leap at run time', () => {
        const entry = MANAGER_MAINTENANCE.linux.suse?.find((e) => e.manager === 'zypper');
        const command = entry?.operations.update?.steps.join('\n');
        expect(command).toBeDefined();
        expect(command!.toLowerCase()).toContain('tumbleweed');
        expect(command).toContain('dup');
        expect(command).toContain('refresh');
        expect(command).toContain('zypper update');
    });

    it('never emits a bare sync-only command for rolling-release distros', () => {
        const arch = MANAGER_MAINTENANCE.linux.arch?.find((e) => e.manager === 'pacman');
        expect(arch?.operations.update?.steps.join('\n')).toContain('-Syu');
        expect(arch?.operations.update?.steps.join('\n')).not.toBe('sudo pacman -Sy');
    });

    it('uses the requested batch commands for Windows managers', () => {
        expect(MANAGER_MAINTENANCE.windows.find((e) => e.manager === 'winget')?.operations.update?.steps).toEqual([
            'winget upgrade --all --include-unknown --include-pinned',
        ]);
        expect(MANAGER_MAINTENANCE.windows.find((e) => e.manager === 'choco')?.operations.update?.steps).toEqual([
            'choco upgrade chocolatey -y',
            'choco upgrade all -y',
        ]);
        expect(MANAGER_MAINTENANCE.windows.find((e) => e.manager === 'scoop')?.operations.update?.steps).toEqual([
            'scoop update',
            'scoop update *',
        ]);
    });

    it('exposes separate update and upgrade operations for every batch entry', () => {
        for (const entry of ALL_ENTRIES) {
            expect(entry.operations.update?.steps.length).toBeGreaterThan(0);
            expect(entry.operations.upgrade?.steps.length).toBeGreaterThan(0);
        }
    });

    it('has zero appimage entries anywhere in the catalog', () => {
        expect(ALL_ENTRIES.some((e) => e.manager === 'appimage')).toBe(false);
    });
});
