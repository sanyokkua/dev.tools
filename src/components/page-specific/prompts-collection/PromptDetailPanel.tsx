import { buildSysPromptHref, replaceParams } from '@/common/prompts/data';
import type { Category, Domain, LogicalPrompt, PromptVariant } from '@/common/prompts/types';
import { useToast } from '@/contexts/ToasterContext';
import EditableCombobox from '@/controls/EditableCombobox';
import { ToastType } from '@/controls/toaster/types';
import React, { useCallback, useEffect, useState } from 'react';

interface Props {
    logical: LogicalPrompt | null;
    variant: PromptVariant | null;
    domain: Domain | null;
    category: Category | null;
}

const META_CODES = new Set(['D01', 'D02', 'D03', 'D05', 'D06']);

const PromptDetailPanel: React.FC<Props> = ({ variant, domain, category }) => {
    const { showToast } = useToast();
    const [paramValues, setParamValues] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!variant) {
            setParamValues({});
            return;
        }
        const init: Record<string, string> = {};
        for (const p of variant.parameters) init[p.name] = '';
        setParamValues(init);
    }, [variant]);

    const filledText = variant ? replaceParams(variant.template, paramValues) : '';

    const handleCopy = useCallback(
        async (text: string, label: string) => {
            try {
                await navigator.clipboard.writeText(text);
                showToast({ message: `${label} copied!`, type: ToastType.SUCCESS });
            } catch {
                showToast({ message: 'Copy failed', type: ToastType.ERROR });
            }
        },
        [showToast],
    );

    const handleReset = useCallback(() => {
        if (!variant) return;
        const empty: Record<string, string> = {};
        for (const p of variant.parameters) empty[p.name] = '';
        setParamValues(empty);
    }, [variant]);

    if (!variant) {
        return (
            <div className="pc-detail-empty" role="status">
                Select a prompt from the list
            </div>
        );
    }

    const isMeta = variant.isMetaPrompt ?? META_CODES.has(variant.categoryCode);
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    const sysId = variant.recommendedSystemPromptId;
    const sysHref =
        sysId && domain && category ? buildSysPromptHref(sysId, domain.slug, category.slug, basePath) : null;
    const sysFullUrl = sysHref && typeof window !== 'undefined' ? window.location.origin + sysHref : sysHref;

    return (
        <div className="pc-detail">
            {/* S1 Header */}
            <div className="pc-detail-header-row">
                <div>
                    <h2 className="pc-detail-title">{variant.title}</h2>
                    <div className="pc-detail-breadcrumb">
                        {domain?.title} › {category?.title} · <span className="pc-mono">{variant.id}</span>
                    </div>
                </div>
                <div className="pc-detail-badges">
                    <span className={`pc-tag${variant.executionContext === 'agent' ? ' pc-tag-alt' : ''}`}>
                        {variant.executionContext === 'agent' ? 'agent' : 'chat'}
                    </span>
                    {isMeta && <span className="pc-tag pc-tag-meta">META</span>}
                </div>
            </div>

            {/* S2 Description */}
            {variant.description && (
                <section aria-label="Description">
                    <p className="pc-detail-description">{variant.description}</p>
                </section>
            )}

            {/* S3 Parameters — filled before copying */}
            {variant.parameters.length > 0 && (
                <section className="pc-detail-section" aria-label="Parameters">
                    <h3 className="pc-section-heading">Parameters</h3>
                    <div className="pc-param-list">
                        {variant.parameters.map((param) => (
                            <div key={param.name} className="pc-param-row">
                                <label className="pc-param-label" htmlFor={`param-${param.name}`}>
                                    <span className="pc-mono">{param.name}</span>
                                    {param.optional && <span className="pc-param-optional">(optional)</span>}
                                </label>
                                {param.description && <p className="pc-param-help">{param.description}</p>}
                                {param.suggestedValues && param.suggestedValues.length > 0 ? (
                                    <EditableCombobox
                                        id={`param-${param.name}`}
                                        value={paramValues[param.name] ?? ''}
                                        onChange={(val) => setParamValues((prev) => ({ ...prev, [param.name]: val }))}
                                        options={param.suggestedValues}
                                        allowCustom={param.allowCustom ?? false}
                                        placeholder={param.optional ? 'Leave blank to omit…' : undefined}
                                        aria-label={param.name}
                                    />
                                ) : (
                                    <input
                                        id={`param-${param.name}`}
                                        className="pc-param-input"
                                        value={paramValues[param.name] ?? ''}
                                        onChange={(e) =>
                                            setParamValues((prev) => ({ ...prev, [param.name]: e.target.value }))
                                        }
                                        placeholder={param.optional ? 'Leave blank to omit…' : undefined}
                                        aria-label={param.name}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* S4 Prompt template preview */}
            <section className="pc-detail-section" aria-label="Prompt">
                <h3 className="pc-section-heading">Prompt</h3>
                <pre className="pc-prompt-preview">{filledText}</pre>
            </section>

            {/* Actions */}
            <section className="pc-detail-actions" aria-label="Actions">
                <button className="pc-btn pc-btn-primary" onClick={() => void handleCopy(filledText, 'Prompt')}>
                    Copy prompt
                </button>
                <button className="pc-btn" onClick={() => void handleCopy(variant.template, 'Raw template')}>
                    Copy raw
                </button>
                {variant.parameters.length > 0 && (
                    <button className="pc-btn" onClick={handleReset}>
                        Reset
                    </button>
                )}
            </section>

            {/* System prompt tip */}
            {sysHref && (
                <section className="pc-detail-section pc-sys-tip" aria-label="System prompt">
                    <h3 className="pc-section-heading">Recommended system prompt</h3>
                    <p className="pc-sys-tip-text">This prompt works best with a dedicated system prompt.</p>
                    <div className="pc-sys-tip-actions">
                        <a className="pc-btn" href={sysHref} target="_blank" rel="noopener noreferrer">
                            Open ↗
                        </a>
                        {sysFullUrl && (
                            <button className="pc-btn" onClick={() => void handleCopy(sysFullUrl, 'Link')}>
                                Copy link
                            </button>
                        )}
                    </div>
                </section>
            )}

            {/* S5 Examples */}
            {variant.examples && Object.keys(variant.examples).length > 0 && (
                <section className="pc-detail-section" aria-label="Examples">
                    <h3 className="pc-section-heading">Example values</h3>
                    <dl className="pc-examples">
                        {Object.entries(variant.examples).map(([key, vals]) => (
                            <div key={key} className="pc-example-row">
                                <dt className="pc-mono">{key}</dt>
                                <dd>{vals.join(', ')}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}

            {/* S6 Notes */}
            {variant.notes && (
                <section className="pc-detail-section" aria-label="Notes">
                    <h3 className="pc-section-heading">Notes</h3>
                    <p className="pc-detail-notes">{variant.notes}</p>
                </section>
            )}

            {/* S7 Keywords */}
            {variant.keywords.length > 0 && (
                <section className="pc-detail-section" aria-label="Keywords">
                    <h3 className="pc-section-heading">Keywords</h3>
                    <div className="pc-keywords">
                        {variant.keywords.map((k) => (
                            <span key={k} className="pc-keyword">
                                {k}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

PromptDetailPanel.displayName = 'PromptDetailPanel';
export default PromptDetailPanel;
