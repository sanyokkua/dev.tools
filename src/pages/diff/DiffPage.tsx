'use client';
import { normalizeForDiff, type DiffType } from '@/common/diff-normalizer';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToasterContext';
import Button from '@/controls/Button';
import SegmentedControl, { SegmentedOption } from '@/controls/SegmentedControl';
import Switch from '@/controls/Switch';
import { ToastType } from '@/controls/toaster/types';
import { DiffEditor, useMonaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const TYPE_OPTIONS: SegmentedOption[] = [
    { value: 'text', label: 'Text' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
];

const DIFF_LANGUAGE: Record<DiffType, string> = { text: 'plaintext', json: 'json', xml: 'xml' };

const DiffPage: React.FC = () => {
    const [type, setType] = useState<DiffType>('text');
    const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
    const [leftText, setLeftText] = useState('');
    const [rightText, setRightText] = useState('');
    const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);
    const { theme: appTheme } = useTheme();
    const { showToast } = useToast();
    const showToastRef = useRef(showToast);
    const monaco = useMonaco();

    // Cleanup: reset editor model before unmount to avoid "TextModel got disposed" race
    useEffect(() => {
        return (): void => {
            try {
                diffEditorRef.current?.setModel(null);
            } catch {
                // ignore — editor may already be gone
            }
        };
    }, []);

    useEffect(() => {
        showToastRef.current = showToast;
    });

    const monacoTheme = appTheme === 'dark' ? 'vs-dark' : 'vs';

    // Update model language in-place when type changes (avoids disposal race from remounting)
    useEffect(() => {
        const de = diffEditorRef.current;
        if (!monaco || !de) return;
        const lang = DIFF_LANGUAGE[type];
        const om = de.getOriginalEditor().getModel();
        const mm = de.getModifiedEditor().getModel();
        if (om) monaco.editor.setModelLanguage(om, lang);
        if (mm) monaco.editor.setModelLanguage(mm, lang);
    }, [type, monaco]);

    useEffect(() => {
        if (type === 'text') return;
        const id = setTimeout(() => {
            const diffEditor = diffEditorRef.current;
            if (!diffEditor) return;
            const origEd = diffEditor.getOriginalEditor();
            const modEd = diffEditor.getModifiedEditor();

            const { result: leftNorm, error: leftErr } = normalizeForDiff(leftText, type);
            const { result: rightNorm, error: rightErr } = normalizeForDiff(rightText, type);

            if (origEd.getValue() !== leftNorm) origEd.setValue(leftNorm);
            if (modEd.getValue() !== rightNorm) modEd.setValue(rightNorm);

            if (leftErr) showToastRef.current({ message: `Left: ${leftErr}`, type: ToastType.ERROR });
            if (rightErr) showToastRef.current({ message: `Right: ${rightErr}`, type: ToastType.ERROR });
        }, 300);
        return () => clearTimeout(id);
    }, [leftText, rightText, type]);

    const handleMount = useCallback((diffEditor: editor.IStandaloneDiffEditor) => {
        diffEditorRef.current = diffEditor;
        diffEditor.getOriginalEditor().onDidChangeModelContent(() => {
            setLeftText(diffEditor.getOriginalEditor().getValue());
        });
        diffEditor.getModifiedEditor().onDidChangeModelContent(() => {
            setRightText(diffEditor.getModifiedEditor().getValue());
        });
    }, []);

    const handleSwap = useCallback(() => {
        const diffEditor = diffEditorRef.current;
        if (!diffEditor) return;
        const origVal = diffEditor.getOriginalEditor().getValue();
        const modVal = diffEditor.getModifiedEditor().getValue();
        diffEditor.getOriginalEditor().setValue(modVal);
        diffEditor.getModifiedEditor().setValue(origVal);
        setLeftText(modVal);
        setRightText(origVal);
    }, []);

    const handleCopyModified = useCallback(() => {
        const val = diffEditorRef.current?.getModifiedEditor().getValue() ?? '';
        navigator.clipboard
            .writeText(val)
            .then(() => showToastRef.current({ message: 'Copied', type: ToastType.SUCCESS }))
            .catch(() => showToastRef.current({ message: 'Copy failed', type: ToastType.ERROR }));
    }, []);

    return (
        <div className="diff-tool">
            <div className="editorpane">
                <div className="eh">
                    <SegmentedControl
                        options={TYPE_OPTIONS}
                        value={type}
                        onChange={(v) => setType(v as DiffType)}
                        aria-label="Diff type"
                    />
                    <Button text="⇄ Swap" variant="text" size="small" onClick={handleSwap} />
                    <Button text="Copy Modified" variant="text" size="small" onClick={handleCopyModified} />
                    <Switch checked={ignoreWhitespace} onChange={setIgnoreWhitespace} label="Ignore whitespace" />
                </div>
                <div className="eb">
                    <DiffEditor
                        original=""
                        modified=""
                        language="plaintext"
                        theme={monacoTheme}
                        height="100%"
                        options={{
                            originalEditable: true,
                            renderSideBySide: true,
                            ignoreTrimWhitespace: ignoreWhitespace,
                            minimap: { enabled: false },
                            automaticLayout: true,
                            fontSize: 12,
                            fontFamily: 'monospace',
                            scrollBeyondLastLine: false,
                        }}
                        onMount={handleMount}
                    />
                </div>
            </div>
        </div>
    );
};

export default DiffPage;
