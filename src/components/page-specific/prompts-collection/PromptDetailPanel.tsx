import { copyToClipboard } from '@/common/clipboard-utils';
import { Prompt, replaceParams } from '@/common/prompts/prompts';
import { useToast } from '@/contexts/ToasterContext';
import Button from '@/controls/Button';
import Chip from '@/controls/Chip';
import TextEditor, { TextEditorSize } from '@/controls/TextEditor';
import { ToastType } from '@/controls/toaster/types';
import LabeledTextEditor from '@/elements/prompt/LabeledTextEditor';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

interface Props {
    prompt: Prompt;
}

const PromptDetailPanel: FC<Props> = ({ prompt }) => {
    const { showToast } = useToast();
    const parameterKeys = useMemo(() => prompt.parameters ?? [], [prompt.parameters]);

    const [paramValues, setParamValues] = useState<Record<string, string>>(() =>
        parameterKeys.reduce<Record<string, string>>((acc, key) => ({ ...acc, [key]: '' }), {}),
    );
    const [template, setTemplate] = useState(prompt.template);

    // Reset state when the selected prompt changes — intentionally depends only on prompt.id
    useEffect(() => {
        setParamValues(parameterKeys.reduce<Record<string, string>>((acc, key) => ({ ...acc, [key]: '' }), {}));
        setTemplate(prompt.template);
    }, [prompt.id]);

    const handleValueChange = useCallback((name: string, value: string) => {
        setParamValues((prev) => ({ ...prev, [name]: value }));
    }, []);

    const applyParameters = useCallback(() => {
        setTemplate(replaceParams(prompt.template, paramValues));
        showToast({ message: 'Parameters applied', type: ToastType.SUCCESS });
    }, [paramValues, prompt.template, showToast]);

    const copy = useCallback(
        (text: string, ok: string, fail: string) => {
            const success = copyToClipboard(text);
            showToast({ message: success ? ok : fail, type: success ? ToastType.SUCCESS : ToastType.ERROR });
        },
        [showToast],
    );

    const handleReset = useCallback(() => setTemplate(prompt.template), [prompt.template]);
    const handleCopyRaw = useCallback(
        () => copy(prompt.template, 'Raw prompt copied', 'Copy failed'),
        [copy, prompt.template],
    );
    const handleCopyEdited = useCallback(
        () => copy(replaceParams(template, paramValues), 'Edited prompt copied', 'Copy failed'),
        [copy, template, paramValues],
    );

    return (
        <>
            {/* Info card */}
            <div className="prompt-info-card">
                <p className="prompt-detail-title">{prompt.description}</p>
                <div className="prompt-meta-row">
                    <span className="prompt-type-pill">{prompt.type}</span>
                    <Chip text={prompt.category} />
                    {prompt.tags.map((tag) => (
                        <Chip key={tag} text={tag.trim()} />
                    ))}
                </div>
            </div>

            {/* Parameters editor */}
            <div className="prompt-params-card">
                <div className="prompt-step-label">
                    <span className="step-n">1</span>
                    Parameters
                </div>
                {parameterKeys.length > 0 ? (
                    <>
                        <div className="prompt-params-grid">
                            {parameterKeys.map((key) => (
                                <LabeledTextEditor
                                    key={key}
                                    label={key}
                                    content={paramValues[key]}
                                    onChange={(_, val) => handleValueChange(key, val)}
                                />
                            ))}
                        </div>
                        <div className="prompt-apply-row">
                            <span>⚠ Applying overwrites the template below.</span>
                            <Button
                                text="Apply parameters"
                                variant="solid"
                                colorStyle="primary-color"
                                size="small"
                                onClick={applyParameters}
                            />
                        </div>
                    </>
                ) : (
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                        No parameters — copy the template directly.
                    </p>
                )}
            </div>

            {/* Template editor */}
            <div className="prompt-template-card">
                <div className="prompt-template-header">
                    <span className="template-title">Template</span>
                    <div className="template-actions">
                        <Button
                            text="Reset"
                            variant="outlined"
                            colorStyle="error-color"
                            size="small"
                            onClick={handleReset}
                        />
                        <Button
                            text="Copy raw"
                            variant="outlined"
                            colorStyle="primary-color"
                            size="small"
                            onClick={handleCopyRaw}
                        />
                        <Button
                            text="Copy edited"
                            variant="solid"
                            colorStyle="primary-color"
                            size="small"
                            onClick={handleCopyEdited}
                        />
                    </div>
                </div>
                <div className="prompt-template-body">
                    <TextEditor
                        content={template}
                        onContentChange={setTemplate}
                        rows={12}
                        mono
                        size={TextEditorSize.Medium}
                    />
                </div>
            </div>
        </>
    );
};

PromptDetailPanel.displayName = 'PromptDetailPanel';
export default React.memo(PromptDetailPanel);
