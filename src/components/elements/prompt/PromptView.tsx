import { copyToClipboard } from '@/common/clipboard-utils';
import { Prompt, replaceParams } from '@/common/prompts/prompts';
import { useToast } from '@/contexts/ToasterContext';
import Button from '@/controls/Button';
import Chip from '@/controls/Chip';
import TextEditor, { TextEditorSize } from '@/controls/TextEditor';
import { ToastType } from '@/controls/toaster/types';
import LabeledTextEditor from '@/elements/prompt/LabeledTextEditor';
import ContentContainerFlex from '@/layouts/ContentContainerFlex';
import HorizontalContainer from '@/layouts/HorizontalContainer';
import { CaseUtils } from 'coreutilsts';
import React, { FC, ReactNode, useCallback, useMemo, useState } from 'react';

interface SectionProps {
    title: string;
    children: ReactNode;
}
const Section: FC<SectionProps> = ({ title, children }) => (
    <section>
        <h3>{title}</h3>
        <ContentContainerFlex>{children}</ContentContainerFlex>
    </section>
);

interface HeaderProps {
    title: string;
    subtitle: string;
}
const Header: FC<HeaderProps> = ({ title, subtitle }) => (
    <section>
        <h1>{CaseUtils.toSentenceCase(title).toUpperCase()}</h1>
        <ContentContainerFlex>
            <p>{subtitle}</p>
        </ContentContainerFlex>
    </section>
);

const PromptInfo: FC<{ prompt: Prompt }> = ({ prompt }) => {
    const { type, category, parameters = [], tags } = prompt;
    return (
        <Section title="Prompt Main Information">
            <table className="transfer-table">
                <thead>
                    <tr>
                        {['Type', 'Category', 'Parameters', 'Tags'].map((header) => (
                            <th key={header} className="transfer-th-td">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="transfer-th-td">{type}</td>
                        <td className="transfer-th-td">{category}</td>
                        <td className="transfer-th-td">
                            {parameters.length > 0 ? (
                                <ul>
                                    {parameters.map((param) => (
                                        <li key={param}>{param.trim()}</li>
                                    ))}
                                </ul>
                            ) : (
                                'No parameters'
                            )}
                        </td>
                        <td className="transfer-th-td">
                            {tags.length > 0 ? tags.map((tag) => <Chip key={tag} text={tag.trim()} />) : 'No tags'}
                        </td>
                    </tr>
                </tbody>
            </table>
        </Section>
    );
};

interface ParametersEditorProps {
    parameterKeys: string[];
    values: Record<string, string>;
    onValueChange: (name: string, value: string) => void;
    onApply: () => void;
}

const ParametersEditor: FC<ParametersEditorProps> = ({ parameterKeys, values, onValueChange, onApply }) => (
    <Section title="Parameters">
        {parameterKeys.length > 0 ? (
            <>
                {parameterKeys.map((key) => (
                    <LabeledTextEditor
                        key={key}
                        label={key}
                        content={values[key]}
                        onChange={(_, val) => onValueChange(key, val)}
                    />
                ))}
                <HorizontalContainer centerItems={true}>
                    <div>
                        <strong>Warning:</strong> Applying parameters overwrites current template below.
                    </div>
                    <Button
                        text="Apply Parameters"
                        variant="solid"
                        colorStyle="primary-color"
                        size="small"
                        onClick={onApply}
                    />
                </HorizontalContainer>
            </>
        ) : (
            <p>No parameters to apply.</p>
        )}
    </Section>
);

interface TemplateEditorProps {
    content: string;
    onEdit: (txt: string) => void;
    onReset: () => void;
    onCopyRaw: () => void;
    onCopyEdited: () => void;
}

const TemplateEditor: FC<TemplateEditorProps> = ({ content, onEdit, onReset, onCopyRaw, onCopyEdited }) => (
    <Section title="Template">
        <TextEditor content={content} onContentChange={onEdit} rows={15} mono size={TextEditorSize.Medium} />
        <HorizontalContainer centerItems={true}>
            <Button text="Reset" variant="outlined" colorStyle="error-color" size="default" onClick={onReset} />
            <Button text="Copy Raw" variant="outlined" colorStyle="primary-color" size="default" onClick={onCopyRaw} />
            <Button
                text="Copy Edited"
                variant="solid"
                colorStyle="primary-color"
                size="default"
                onClick={onCopyEdited}
            />
        </HorizontalContainer>
    </Section>
);

interface PromptViewProps {
    prompt: Prompt;
}

const PromptView: FC<PromptViewProps> = ({ prompt }) => {
    const { showToast } = useToast();

    const parameterKeys = useMemo(() => prompt.parameters ?? [], [prompt.parameters]);
    const [paramValues, setParamValues] = useState<Record<string, string>>(
        parameterKeys.reduce((acc, key) => ({ ...acc, [key]: '' }), {}),
    );
    const [template, setTemplate] = useState(prompt.template);

    const handleValueChange = useCallback((name: string, value: string) => {
        setParamValues((prev) => ({ ...prev, [name]: value }));
    }, []);

    const applyParameters = useCallback(() => {
        const updated = replaceParams(prompt.template, paramValues);
        setTemplate(updated);
        showToast({ message: 'Parameters applied', type: ToastType.SUCCESS });
    }, [paramValues, prompt.template, showToast]);

    const copyText = useCallback(
        (text: string, successMsg: string, errorMsg: string) => {
            const ok = copyToClipboard(text);
            showToast({ message: ok ? successMsg : errorMsg, type: ok ? ToastType.SUCCESS : ToastType.ERROR });
        },
        [showToast],
    );

    const handleReset = useCallback(() => {
        setTemplate(prompt.template);
    }, [prompt.template]);
    const handleCopyRaw = useCallback(
        () => copyText(prompt.template, 'Raw prompt copied', 'Copy failed'),
        [copyText, prompt.template],
    );
    const handleCopyEdited = useCallback(
        () => copyText(replaceParams(template, paramValues), 'Edited prompt copied', 'Copy failed'),
        [template, paramValues, copyText],
    );

    return (
        <div>
            <Header title={prompt.id} subtitle="Review, edit, and copy this prompt" />
            <PromptInfo prompt={prompt} />
            <Section title="Description">
                <p>{prompt.description}</p>
            </Section>
            <ParametersEditor
                parameterKeys={parameterKeys}
                values={paramValues}
                onValueChange={handleValueChange}
                onApply={applyParameters}
            />
            <TemplateEditor
                content={template}
                onEdit={setTemplate}
                onReset={handleReset}
                onCopyRaw={handleCopyRaw}
                onCopyEdited={handleCopyEdited}
            />
        </div>
    );
};
PromptView.displayName = 'PromptView';
export default React.memo(PromptView);
