import {
    WINDOWS_CHOCO_INSTALL,
    WINDOWS_CHOCO_UPDATE_ALL,
    WINDOWS_CHOCO_VERIFY,
    WINDOWS_SCOOP_INSTALL,
    WINDOWS_SCOOP_UPDATE_ALL,
    WINDOWS_SCOOP_VERIFY,
    WINDOWS_WINGET_UPDATE_ALL,
    WINDOWS_WINGET_UPGRADE_SELF,
    WINDOWS_WINGET_VERIFY,
} from '@/common/windows-utils';
import CodeSnippet from '@/elements/CodeSnippet';
import React, { useState } from 'react';

type Manager = 'winget' | 'chocolatey' | 'scoop';

const MANAGERS: { value: Manager; label: string }[] = [
    { value: 'winget', label: 'winget (built-in)' },
    { value: 'chocolatey', label: 'Chocolatey' },
    { value: 'scoop', label: 'Scoop' },
];

const PackageManagersSection: React.FC = () => {
    const [selected, setSelected] = useState<Manager>('winget');

    return (
        <section className="windows-setup__section">
            <div className="windows-setup__step">
                <h2>1. Choose a package manager</h2>
                <div className="windows-setup__chips">
                    {MANAGERS.map((m) => (
                        <button
                            key={m.value}
                            type="button"
                            className={`chip${selected === m.value ? ' chip-selected' : ''}`}
                            onClick={() => setSelected(m.value)}
                            aria-pressed={selected === m.value}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {selected === 'winget' && (
                <div className="windows-setup__step">
                    <p>
                        <strong>winget</strong> ships with Windows 11 and Windows 10 (1809+) via the App Installer
                        package. No installation required — just verify it works.
                    </p>
                    <CodeSnippet
                        headerText="PowerShell — verify"
                        content={WINDOWS_WINGET_VERIFY}
                        language="powershell"
                    />
                    <p className="windows-setup__hint">
                        If winget is missing or outdated, update App Installer through the Microsoft Store, or run:
                    </p>
                    <CodeSnippet
                        headerText="PowerShell — update App Installer"
                        content={WINDOWS_WINGET_UPGRADE_SELF}
                        language="powershell"
                    />
                    <CodeSnippet
                        headerText="PowerShell — update all packages"
                        content={WINDOWS_WINGET_UPDATE_ALL}
                        language="powershell"
                    />
                </div>
            )}

            {selected === 'chocolatey' && (
                <div className="windows-setup__step">
                    <p>
                        <strong>Chocolatey</strong> requires an <em>admin</em> PowerShell session and .NET Framework
                        4.8+. Opens a new shell after install.
                    </p>
                    <CodeSnippet
                        headerText="PowerShell (admin) — install Chocolatey"
                        content={WINDOWS_CHOCO_INSTALL}
                        language="powershell"
                    />
                    <CodeSnippet
                        headerText="PowerShell — verify"
                        content={WINDOWS_CHOCO_VERIFY}
                        language="powershell"
                    />
                    <CodeSnippet
                        headerText="PowerShell — update all packages"
                        content={WINDOWS_CHOCO_UPDATE_ALL}
                        language="powershell"
                    />
                </div>
            )}

            {selected === 'scoop' && (
                <div className="windows-setup__step">
                    <p>
                        <strong>Scoop</strong> runs as a <em>regular user</em> — no admin required. Installs tools to{' '}
                        <code>~\scoop\</code> and manages its own PATH entries.
                    </p>
                    <CodeSnippet
                        headerText="PowerShell (user) — install Scoop"
                        content={WINDOWS_SCOOP_INSTALL}
                        language="powershell"
                    />
                    <CodeSnippet
                        headerText="PowerShell — verify"
                        content={WINDOWS_SCOOP_VERIFY}
                        language="powershell"
                    />
                    <CodeSnippet
                        headerText="PowerShell — update all packages"
                        content={WINDOWS_SCOOP_UPDATE_ALL}
                        language="powershell"
                    />
                </div>
            )}
        </section>
    );
};

export default React.memo(PackageManagersSection);
