import type { CatalogManager, LinuxDistro } from './apps-catalog-types';

export interface ManagerMaintenanceEntry {
    manager: CatalogManager;
    label: string;
    updateAllCommand?: string;
    listOutdatedCommand?: string;
    cleanupCommand?: string;
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
            updateAllCommand: 'brew update && brew upgrade --greedy',
            listOutdatedCommand: 'brew outdated',
            cleanupCommand: 'brew autoremove && brew cleanup -s',
            notes: '--greedy is required to include casks marked auto_updates/version:latest, otherwise they are silently skipped.',
        },
        {
            manager: 'mas',
            label: 'Mac App Store (mas)',
            updateAllCommand: 'mas upgrade',
            listOutdatedCommand: 'mas outdated',
            notes: 'mas signin does not work on modern macOS — you must already be signed into the App Store GUI.',
        },
    ],
    windows: [
        {
            manager: 'winget',
            label: 'winget',
            updateAllCommand: 'winget upgrade --all --include-unknown',
            listOutdatedCommand: 'winget upgrade',
            notes: 'winget upgrade --all skips apps with requiresExplicitUpgrade set (e.g. VS Code, Edge WebView2) and pinned apps — --include-pinned overrides pinning only, not the explicit-upgrade exclusion.',
        },
        {
            manager: 'choco',
            label: 'Chocolatey',
            updateAllCommand: 'choco upgrade chocolatey -y; choco upgrade all -y',
            listOutdatedCommand: 'choco outdated',
            notes: 'No built-in orphan-cleanup analog to apt autoremove.',
        },
        {
            manager: 'scoop',
            label: 'Scoop',
            updateAllCommand: 'scoop update; scoop update *',
            listOutdatedCommand: 'scoop status',
            cleanupCommand: 'scoop cleanup *; scoop cache rm *',
        },
    ],
    linux: {
        debian: [
            {
                manager: 'apt',
                label: 'apt',
                updateAllCommand: 'sudo apt update && sudo apt full-upgrade -y',
                listOutdatedCommand: 'apt list --upgradable',
                cleanupCommand: 'sudo apt autoremove -y && sudo apt autoclean',
                rebootCheckCommand: '[ -f /var/run/reboot-required ]',
            },
            {
                manager: 'flatpak',
                label: 'Flatpak',
                updateAllCommand: 'flatpak update -y',
                cleanupCommand: 'flatpak uninstall --unused -y',
                notes: 'Cleanup does not always remove old GPU-vendor runtimes — check `flatpak list | grep -i nvidia` manually if disk usage seems off.',
            },
            {
                manager: 'snap',
                label: 'Snap',
                updateAllCommand: 'sudo snap refresh',
                notes: "No single-command cleanup — list disabled revisions with `snap list --all | awk '/disabled/{print $1, $3}'` then remove each manually, or reduce retention with `sudo snap set system refresh.retain=2`.",
            },
        ],
        fedora: [
            {
                manager: 'dnf',
                label: 'dnf',
                updateAllCommand: 'sudo dnf upgrade --refresh -y',
                listOutdatedCommand: 'dnf check-update',
                cleanupCommand: 'sudo dnf autoremove -y && sudo dnf clean all',
                rebootCheckCommand: 'dnf needs-restarting -r',
            },
            {
                manager: 'flatpak',
                label: 'Flatpak',
                updateAllCommand: 'flatpak update -y',
                cleanupCommand: 'flatpak uninstall --unused -y',
                notes: 'Cleanup does not always remove old GPU-vendor runtimes — check `flatpak list | grep -i nvidia` manually if disk usage seems off.',
            },
            {
                manager: 'snap',
                label: 'Snap',
                updateAllCommand: 'sudo snap refresh',
                notes: "No single-command cleanup — list disabled revisions with `snap list --all | awk '/disabled/{print $1, $3}'` then remove each manually, or reduce retention with `sudo snap set system refresh.retain=2`.",
            },
        ],
        arch: [
            {
                manager: 'pacman',
                label: 'pacman',
                updateAllCommand: 'sudo pacman -Syu',
                listOutdatedCommand: 'pacman -Qu',
                cleanupCommand: 'sudo pacman -Rns $(pacman -Qdtq); sudo pacman -Sc',
                notes: 'Never split into pacman -Sy alone — partial upgrades are a known way to break an Arch system; always the full -Syu.',
            },
            {
                manager: 'flatpak',
                label: 'Flatpak',
                updateAllCommand: 'flatpak update -y',
                cleanupCommand: 'flatpak uninstall --unused -y',
                notes: 'Cleanup does not always remove old GPU-vendor runtimes — check `flatpak list | grep -i nvidia` manually if disk usage seems off.',
            },
            {
                manager: 'snap',
                label: 'Snap',
                updateAllCommand: 'sudo snap refresh',
                notes: "No single-command cleanup — list disabled revisions with `snap list --all | awk '/disabled/{print $1, $3}'` then remove each manually, or reduce retention with `sudo snap set system refresh.retain=2`.",
            },
        ],
        suse: [
            {
                manager: 'zypper',
                label: 'zypper',
                updateAllCommand:
                    'if grep -qi tumbleweed /etc/os-release; then sudo zypper dup; else sudo zypper refresh && sudo zypper update; fi',
                listOutdatedCommand: 'zypper list-updates',
                cleanupCommand: 'sudo zypper clean --all && sudo zypper purge-kernels',
                rebootCheckCommand: 'zypper needs-rebooting',
                notes: 'Detects Tumbleweed (rolling) vs Leap (point-release) via /etc/os-release at run time and uses the correct command for each — never runs a split refresh+upgrade on Tumbleweed.',
            },
            {
                manager: 'flatpak',
                label: 'Flatpak',
                updateAllCommand: 'flatpak update -y',
                cleanupCommand: 'flatpak uninstall --unused -y',
                notes: 'Cleanup does not always remove old GPU-vendor runtimes — check `flatpak list | grep -i nvidia` manually if disk usage seems off.',
            },
            {
                manager: 'snap',
                label: 'Snap',
                updateAllCommand: 'sudo snap refresh',
                notes: "No single-command cleanup — list disabled revisions with `snap list --all | awk '/disabled/{print $1, $3}'` then remove each manually, or reduce retention with `sudo snap set system refresh.retain=2`.",
            },
        ],
    },
};
