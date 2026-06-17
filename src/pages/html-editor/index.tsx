'use client';
import { DEFAULT_FILE_NAME } from '@/common/constants';
import { FileInfo } from '@/common/file-types';
import { formatCode } from '@/common/format-code';
import { useFileOpen } from '@/contexts/FileOpenContext';
import { useFileSaveDialog } from '@/contexts/FileSaveDialogContext';
import { usePage } from '@/contexts/PageContext';
import { useToast } from '@/contexts/ToasterContext';
import Button from '@/controls/Button';
import Switch from '@/controls/Switch';
import ToolAbout from '@/controls/ToolAbout';
import { ToastType } from '@/controls/toaster/types';
import React, { useCallback, useEffect, useState } from 'react';
import SplitPreviewEditor from '../../components/elements/editor/SplitPreviewEditor';
import ContentContainerFlex from '../../components/layouts/ContentContainerFlex';

const HTML_EXTENSION = '.html';

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Preview</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    h1 { color: #2563eb; }
  </style>
</head>
<body>
  <h1>Hello, HTML Editor!</h1>
  <p>Edit the HTML on the left and see the preview update here.</p>
</body>
</html>`;

interface HtmlPreviewProps {
    src: string;
    allowScripts: boolean;
}

const HtmlPreview: React.FC<HtmlPreviewProps> = ({ src, allowScripts }) => {
    if (!src.trim()) {
        return <p className="html-editor__empty-hint">Start typing HTML…</p>;
    }
    return (
        <iframe
            srcDoc={src}
            sandbox={allowScripts ? 'allow-scripts' : 'allow-same-origin'}
            title="HTML Preview"
            className="html-editor__preview-frame"
        />
    );
};

HtmlPreview.displayName = 'HtmlPreview';

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();
    const { showFileOpenDialog } = useFileOpen();
    const { save, saveAs } = useFileSaveDialog();
    const { showToast } = useToast();

    useEffect(() => {
        setPageTitle('HTML Editor');
    }, [setPageTitle]);

    const [content, setContent] = useState(DEFAULT_HTML);
    const [fileName, setFileName] = useState(DEFAULT_FILE_NAME);
    const [fileExtension, setFileExtension] = useState(HTML_EXTENSION);
    const [allowScripts, setAllowScripts] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);

    const handleNew = useCallback(() => {
        setContent('');
        setFileName(DEFAULT_FILE_NAME);
        setFileExtension(HTML_EXTENSION);
    }, []);

    const handleOpen = useCallback(() => {
        showFileOpenDialog({
            supportedFiles: ['.html', '.htm', '.txt'],
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
        save({ fileName, fileExtension, fileContent: content, availableExtensions: ['.html', '.htm', '.txt'] });
    }, [fileName, fileExtension, content, save]);

    const handleSaveAs = useCallback(() => {
        saveAs({ fileName, fileExtension, fileContent: content, availableExtensions: ['.html', '.htm', '.txt'] });
    }, [fileName, fileExtension, content, saveAs]);

    const handleFormat = useCallback(async () => {
        if (isFormatting || !content.trim()) return;
        setIsFormatting(true);
        try {
            const formatted = await formatCode('html', content);
            setContent(formatted);
            showToast({ message: 'Formatted', type: ToastType.SUCCESS });
        } catch {
            showToast({ message: 'Format failed', type: ToastType.ERROR });
        } finally {
            setIsFormatting(false);
        }
    }, [content, isFormatting, showToast]);

    const handleAllowScripts = useCallback(
        (checked: boolean) => {
            setAllowScripts(checked);
            if (checked) {
                showToast({ message: 'Scripts enabled — trusted HTML only', type: ToastType.WARNING });
            }
        },
        [showToast],
    );

    const renderPreview = useCallback(
        (v: string) => <HtmlPreview src={v} allowScripts={allowScripts} />,
        [allowScripts],
    );

    const editorToolbar = (
        <>
            <Button text="New" variant="outlined" size="small" onClick={handleNew} />
            <Button text="Open" variant="outlined" size="small" onClick={handleOpen} />
            <Button text="Save" variant="outlined" size="small" onClick={handleSave} />
            <Button text="Save As" variant="outlined" size="small" onClick={handleSaveAs} />
            <Button text="Format" variant="outlined" size="small" onClick={handleFormat} disabled={isFormatting} />
        </>
    );

    const previewToolbar = <Switch label="Allow Scripts" checked={allowScripts} onChange={handleAllowScripts} />;

    return (
        <ContentContainerFlex>
            <ToolAbout routeKey="html-editor">
                Write HTML on the left and see the live preview on the right. Scripts are disabled by default; enable
                them with the toggle for trusted content. <strong>Format</strong> with Prettier to tidy messy markup.
                Open or save <code>.html</code> files. The preview is sandboxed in an iframe — no network requests leave
                the browser.
            </ToolAbout>
            <div className="html-editor">
                <SplitPreviewEditor
                    language="html"
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
