import {
    LINUX_APT_UPDATE,
    LINUX_APT_VERIFY,
    LINUX_BREW_DEPS_APT,
    LINUX_BREW_DEPS_DNF,
    LINUX_BREW_INSTALL,
    LINUX_BREW_PATH,
    LINUX_BREW_VERIFY,
    LINUX_DNF_UPDATE,
    LINUX_DNF_VERIFY,
    LINUX_FLATPAK_FLATHUB,
    LINUX_FLATPAK_INSTALL_APT,
    LINUX_FLATPAK_INSTALL_DNF,
    LINUX_FLATPAK_INSTALL_PACMAN,
    LINUX_FLATPAK_INSTALL_ZYPPER,
    LINUX_FLATPAK_VERIFY,
    LINUX_PACMAN_UPDATE,
    LINUX_PACMAN_VERIFY,
    LINUX_SNAP_INSTALL_APT,
    LINUX_SNAP_INSTALL_DNF,
    LINUX_SNAP_INSTALL_PACMAN,
    LINUX_SNAP_INSTALL_ZYPPER,
    LINUX_SNAP_VERIFY,
    LINUX_ZYPPER_UPDATE,
    LINUX_ZYPPER_VERIFY,
    LinuxDistro,
} from '@/common/linux-utils';
import CodeSnippet from '@/elements/CodeSnippet';
import React from 'react';

interface Props {
    distro: LinuxDistro;
}

const NATIVE_MANAGER: Record<LinuxDistro, { name: string; verify: string; update: string }> = {
    debian: { name: 'apt', verify: LINUX_APT_VERIFY, update: LINUX_APT_UPDATE },
    fedora: { name: 'dnf', verify: LINUX_DNF_VERIFY, update: LINUX_DNF_UPDATE },
    arch: { name: 'pacman', verify: LINUX_PACMAN_VERIFY, update: LINUX_PACMAN_UPDATE },
    suse: { name: 'zypper', verify: LINUX_ZYPPER_VERIFY, update: LINUX_ZYPPER_UPDATE },
};

const FLATPAK_INSTALL: Record<LinuxDistro, string> = {
    debian: LINUX_FLATPAK_INSTALL_APT,
    fedora: LINUX_FLATPAK_INSTALL_DNF,
    arch: LINUX_FLATPAK_INSTALL_PACMAN,
    suse: LINUX_FLATPAK_INSTALL_ZYPPER,
};

const SNAP_INSTALL: Record<LinuxDistro, string> = {
    debian: LINUX_SNAP_INSTALL_APT,
    fedora: LINUX_SNAP_INSTALL_DNF,
    arch: LINUX_SNAP_INSTALL_PACMAN,
    suse: LINUX_SNAP_INSTALL_ZYPPER,
};

const SNAP_HINT: Record<LinuxDistro, string | null> = {
    debian: null,
    fedora: null,
    arch: 'Snap is not in the official Arch repos. Install via the AUR using yay, paru, or another AUR helper.',
    suse: 'Snap requires adding the openSUSE Snappy extra repository before installing.',
};

const BREW_DEPS: Record<LinuxDistro, string> = {
    debian: LINUX_BREW_DEPS_APT,
    fedora: LINUX_BREW_DEPS_DNF,
    arch: '# Arch ships base-devel; install remaining deps:\nsudo pacman -S base-devel curl file git',
    suse: 'sudo zypper install gcc make curl file git',
};

const PackageManagersSection: React.FC<Props> = ({ distro }) => {
    const native = NATIVE_MANAGER[distro];
    const snapHint = SNAP_HINT[distro];

    return (
        <section className="linux-setup__section">
            <div className="linux-setup__step">
                <h2>1. Native package manager ({native.name})</h2>
                <p>Verify and update all packages with the distro&apos;s built-in manager.</p>
                <CodeSnippet headerText={`bash — verify ${native.name}`} content={native.verify} language="bash" />
                <CodeSnippet headerText={`bash — update & upgrade`} content={native.update} language="bash" />
            </div>

            <div className="linux-setup__step">
                <h2>2. Flatpak</h2>
                <p>
                    <strong>Flatpak</strong> provides sandboxed applications from Flathub and other remotes — works
                    across all major distros.
                </p>
                <CodeSnippet headerText="bash — install Flatpak" content={FLATPAK_INSTALL[distro]} language="bash" />
                <CodeSnippet headerText="bash — add Flathub remote" content={LINUX_FLATPAK_FLATHUB} language="bash" />
                <CodeSnippet headerText="bash — verify" content={LINUX_FLATPAK_VERIFY} language="bash" />
            </div>

            <div className="linux-setup__step">
                <h2>3. Snap</h2>
                {snapHint && <p className="linux-setup__hint">{snapHint}</p>}
                <p>
                    <strong>Snap</strong> packages from Canonical run in a confined environment and auto-update.
                </p>
                <CodeSnippet headerText="bash — install Snap" content={SNAP_INSTALL[distro]} language="bash" />
                <CodeSnippet headerText="bash — verify" content={LINUX_SNAP_VERIFY} language="bash" />
            </div>

            <div className="linux-setup__step">
                <h2>4. Homebrew on Linux</h2>
                <p>
                    <strong>Homebrew</strong> runs on Linux and gives access to thousands of formulae not packaged for
                    your distro. Installs to <code>/home/linuxbrew/.linuxbrew/</code>.
                </p>
                <CodeSnippet
                    headerText="bash — install build dependencies"
                    content={BREW_DEPS[distro]}
                    language="bash"
                />
                <CodeSnippet headerText="bash — install Homebrew" content={LINUX_BREW_INSTALL} language="bash" />
                <CodeSnippet
                    headerText="bash — add to PATH (add to ~/.bashrc or ~/.zshrc)"
                    content={LINUX_BREW_PATH}
                    language="bash"
                />
                <CodeSnippet headerText="bash — verify" content={LINUX_BREW_VERIFY} language="bash" />
            </div>
        </section>
    );
};

export default React.memo(PackageManagersSection);
