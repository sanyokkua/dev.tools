import type { CatalogManager, LinuxDistro } from './apps-catalog-types';

export type MaintenanceAction = 'update' | 'upgrade';

export interface MaintenanceCommand {
    steps: readonly string[];
}

export interface ManagerMaintenanceEntry {
    manager: CatalogManager;
    label: string;
    operations: Partial<Record<MaintenanceAction, MaintenanceCommand>>;
    cleanup?: MaintenanceCommand;
    listOutdatedCommand?: string;
    rebootCheckCommand?: string;
    notes?: string;
}

// Language/dev managers with a global "everything" command. npm has no forced variant, so Upgrade
// stays per app (`npm install -g <pkg>@latest`); cargo and go have no global command at all.
const DEV_MANAGER_MAINTENANCE: ManagerMaintenanceEntry[] = [
    {
        manager: 'npm',
        label: 'npm (global)',
        operations: { update: { steps: ['npm update -g'] } },
        listOutdatedCommand: 'npm outdated -g',
        notes: 'npm has no global forced upgrade; Upgrade reinstalls each selected npm app at @latest.',
    },
    {
        manager: 'uv',
        label: 'uv tools',
        operations: {
            update: { steps: ['uv tool upgrade --all'] },
            upgrade: { steps: ['uv tool upgrade --all --reinstall'] },
        },
    },
    {
        manager: 'pipx',
        label: 'pipx',
        operations: { update: { steps: ['pipx upgrade-all'] }, upgrade: { steps: ['pipx reinstall-all'] } },
    },
];

