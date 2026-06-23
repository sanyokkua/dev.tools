import { downloadSkillZip, saveTextFile } from '@/common/file-utils';
import {
    buildInstallInstructions,
    buildInvokePrompt,
    type InstallScope,
    type InstallTarget,
} from '@/common/prompts/data';
import type { SkillDef, SkillFile } from '@/common/prompts/model/types';
import { useToast } from '@/contexts/ToasterContext';
import Input from '@/controls/Input';
import SegmentedControl from '@/controls/SegmentedControl';
import type { SelectItem } from '@/controls/Select';
import Select from '@/controls/Select';
import { ToastType } from '@/controls/toaster/types';
import React, { useCallback, useEffect, useState } from 'react';

interface Props {
    skill: SkillDef | null;
    relatedSkills?: { slug: string; title: string }[];
    onSelectSkill?: (slug: string) => void;
}

const SkillDetailPanel: React.FC<Props> = ({ skill, relatedSkills = [], onSelectSkill }) => {
    const { showToast } = useToast();
    const [installTarget, setInstallTarget] = useState<InstallTarget>('claude-code');
    const [installScope, setInstallScope] = useState<InstallScope>('project');
    const [zipState, setZipState] = useState<'idle' | 'loading' | 'done'>('idle');
    const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});
    const [invokeTask, setInvokeTask] = useState('');
    const [installCopied, setInstallCopied] = useState(false);
    const [invokeCopied, setInvokeCopied] = useState(false);

    useEffect(() => {
        setCopyStates({});
        setZipState('idle');
        setInstallScope('project');
        setInvokeTask('');
        setInstallCopied(false);
        setInvokeCopied(false);
    }, [skill?.slug]);

    const handleFileCopy = useCallback(
        async (file: SkillFile) => {
            try {
                await navigator.clipboard.writeText(file.content);
                showToast({ message: 'File content copied', type: ToastType.SUCCESS });
                setCopyStates((prev) => ({ ...prev, [file.path]: true }));
                setTimeout(() => setCopyStates((prev) => ({ ...prev, [file.path]: false })), 1500);
            } catch {
                showToast({ message: 'Copy failed', type: ToastType.ERROR });
            }
        },
        [showToast],
    );

    const handleFileDownload = useCallback((file: SkillFile) => {
        const lastDot = file.path.lastIndexOf('.');
        const ext = lastDot >= 0 ? file.path.slice(lastDot) : '.txt';
        const name = lastDot >= 0 ? file.path.slice(0, lastDot) : file.path;
        saveTextFile({ fileName: name, fileContent: file.content, fileExtension: ext });
    }, []);

    const handleZipDownload = useCallback(async () => {
        if (!skill || zipState === 'loading') return;
        setZipState('loading');
        try {
            await downloadSkillZip(skill);
            setZipState('done');
            showToast({ message: `${skill.slug}.zip downloaded`, type: ToastType.SUCCESS });
            setTimeout(() => setZipState('idle'), 2000);
        } catch {
            setZipState('idle');
            showToast({ message: 'Download failed', type: ToastType.ERROR });
        }
    }, [skill, zipState, showToast]);

    if (!skill) {
        return (
            <div className="pc-detail-empty" role="status">
                Select a skill from the list
            </div>
        );
    }

    const installInstructions = buildInstallInstructions(skill, installTarget, installScope);

    return (
        <div className="pc-detail" role="region" aria-label={skill.title}>
            <div className="pc-detail-header-row">
                <div className="pc-detail-header-main">
                    <h2 className="pc-detail-title">{skill.title}</h2>
                    <div className="pc-detail-breadcrumb">
                        <span className="pc-mono">{skill.id}</span> · v{skill.version}
                    </div>
                </div>
                <span className="pc-tag">🧩 Skill</span>
            </div>

            <div className="pc-detail-section">
                <h3 className="pc-section-heading">What it does · when it triggers</h3>
                <p className="pc-detail-description">{skill.description}</p>
            </div>

            {skill.allowedTools.length > 0 && (
                <div className="pc-detail-section">
                    <h3 className="pc-section-heading">Required Tools</h3>
                    <div className="pc-skill-chips">
                        {skill.allowedTools.map((tool) => (
                            <span key={tool} className="pc-tag pc-tag-tool">
                                {tool}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {skill.tags.length > 0 && (
                <div className="pc-detail-section">
                    <h3 className="pc-section-heading">Tags</h3>
                    <div className="pc-skill-chips">
                        {skill.tags.map((tag) => (
                            <span key={tag} className="pc-tag pc-tag-alt">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {relatedSkills.length > 0 && (
                <div className="pc-detail-section">
                    <h3 className="pc-section-heading">Related Skills</h3>
                    <div className="pc-skill-related">
                        {relatedSkills.map((rs) => (
                            <button
                                key={rs.slug}
                                className="pc-skill-related-link"
                                onClick={() => onSelectSkill?.(rs.slug)}
                                type="button"
                            >
                                {rs.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="pc-detail-section">
                <h3 className="pc-section-heading">Files</h3>
                <div className="pc-skill-files">
                    {skill.files.map((file) => (
                        <div key={file.path} className="pc-skill-file-row">
                            <div className="pc-skill-file-info">
                                <span className="pc-mono pc-skill-file-path">{file.path}</span>
                                <span className="pc-tag pc-tag-alt">{file.role}</span>
                            </div>
                            <div className="pc-skill-file-actions">
                                <button
                                    type="button"
                                    className="btn sm"
                                    onClick={() => void handleFileCopy(file)}
                                    aria-label={`Copy ${file.path}`}
                                >
                                    {copyStates[file.path] ? '✓ Copied' : 'Copy'}
                                </button>
                                <button
                                    type="button"
                                    className="btn sm"
                                    onClick={() => handleFileDownload(file)}
                                    aria-label={`Download ${file.path}`}
                                >
                                    Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {skill.scripts && skill.scripts.length > 0 && (
                <div className="pc-detail-section">
                    <h3 className="pc-section-heading">Scripts</h3>
                    <div className="pc-skill-scripts">
                        {skill.scripts.map((s) => (
                            <div key={s.name} className="pc-skill-script-row">
                                <code className="pc-mono">{s.name}</code>
                                <span className="pc-skill-script-purpose">{s.purpose}</span>
                            </div>
                        ))}
                    </div>
                    <p className="pc-skill-scripts-note">
                        Run via interpreter: <code>bash scripts/name.sh</code>, <code>python3 scripts/name.py</code>,{' '}
                        <code>node scripts/name.mjs</code>
                        {' — '}no executable bit required. After zip extraction: <code>chmod +x scripts/*.sh</code>
                    </p>
                </div>
            )}

            <div className="pc-detail-section">
                <h3 className="pc-section-heading">Install for</h3>
                <Select
                    items={[
                        { itemId: 'claude-code', displayText: 'Claude Code' },
                        { itemId: 'github-copilot', displayText: 'GitHub Copilot' },
                        { itemId: 'opencode', displayText: 'OpenCode' },
                        { itemId: 'amazon-kiro', displayText: 'Amazon Kiro' },
                        { itemId: 'openai-codex', displayText: 'OpenAI Codex' },
                        { itemId: 'jetbrains-junie', displayText: 'JetBrains Junie' },
                    ]}
                    selectedItem={installTarget}
                    onSelect={(item: SelectItem) => setInstallTarget(item.itemId as InstallTarget)}
                    aria-label="Install target"
                />
                <SegmentedControl
                    options={[
                        { value: 'project', label: 'Project' },
                        { value: 'user-global', label: 'User-global' },
                    ]}
                    value={installScope}
                    onChange={(v) => setInstallScope(v as InstallScope)}
                    aria-label="Install scope"
                />
                <div className="pc-skill-install">
                    <div className="pc-skill-install-placement">
                        <span className="pc-section-label">Placement:</span>
                        <code>{installInstructions.placement}</code>
                    </div>
                    <div className="pc-skill-install-steps">
                        {installInstructions.steps.map((step, i) => (
                            <code key={i} className="pc-skill-install-cmd">
                                {step}
                            </code>
                        ))}
                    </div>
                    <p className="pc-skill-install-notes">{installInstructions.notes}</p>
                </div>
                <button
                    type="button"
                    className="btn sm"
                    onClick={() =>
                        void navigator.clipboard
                            .writeText(installInstructions.copyablePrompt)
                            .then(() => {
                                setInstallCopied(true);
                                setTimeout(() => setInstallCopied(false), 1500);
                            })
                            .catch(() => showToast({ message: 'Copy failed', type: ToastType.ERROR }))
                    }
                    aria-label="Copy install prompt"
                >
                    {installCopied ? '✓ Copied' : 'Copy install prompt'}
                </button>
            </div>

            <div className="pc-detail-section">
                <h3 className="pc-section-heading">Invoke</h3>
                <Input
                    value={invokeTask}
                    onChange={setInvokeTask}
                    placeholder="Describe the task (optional)"
                    aria-label="Task description"
                    block
                />
                <div className="pc-skill-invoke-prompt">
                    <code>{buildInvokePrompt(skill, invokeTask)}</code>
                    <button
                        type="button"
                        className="btn sm"
                        onClick={() =>
                            void navigator.clipboard
                                .writeText(buildInvokePrompt(skill, invokeTask))
                                .then(() => {
                                    setInvokeCopied(true);
                                    setTimeout(() => setInvokeCopied(false), 1500);
                                })
                                .catch(() => showToast({ message: 'Copy failed', type: ToastType.ERROR }))
                        }
                        aria-label="Copy invoke prompt"
                    >
                        {invokeCopied ? '✓ Copied' : 'Copy'}
                    </button>
                </div>
            </div>

            <div className="pc-skill-zip-section">
                <button
                    type="button"
                    className="btn primary sm"
                    onClick={() => void handleZipDownload()}
                    disabled={zipState === 'loading'}
                >
                    {zipState === 'loading' ? 'Preparing…' : zipState === 'done' ? '✓ Downloaded' : '⬇ Download .zip'}
                </button>
            </div>
        </div>
    );
};

SkillDetailPanel.displayName = 'SkillDetailPanel';
export default SkillDetailPanel;
