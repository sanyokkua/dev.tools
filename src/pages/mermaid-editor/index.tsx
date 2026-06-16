'use client';
import { DEFAULT_FILE_NAME } from '@/common/constants';
import { FileInfo } from '@/common/file-types';
import { renderMermaid } from '@/common/mermaid';
import { useFileOpen } from '@/contexts/FileOpenContext';
import { useFileSaveDialog } from '@/contexts/FileSaveDialogContext';
import { usePage } from '@/contexts/PageContext';
import { useToast } from '@/contexts/ToasterContext';
import Button from '@/controls/Button';
import ToolAbout from '@/controls/ToolAbout';
import { ToastType } from '@/controls/toaster/types';
import MermaidBlock from '@/elements/mermaid/MermaidBlock';
import React, { useCallback, useEffect, useState } from 'react';
import SplitPreviewEditor from '../../components/elements/editor/SplitPreviewEditor';
import ContentContainerFlex from '../../components/layouts/ContentContainerFlex';

const DEFAULT_DIAGRAM = `graph TD
    A[Start] --> B{Is it feasible?}
    B -->|Yes| C[Do it]
    B -->|No| D[Find another way]
    C --> E[Done]
    D --> E`;

const MERMAID_EXTENSION = '.mmd';

const MermaidPreview: React.FC<{ src: string }> = ({ src }) => {
    const [debounced, setDebounced] = useState(src);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(src), 400);
        return () => clearTimeout(t);
    }, [src]);

    if (!debounced.trim()) {
        return <p className="mermaid-editor__empty-hint">Start typing a Mermaid diagram…</p>;
    }
    return <MermaidBlock src={debounced} />;
};

MermaidPreview.displayName = 'MermaidPreview';

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();
    const { showFileOpenDialog } = useFileOpen();
    const { save, saveAs } = useFileSaveDialog();
    const { showToast } = useToast();

    useEffect(() => {
        setPageTitle('Mermaid Editor');
    }, [setPageTitle]);

    const [content, setContent] = useState(DEFAULT_DIAGRAM);
    const [fileName, setFileName] = useState(DEFAULT_FILE_NAME);
    const [fileExtension, setFileExtension] = useState(MERMAID_EXTENSION);

    const handleNew = useCallback(() => {
        setContent('');
        setFileName(DEFAULT_FILE_NAME);
        setFileExtension(MERMAID_EXTENSION);
    }, []);

    const handleOpen = useCallback(() => {
        showFileOpenDialog({
            supportedFiles: ['.mmd', '.txt'],
            onSuccess: (fileInfo?: FileInfo) => {
                if (!fileInfo) {
                    showToast({ message: 'No file chosen', type: ToastType.WARNING });
                    return;
                }
                setContent(fileInfo.content);
                setFileName(fileInfo.name);
                setFileExtension(fileInfo.extension);
                showToast({ message: 'File opened', type: ToastType.INFO });
            },
            onFailure: (err: unknown) => {
                console.error(err);
                showToast({ message: 'Failed to open file', type: ToastType.ERROR });
            },
        });
    }, [showFileOpenDialog, showToast]);

    const handleSave = useCallback(() => {
        save({ fileName, fileExtension, fileContent: content, availableExtensions: ['.mmd', '.txt'] });
    }, [fileName, fileExtension, content, save]);

    const handleSaveAs = useCallback(() => {
        saveAs({ fileName, fileExtension, fileContent: content, availableExtensions: ['.mmd', '.txt'] });
    }, [fileName, fileExtension, content, saveAs]);

    const handleExportSvg = useCallback(async () => {
        try {
            const svgString = await renderMermaid('mermaid-editor-svg-export', content);
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.svg`;
            a.click();
            URL.revokeObjectURL(url);
            showToast({ message: 'SVG exported', type: ToastType.SUCCESS });
        } catch {
            showToast({ message: 'Export failed — fix syntax errors first', type: ToastType.ERROR });
        }
    }, [content, fileName, showToast]);

    const handleExportPng = useCallback(async () => {
        try {
            const svgString = await renderMermaid('mermaid-editor-png-export', content);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            await new Promise<void>((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || 800;
                    canvas.height = img.naturalHeight || 600;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Canvas 2D context unavailable'));
                        return;
                    }
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((pngBlob) => {
                        URL.revokeObjectURL(svgUrl);
                        if (!pngBlob) {
                            reject(new Error('toBlob returned null'));
                            return;
                        }
                        const url = URL.createObjectURL(pngBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${fileName}.png`;
                        a.click();
                        URL.revokeObjectURL(url);
                        resolve();
                    }, 'image/png');
                };
                img.onerror = () => {
                    URL.revokeObjectURL(svgUrl);
                    reject(new Error('SVG image load failed'));
                };
                img.src = svgUrl;
            });
            showToast({ message: 'PNG exported', type: ToastType.SUCCESS });
        } catch {
            showToast({ message: 'PNG export failed — fix syntax errors first', type: ToastType.ERROR });
        }
    }, [content, fileName, showToast]);

    const renderPreview = useCallback((v: string) => <MermaidPreview src={v} />, []);

    const editorToolbar = (
        <>
            <Button text="New" variant="outlined" size="small" onClick={handleNew} />
            <Button text="Open" variant="outlined" size="small" onClick={handleOpen} />
            <Button text="Save" variant="outlined" size="small" onClick={handleSave} />
            <Button text="Save As" variant="outlined" size="small" onClick={handleSaveAs} />
        </>
    );

    const previewToolbar = (
        <>
            <Button text="Export SVG" variant="text" size="small" onClick={handleExportSvg} />
            <Button text="Export PNG" variant="text" size="small" onClick={handleExportPng} />
        </>
    );

    return (
        <ContentContainerFlex>
            <ToolAbout routeKey="mermaid-editor" title="Mermaid Editor">
                Write Mermaid diagram syntax on the left and see the rendered SVG update live on the right. Supports
                flowcharts, sequence diagrams, class diagrams, ER diagrams, and more. Open or save <code>.mmd</code>{' '}
                files; export the current diagram as SVG or PNG.
            </ToolAbout>
            <div className="mermaid-editor">
                <div className="mermaid-editor__header">
                    <h1>Mermaid Editor</h1>
                    <p>Write diagram code on the left; the rendered diagram updates automatically on the right.</p>
                </div>
                <SplitPreviewEditor
                    language="plaintext"
                    value={content}
                    onChange={setContent}
                    renderPreview={renderPreview}
                    editorToolbarChildren={editorToolbar}
                    previewToolbarChildren={previewToolbar}
                />
            </div>
        </ContentContainerFlex>
    );
};

export default IndexPage;
