export type LinuxDistro = 'debian' | 'fedora' | 'arch' | 'suse';

// Native package managers — verify
export const LINUX_APT_VERIFY = `apt --version`;
export const LINUX_DNF_VERIFY = `dnf --version`;
export const LINUX_PACMAN_VERIFY = `pacman --version`;
export const LINUX_ZYPPER_VERIFY = `zypper --version`;

// Native package managers — update
export const LINUX_APT_UPDATE = `sudo apt update && sudo apt upgrade -y`;
export const LINUX_DNF_UPDATE = `sudo dnf upgrade --refresh -y`;
export const LINUX_PACMAN_UPDATE = `sudo pacman -Syu`;
export const LINUX_ZYPPER_UPDATE = `sudo zypper refresh && sudo zypper update`;

// Flatpak — install per distro
export const LINUX_FLATPAK_INSTALL_APT = `sudo apt install flatpak`;
export const LINUX_FLATPAK_INSTALL_DNF = `sudo dnf install flatpak`;
export const LINUX_FLATPAK_INSTALL_PACMAN = `sudo pacman -S flatpak`;
export const LINUX_FLATPAK_INSTALL_ZYPPER = `sudo zypper install flatpak`;

// Flatpak — shared steps
export const LINUX_FLATPAK_FLATHUB = `flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo`;
export const LINUX_FLATPAK_VERIFY = `flatpak --version`;

// Snap — install per distro
export const LINUX_SNAP_INSTALL_APT = `sudo apt install snapd`;
export const LINUX_SNAP_INSTALL_DNF =
    `sudo dnf install snapd\n` + `sudo systemctl enable --now snapd.socket\n` + `sudo ln -s /var/lib/snapd/snap /snap`;
export const LINUX_SNAP_INSTALL_PACMAN =
    `# Install via AUR (e.g., with yay or paru)\n` + `yay -S snapd\n` + `sudo systemctl enable --now snapd.socket`;
export const LINUX_SNAP_INSTALL_ZYPPER =
    `sudo zypper addrepo --refresh https://download.opensuse.org/repositories/system:/snappy/openSUSE_Tumbleweed snappy\n` +
    `sudo zypper --gpg-auto-import-keys refresh\n` +
    `sudo zypper dup --from snappy\n` +
    `sudo zypper install snapd`;
export const LINUX_SNAP_VERIFY = `snap --version`;

// Homebrew on Linux — dependencies
export const LINUX_BREW_DEPS_APT = `sudo apt install build-essential procps curl file git`;
export const LINUX_BREW_DEPS_DNF =
    `sudo dnf groupinstall 'Development Tools'\n` + `sudo dnf install procps-ng curl file git`;

// Homebrew on Linux — shared steps
export const LINUX_BREW_INSTALL = `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`;
export const LINUX_BREW_PATH =
    `echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc\n` +
    `eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"`;
export const LINUX_BREW_VERIFY = `brew --version`;

// Environment variables
export const LINUX_ENV_EXPORT_EXAMPLE = `export MY_VAR="value"`;
export const LINUX_ENV_ADD_TO_PATH = `export PATH="$HOME/.local/bin:$PATH"`;
export const LINUX_ENV_JAVA_HOME =
    `export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"\n` + `export PATH="$JAVA_HOME/bin:$PATH"`;
export const LINUX_ENV_RELOAD = `source ~/.bashrc\n` + `# or for zsh:\n` + `source ~/.zshrc`;
