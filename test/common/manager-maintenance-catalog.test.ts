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
            'winget upgrade --all --accept-package-agreements --accept-source-agreements',
        ]);
        expect(MANAGER_MAINTENANCE.windows.find((e) => e.manager === 'choco')?.operations.update?.steps).toEqual([
            'choco upgrade all -y',
        ]);
        expect(MANAGER_MAINTENANCE.windows.find((e) => e.manager === 'scoop')?.operations.update?.steps).toEqual([
            'scoop update',
            'scoop update *',
        ]);
    });

    it('exposes separate update and upgrade operations for every batch entry except npm', () => {
        for (const entry of ALL_ENTRIES) {
            expect(entry.operations.update?.steps.length).toBeGreaterThan(0);
            if (entry.manager === 'npm') {
                // npm has no global forced upgrade; Upgrade is emitted per app instead.
                expect(entry.operations.upgrade).toBeUndefined();
            } else {
                expect(entry.operations.upgrade?.steps.length).toBeGreaterThan(0);
            }
        }
    });

    describe('Update is non-forced and Upgrade is forced/greedy', () => {
        const find = (entries: typeof ALL_ENTRIES | undefined, manager: CatalogManager) =>
            entries?.find((e) => e.manager === manager);
        const steps = (entries: typeof ALL_ENTRIES | undefined, manager: CatalogManager) => ({
            update: find(entries, manager)?.operations.update?.steps.join(' && '),
            upgrade: find(entries, manager)?.operations.upgrade?.steps.join(' && '),
        });

        it.each([
            ['brew', MANAGER_MAINTENANCE.macos, 'brew update && brew upgrade', 'brew update && brew upgrade --greedy'],
            [
                'winget',
                MANAGER_MAINTENANCE.windows,
                'winget upgrade --all --accept-package-agreements --accept-source-agreements',
                'winget upgrade --all --include-unknown --include-pinned --accept-package-agreements --accept-source-agreements',
            ],
            [
                'apt',
                MANAGER_MAINTENANCE.linux.debian,
                'sudo apt-get update && sudo apt-get upgrade -y',
                'sudo apt-get update && sudo apt-get full-upgrade -y',
            ],
            [
                'dnf',
                MANAGER_MAINTENANCE.linux.fedora,
                'sudo dnf upgrade --refresh -y',
                'sudo dnf distro-sync --refresh -y',
            ],
            ['uv', MANAGER_MAINTENANCE.macos, 'uv tool upgrade --all', 'uv tool upgrade --all --reinstall'],
            ['pipx', MANAGER_MAINTENANCE.windows, 'pipx upgrade-all', 'pipx reinstall-all'],
        ] as const)('%s update and upgrade differ', (manager, entries, update, upgrade) => {
            expect(steps(entries, manager)).toEqual({ update, upgrade });
        });

        it('zypper Upgrade is a distribution upgrade while Update keeps the Tumbleweed/Leap detection', () => {
            const { update, upgrade } = steps(MANAGER_MAINTENANCE.linux.suse, 'zypper');
            expect(update).toContain('sudo zypper update -y');
            expect(upgrade).toBe('sudo zypper refresh && sudo zypper dup -y');
        });

        it.each([
            ['choco', MANAGER_MAINTENANCE.windows, 'choco upgrade all -y'],
            ['scoop', MANAGER_MAINTENANCE.windows, 'scoop update && scoop update *'],
            ['pacman', MANAGER_MAINTENANCE.linux.arch, 'sudo pacman -Syu --noconfirm'],
            ['flatpak', MANAGER_MAINTENANCE.linux.debian, 'flatpak update -y'],
            ['snap', MANAGER_MAINTENANCE.linux.debian, 'sudo snap refresh'],
        ] as const)('%s has no forced variant, so update and upgrade are identical', (manager, entries, command) => {
            expect(steps(entries, manager)).toEqual({ update: command, upgrade: command });
        });

        it('offers npm update -g on every platform, with no global upgrade', () => {
            for (const entries of [
                MANAGER_MAINTENANCE.macos,
                MANAGER_MAINTENANCE.windows,
                MANAGER_MAINTENANCE.linux.arch,
            ]) {
                expect(steps(entries, 'npm')).toEqual({ update: 'npm update -g', upgrade: undefined });
            }
        });
    });

    it('has zero appimage entries anywhere in the catalog', () => {
        expect(ALL_ENTRIES.some((e) => e.manager === 'appimage')).toBe(false);
    });
});
