import {
    applyVersion,
    type DevEnvCategory,
    type DevEnvManagerBootstrap,
    type DevEnvOS,
} from '@/common/dev-env-catalog';
import { saveTextFile } from '@/common/file-utils';
import CodeSnippet from '@/elements/CodeSnippet';
import React, { useMemo } from 'react';

type Language = 'bash' | 'powershell';

interface StepSnippet {
    header: string;
    content: string;
}

interface StepDef {
    title: string;
    snippets: StepSnippet[];
}

function slug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export function buildSteps(entry: DevEnvManagerBootstrap, version?: string): StepDef[] {
    const sub = (text: string): string => (version ? applyVersion(text, version) : text);
    const steps: StepDef[] = [];

    if (!entry.builtIntoOS && entry.installManager) {
        steps.push({
            title: 'Install the package manager',
            snippets: [{ header: `Install ${entry.managerLabel}`, content: sub(entry.installManager) }],
        });
    }

    const installSnippets: StepSnippet[] = [];
    if (entry.repoSetup) {
        installSnippets.push({ header: 'Repository setup (one-time)', content: sub(entry.repoSetup) });
    }
    installSnippets.push({ header: 'Install', content: sub(entry.installTool) });
    if (entry.configure) {
        installSnippets.push({ header: 'Configure', content: sub(entry.configure) });
    }
    steps.push({ title: 'Install & configure', snippets: installSnippets });

    steps.push({ title: 'Verify', snippets: [{ header: 'Verify', content: sub(entry.verify) }] });

    const updateRemoveSnippets: StepSnippet[] = [];
    if (entry.update) updateRemoveSnippets.push({ header: 'Update', content: sub(entry.update) });
    if (entry.remove) updateRemoveSnippets.push({ header: 'Remove', content: sub(entry.remove) });
    if (updateRemoveSnippets.length > 0) {
        steps.push({ title: 'Update & remove', snippets: updateRemoveSnippets });
    }

    if (entry.versionSwitch) {
        steps.push({
            title: 'Switching versions',
            snippets: [{ header: 'Switch version', content: sub(entry.versionSwitch) }],
        });
    }

    return steps;
}

interface StepProps {
    n: number;
    title: string;
    snippets: StepSnippet[];
    language: Language;
    filePrefix: string;
    fileExtension: string;
    fileMimeType: string;
}

const Step: React.FC<StepProps> = ({ n, title, snippets, language, filePrefix, fileExtension, fileMimeType }) => (
    <div className="card pad dev-env-step-card">
        <div className="steplabel">
            <span className="n">{n}</span> {title}
        </div>
        {snippets.map((s) => (
            <CodeSnippet
                key={s.header}
                headerText={s.header}
                content={s.content}
                language={language}
                onDownload={() =>
                    saveTextFile({
                        fileName: `${filePrefix}-${slug(s.header)}`,
                        fileExtension,
                        fileMimeType,
                        fileContent: s.content,
                    })
                }
            />
        ))}
    </div>
);

interface ManagerSetupStepsProps {
    entry: DevEnvManagerBootstrap;
    os: DevEnvOS;
    category: DevEnvCategory;
    version?: string;
}

const ManagerSetupSteps: React.FC<ManagerSetupStepsProps> = ({ entry, os, category, version }) => {
    const language: Language = os === 'windows' ? 'powershell' : 'bash';
    const fileExtension = os === 'windows' ? '.ps1' : '.sh';
    const fileMimeType = os === 'windows' ? 'text/plain' : 'text/x-shellscript';
    const filePrefix = `${category}-${entry.managerId}`;
    const steps = useMemo(() => buildSteps(entry, version), [entry, version]);

    return (
        <section className="dev-env-manager-group">
            <h3 className="dev-env-manager-heading">{entry.managerLabel}</h3>
            {entry.notes && <p className="dev-env-manager-notes">{entry.notes}</p>}
            {steps.map((s, i) => (
                <Step
                    key={s.title}
                    n={i + 1}
                    title={s.title}
                    snippets={s.snippets}
                    language={language}
                    filePrefix={filePrefix}
                    fileExtension={fileExtension}
                    fileMimeType={fileMimeType}
                />
            ))}
        </section>
    );
};

export default React.memo(ManagerSetupSteps);
