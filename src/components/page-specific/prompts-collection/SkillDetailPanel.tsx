import { downloadSkillZip, saveTextFile } from '@/common/file-utils';
import { buildInstallInstructions, type InstallTarget } from '@/common/prompts/data';
import type { Skill, SkillFile, SkillsData } from '@/common/prompts/types';
import { useToast } from '@/contexts/ToasterContext';
import SegmentedControl from '@/controls/SegmentedControl';
import { ToastType } from '@/controls/toaster/types';
import React, { useCallback, useState } from 'react';

interface Props {
    skill: Skill | null;
    skillsData: SkillsData | null;
    onSelectSkill?: (slug: string) => void;
}

const SkillDetailPanel: React.FC<Props> = ({ skill, skillsData, onSelectSkill }) => {
    const { showToast } = useToast();
    const [installTarget, setInstallTarget] = useState<InstallTarget>('claude-code');
    const [zipState, setZipState] = useState<'idle' | 'loading' | 'done'>('idle');
    const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});

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

    const relatedSkills = skill.relatedSkillIds
        .map((id) => skillsData?.skills.find((s) => s.slug === id))
        .filter(Boolean) as Skill[];

    const installInstructions = buildInstallInstructions(skill, installTarget);

    return (
        <div className="pc-detail" role="region" aria-label={skill.title}>
            {/* Header */}
            <div className="pc-detail-header-row">
                <div className="pc-detail-header-main">
                    <h2 className="pc-detail-title">{skill.title}</h2>
                    <div className="pc-detail-breadcrumb">
                        <span className="pc-mono">{skill.id}</span> · v{skill.version}
                    </div>
                </div>
                <span className="pc-tag">🧩 Skill</span>
            </div>

            {/* Description */}
            <div className="pc-detail-section">
                <p className="pc-detail-description">{skill.description}</p>
            </div>

            {/* Required Tools */}
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

            {/* Tags */}
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

            {/* Related Skills */}
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

            {/* Files */}
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

            {/* Install for */}
            <div className="pc-detail-section">
                <h3 className="pc-section-heading">Install for</h3>
                <SegmentedControl
                    options={[
                        { value: 'claude-code', label: 'Claude Code' },
                        { value: 'kiro', label: 'Kiro CLI' },
                        { value: 'other', label: 'Other' },
                    ]}
                    value={installTarget}
                    onChange={(v) => setInstallTarget(v as InstallTarget)}
                    aria-label="Install target"
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
            </div>

            {/* Download .zip */}
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