export const MANAGER_MAINTENANCE: {
    macos: ManagerMaintenanceEntry[];
    windows: ManagerMaintenanceEntry[];
    linux: Partial<Record<LinuxDistro, ManagerMaintenanceEntry[]>>;
} = {
    macos: [
        {
            manager: 'brew',
            label: 'Homebrew',
            operations: {
                update: { steps: ['brew update', 'brew upgrade'] },
                upgrade: { steps: ['brew update', 'brew upgrade --greedy'] },
            },
            listOutdatedCommand: 'brew outdated',
            cleanup: { steps: ['brew autoremove', 'brew cleanup -s'] },
            notes: 'Upgrade adds --greedy, which includes casks marked auto_updates or version:latest.',
        },
        {
            manager: 'mas',
            label: 'Mac App Store (mas)',
            operations: { update: { steps: ['mas upgrade'] }, upgrade: { steps: ['mas upgrade'] } },
            listOutdatedCommand: 'mas outdated',
            notes: 'App Store authentication is managed by macOS.',
        },
        ...DEV_MANAGER_MAINTENANCE,
    ],
    windows: [
        {
            manager: 'winget',
            label: 'winget',
            operations: {
                update: { steps: ['winget upgrade --all --accept-package-agreements --accept-source-agreements'] },
                upgrade: {
                    steps: [
                        'winget upgrade --all --include-unknown --include-pinned --accept-package-agreements --accept-source-agreements',
                    ],
                },
            },
            listOutdatedCommand: 'winget upgrade',
            notes: 'Upgrade adds --include-unknown and --include-pinned. Some packages with requiresExplicitUpgrade remain outside winget bulk upgrades.',
        },
        {
            manager: 'choco',
            label: 'Chocolatey',
            operations: { update: { steps: ['choco upgrade all -y'] }, upgrade: { steps: ['choco upgrade all -y'] } },
            listOutdatedCommand: 'choco outdated',
            notes: 'Chocolatey has no apt-style orphan cleanup operation.',
        },
        {
            manager: 'scoop',
            label: 'Scoop',
            operations: {
                update: { steps: ['scoop update', 'scoop update *'] },
                upgrade: { steps: ['scoop update', 'scoop update *'] },
            },
            listOutdatedCommand: 'scoop status',
            cleanup: { steps: ['scoop cleanup *', 'scoop cache rm *'] },
        },
        ...DEV_MANAGER_MAINTENANCE,
    ],
    linux: {
        debian: [
            {
                manager: 'apt',
                label: 'apt',
                operations: {
                    update: { steps: ['sudo apt-get update', 'sudo apt-get upgrade -y'] },
                    upgrade: { steps: ['sudo apt-get update', 'sudo apt-get full-upgrade -y'] },
                },
                listOutdatedCommand: 'apt list --upgradable',
                cleanup: { steps: ['sudo apt autoremove -y', 'sudo apt autoclean'] },
                rebootCheckCommand: '[ -f /var/run/reboot-required ]',
            },
            {
                manager: 'flatpak',
                label: 'Flatpak',
                operations: { update: { steps: ['flatpak update -y'] }, upgrade: { steps: ['flatpak update -y'] } },
                cleanup: { steps: ['flatpak uninstall --unused -y'] },
                notes: 'Flatpak cleanup removes unused runtimes and extensions.',
            },
            {
                manager: 'snap',
                label: 'Snap',
                operations: { update: { steps: ['sudo snap refresh'] }, upgrade: { steps: ['sudo snap refresh'] } },
                notes: 'Snap has no general-purpose cleanup operation.',
            },
            ...DEV_MANAGER_MAINTENANCE,
        ],
        fedora: [
            {
                manager: 'dnf',
                label: 'dnf',
                operations: {
                    update: { steps: ['sudo dnf upgrade --refresh -y'] },
                    upgrade: { steps: ['sudo dnf distro-sync --refresh -y'] },
                },
                listOutdatedCommand: 'dnf check-update',
                cleanup: { steps: ['sudo dnf autoremove -y && sudo dnf clean all'] },
                rebootCheckCommand: 'dnf needs-restarting -r',
            },
            {
                manager: 'flatpak',
                label: 'Flatpak',
                operations: { update: { steps: ['flatpak update -y'] }, upgrade: { steps: ['flatpak update -y'] } },
                cleanup: { steps: ['flatpak uninstall --unused -y'] },
                notes: 'Flatpak cleanup removes unused runtimes and extensions.',
            },
            {
                manager: 'snap',
                label: 'Snap',
                operations: { update: { steps: ['sudo snap refresh'] }, upgrade: { steps: ['sudo snap refresh'] } },
                notes: 'Snap has no general-purpose cleanup operation.',
            },
            ...DEV_MANAGER_MAINTENANCE,
        ],
        arch: [
            {
                manager: 'pacman',
                label: 'pacman',
                operations: {
                    update: { steps: ['sudo pacman -Syu --noconfirm'] },
                    upgrade: { steps: ['sudo pacman -Syu --noconfirm'] },
                },
                listOutdatedCommand: 'pacman -Qu',
                cleanup: {
                    steps: [
                        'orphans=$(pacman -Qdtq); if [ -n "$orphans" ]; then sudo pacman -Rns $orphans; fi',
                        'sudo pacman -Sc',
                    ],
                },
                notes: 'The full -Syu operation prevents partial Arch upgrades.',
            },
            {
                manager: 'flatpak',
                label: 'Flatpak',
                operations: { update: { steps: ['flatpak update -y'] }, upgrade: { steps: ['flatpak update -y'] } },
                cleanup: { steps: ['flatpak uninstall --unused -y'] },
                notes: 'Flatpak cleanup removes unused runtimes and extensions.',
            },
            {
                manager: 'snap',
                label: 'Snap',
                operations: { update: { steps: ['sudo snap refresh'] }, upgrade: { steps: ['sudo snap refresh'] } },
                notes: 'Snap has no general-purpose cleanup operation.',
            },
            ...DEV_MANAGER_MAINTENANCE,
        ],
        suse: [
            {
                manager: 'zypper',
                label: 'zypper',
                operations: {
                    update: {
                        steps: [
                            'if grep -qi tumbleweed /etc/os-release; then sudo zypper dup -y; else sudo zypper refresh && sudo zypper update -y; fi',
                        ],
                    },
                    upgrade: { steps: ['sudo zypper refresh && sudo zypper dup -y'] },
                },
                listOutdatedCommand: 'zypper list-updates',
                cleanup: { steps: ['sudo zypper clean --all && sudo zypper purge-kernels'] },
                rebootCheckCommand: 'zypper needs-rebooting',
                notes: 'Update detects Tumbleweed (dup) versus Leap (update) at runtime; Upgrade always runs a distribution upgrade.',
            },
            {
                manager: 'flatpak',
                label: 'Flatpak',
                operations: { update: { steps: ['flatpak update -y'] }, upgrade: { steps: ['flatpak update -y'] } },
                cleanup: { steps: ['flatpak uninstall --unused -y'] },
                notes: 'Flatpak cleanup removes unused runtimes and extensions.',
            },
            {
                manager: 'snap',
                label: 'Snap',
                operations: { update: { steps: ['sudo snap refresh'] }, upgrade: { steps: ['sudo snap refresh'] } },
                notes: 'Snap has no general-purpose cleanup operation.',
            },
            ...DEV_MANAGER_MAINTENANCE,
        ],
    },
};
