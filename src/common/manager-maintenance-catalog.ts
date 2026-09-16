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
                update: { steps: ['brew update', 'brew upgrade --greedy'] },
                upgrade: { steps: ['brew update', 'brew upgrade --greedy'] },
            },
            listOutdatedCommand: 'brew outdated',
            cleanup: { steps: ['brew autoremove', 'brew cleanup -s'] },
            notes: '--greedy includes casks marked auto_updates or version:latest.',
        },
        {
            manager: 'mas',
            label: 'Mac App Store (mas)',
            operations: { update: { steps: ['mas upgrade'] }, upgrade: { steps: ['mas upgrade'] } },
            listOutdatedCommand: 'mas outdated',
            notes: 'App Store authentication is managed by macOS.',
        },
    ],
    windows: [
        {
            manager: 'winget',
            label: 'winget',
            operations: {
                update: { steps: ['winget upgrade --all --include-unknown --include-pinned'] },
                upgrade: { steps: ['winget upgrade --all --include-unknown --include-pinned'] },
            },
            listOutdatedCommand: 'winget upgrade',
            notes: 'Some packages with requiresExplicitUpgrade remain outside winget bulk upgrades.',
        },
        {
            manager: 'choco',
            label: 'Chocolatey',
            operations: {
                update: { steps: ['choco upgrade chocolatey -y', 'choco upgrade all -y'] },
                upgrade: { steps: ['choco upgrade chocolatey -y', 'choco upgrade all -y'] },
            },
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
    ],
    linux: {
        debian: [
            {
                manager: 'apt',
                label: 'apt',
                operations: {
                    update: { steps: ['sudo apt update', 'sudo apt full-upgrade -y'] },
                    upgrade: { steps: ['sudo apt update', 'sudo apt full-upgrade -y'] },
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
        ],
        fedora: [
            {
                manager: 'dnf',
                label: 'dnf',
                operations: {
                    update: { steps: ['sudo dnf upgrade --refresh -y'] },
                    upgrade: { steps: ['sudo dnf upgrade --refresh -y'] },
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
        ],
        arch: [
            {
                manager: 'pacman',
                label: 'pacman',
                operations: { update: { steps: ['sudo pacman -Syu'] }, upgrade: { steps: ['sudo pacman -Syu'] } },
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
        ],
        suse: [
            {
                manager: 'zypper',
                label: 'zypper',
                operations: {
                    update: {
                        steps: [
                            'if grep -qi tumbleweed /etc/os-release; then sudo zypper dup; else sudo zypper refresh && sudo zypper update; fi',
                        ],
                    },
                    upgrade: {
                        steps: [
                            'if grep -qi tumbleweed /etc/os-release; then sudo zypper dup; else sudo zypper refresh && sudo zypper update; fi',
                        ],
                    },
                },
                listOutdatedCommand: 'zypper list-updates',
                cleanup: { steps: ['sudo zypper clean --all && sudo zypper purge-kernels'] },
                rebootCheckCommand: 'zypper needs-rebooting',
                notes: 'The command detects Tumbleweed versus Leap at runtime.',
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
        ],
    },
};
