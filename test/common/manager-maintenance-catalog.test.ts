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

    it('every entry with updateAllCommand has a non-empty label', () => {
        for (const entry of ALL_ENTRIES) {
            if (entry.updateAllCommand) {
                expect(entry.label).toBeTruthy();
            }
        }
    });

    it('openSUSE zypper entry self-detects Tumbleweed vs Leap at run time', () => {
        const entry = MANAGER_MAINTENANCE.linux.suse?.find((e) => e.manager === 'zypper');
        expect(entry?.updateAllCommand).toBeDefined();
        expect(entry!.updateAllCommand!.toLowerCase()).toContain('tumbleweed');
        expect(entry!.updateAllCommand).toContain('dup');
        expect(entry!.updateAllCommand).toContain('refresh');
        expect(entry!.updateAllCommand).toContain('zypper update');
    });

    it('never emits a bare sync-only command for rolling-release distros', () => {
        const arch = MANAGER_MAINTENANCE.linux.arch?.find((e) => e.manager === 'pacman');
        expect(arch?.updateAllCommand).toContain('-Syu');
        expect(arch?.updateAllCommand).not.toBe('sudo pacman -Sy');
    });

    it('has zero appimage entries anywhere in the catalog', () => {
        expect(ALL_ENTRIES.some((e) => e.manager === 'appimage')).toBe(false);
    });
});
