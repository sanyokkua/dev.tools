import { buildSysPromptHref, replaceParams } from '@/common/prompts/data';
import { isMetaPrompt } from '@/common/prompts/meta';
import type { Category, Domain, LogicalPromptDef, PromptVariant } from '@/common/prompts/model/types';
import { VALUE_SETS } from '@/common/prompts/registries/value-sets';
import { useToast } from '@/contexts/ToasterContext';
import EditableCombobox from '@/controls/EditableCombobox';
import SegmentedControl from '@/controls/SegmentedControl';
import { ToastType } from '@/controls/toaster/types';
import React, { useCallback, useEffect, useState } from 'react';

interface Props {
    logical: LogicalPromptDef | null;
    variant: PromptVariant | null;
    variants?: PromptVariant[];
    domain: Domain | null;
    category: Category | null;
    onVariantSwitch?: (ctx: 'chat' | 'agent' | null, model: string | null, sub: string | null) => void;
}

const PromptDetailPanel: React.FC<Props> = ({
    variant,
    domain,
    category,
    logical,
    variants = [],
    onVariantSwitch = () => {},
}) => {
    const { showToast } = useToast();
    const [paramValues, setParamValues] = useState<Record<string, string>>({});

    // Reset all params when the selected logical prompt changes (new prompt selected in list)
    useEffect(() => {
        setParamValues({});
    }, [logical?.id]);

    // When variant changes within the same logical (axis switch), preserve matching param values
    useEffect(() => {
        if (!variant) return;
        setParamValues((prev) => {
            const next: Record<string, string> = {};
            for (const p of variant.parameters) {
                next[p.name] = prev[p.name] ?? '';
            }
            return next;
        });
    }, [variant?.id]);

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

    const handleShare = useCallback(async () => {
        if (typeof window === 'undefined') return;
        try {
            await navigator.clipboard.writeText(window.location.href);
            showToast({ message: 'Link copied!', type: ToastType.SUCCESS });
        } catch {
            showToast({ message: 'Copy failed', type: ToastType.ERROR });
        }
    }, [showToast]);

    if (!variant) {
        return (
            <div className="pc-detail-empty" role="status">
                Select a prompt from the list
            </div>
        );
    }

    const isMeta = isMetaPrompt(variant);
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    const sysId = variant.recommendedSystemPromptId;
    const sysHref =
        sysId && domain && category ? buildSysPromptHref(sysId, domain.slug, category.slug, basePath) : null;
    const sysFullUrl = sysHref && typeof window !== 'undefined' ? window.location.origin + sysHref : sysHref;

    // Axis control derived values
    const activeAxes = logical?.variantAxes ?? [];
    const hasContextAxis = activeAxes.includes('mode');
    const hasModelAxis = activeAxes.includes('model');
    const hasSubAxis = activeAxes.includes('subVariant');

    const contextOptions = hasContextAxis
        ? ([...new Set(variants.map((v) => v.executionContext).filter(Boolean))] as ('chat' | 'agent')[])
        : [];
    const modelOptions = hasModelAxis ? ([...new Set(variants.map((v) => v.model).filter(Boolean))] as string[]) : [];
    const subOptions = hasSubAxis ? ([...new Set(variants.map((v) => v.subVariant).filter(Boolean))] as string[]) : [];

    return (
        <div className="pc-detail">
            {/* S1 Header */}
            <div className="pc-detail-header-row">
                <div className="pc-detail-header-main">
                    <div className="pc-detail-title-row">
                        <h2 className="pc-detail-title">{variant.title}</h2>
                        <button className="pc-btn pc-share-btn" onClick={() => void handleShare()}>
                            Share 🔗
                        </button>
                    </div>
                    <div className="pc-detail-breadcrumb">
                        {domain?.title} › {category?.title} · <span className="pc-mono">{variant.id}</span>
                    </div>

                    {/* Variant axis controls — only rendered when axis has >1 unique value */}
                    {(contextOptions.length > 1 || modelOptions.length > 1 || subOptions.length > 1) && (
                        <div className="pc-variant-controls">
                            {contextOptions.length > 1 && (
                                <SegmentedControl
                                    options={contextOptions.map((v) => ({ value: v, label: v }))}
                                    value={variant.executionContext}
                                    onChange={(v) =>
                                        onVariantSwitch(
                                            v as 'chat' | 'agent',
                                            hasModelAxis ? (variant.model ?? null) : null,
                                            hasSubAxis ? (variant.subVariant ?? null) : null,
                                        )
                                    }
                                    aria-label="Execution context"
                                />
                            )}
                            {modelOptions.length > 1 && (
                                <select
                                    className="pc-model-select"
                                    value={variant.model ?? ''}
                                    onChange={(e) =>
                                        onVariantSwitch(
                                            hasContextAxis ? (variant.executionContext ?? null) : null,
                                            e.target.value || null,
                                            hasSubAxis ? (variant.subVariant ?? null) : null,
                                        )
                                    }
                                    aria-label="Target model"
                                >
                                    {modelOptions.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {subOptions.length > 1 && (
                                <SegmentedControl
                                    options={subOptions.map((v) => ({ value: v, label: v }))}
                                    value={variant.subVariant ?? subOptions[0]}
                                    onChange={(v) =>
                                        onVariantSwitch(
                                            hasContextAxis ? (variant.executionContext ?? null) : null,
                                            hasModelAxis ? (variant.model ?? null) : null,
                                            v || null,
                                        )
                                    }
                                    aria-label="Variant"
                                />
                            )}
                        </div>
                    )}
                </div>
                <div className="pc-detail-badges">
                    {!hasContextAxis && (
                        <span className={`pc-tag${variant.executionContext === 'agent' ? ' pc-tag-alt' : ''}`}>
                            {variant.executionContext === 'agent' ? 'agent' : 'chat'}
                        </span>
                    )}
                    {isMeta && <span className="pc-tag pc-tag-meta">⚗ Meta-prompt · outputs a prompt</span>}
                </div>
            </div>

            {/* Meta-prompt guard note */}
            {isMeta && (
                <div className="pc-meta-guard" role="note" aria-label="Meta-prompt notice">
                    ⚗ <strong>Meta-prompt.</strong> The output of this prompt is itself a prompt — not the final result.{' '}
                    <strong>Step 1:</strong> fill in parameters and copy. <strong>Step 2:</strong> paste the output into
                    your target model.
                </div>
            )}

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
                        {variant.parameters.map((param) => {
                            const valueSet = param.valueSetId
                                ? VALUE_SETS.find((vs) => vs.id === param.valueSetId)
                                : undefined;
                            const displayLabel = param.label ?? param.name;
                            const placeholder = param.optional ? 'Leave blank to omit…' : undefined;
                            const val = paramValues[param.name] ?? '';
                            const onChange = (v: string) => setParamValues((prev) => ({ ...prev, [param.name]: v }));
                            return (
                                <div key={param.name} className="pc-param-row">
                                    <label className="pc-param-label" htmlFor={`param-${param.name}`}>
                                        <span>{displayLabel}</span>
                                        {param.optional && <span className="pc-param-optional">(optional)</span>}
                                    </label>
                                    {param.description && <p className="pc-param-help">{param.description}</p>}
                                    {param.control === 'textarea' ? (
                                        <textarea
                                            id={`param-${param.name}`}
                                            className="pc-param-textarea"
                                            value={val}
                                            onChange={(e) => onChange(e.target.value)}
                                            placeholder={placeholder}
                                            aria-label={displayLabel}
                                            rows={4}
                                        />
                                    ) : param.control === 'select' && valueSet ? (
                                        <select
                                            id={`param-${param.name}`}
                                            className="pc-param-select"
                                            value={val}
                                            onChange={(e) => onChange(e.target.value)}
                                            aria-label={displayLabel}
                                        >
                                            {param.optional && <option value="">—</option>}
                                            {valueSet.values.map((v) => (
                                                <option key={v} value={v}>
                                                    {v}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (param.control === 'combobox' || param.suggestedValues?.length) &&
                                      (valueSet || param.suggestedValues?.length) ? (
                                        <EditableCombobox
                                            id={`param-${param.name}`}
                                            value={val}
                                            onChange={onChange}
                                            options={valueSet?.values ?? param.suggestedValues ?? []}
                                            allowCustom={valueSet?.allowCustom ?? param.allowCustom ?? true}
                                            placeholder={placeholder}
                                            aria-label={displayLabel}
                                        />
                                    ) : (
                                        <input
                                            id={`param-${param.name}`}
                                            className="pc-param-input"
                                            value={val}
                                            onChange={(e) => onChange(e.target.value)}
                                            placeholder={placeholder}
                                            aria-label={displayLabel}
                                        />
                                    )}
                                </div>
                            );
                        })}
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
