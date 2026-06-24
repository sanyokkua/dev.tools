import { copyToClipboard } from '@/common/clipboard-utils';
import { useToast } from '@/contexts/ToasterContext';
import { ToastType } from '@/controls/toaster/types';
import hljs from 'highlight.js';
import bash from 'highlight.js/lib/languages/bash';
import powershell from 'highlight.js/lib/languages/powershell';
import shell from 'highlight.js/lib/languages/shell';
import React from 'react';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('powershell', powershell);

type SupportedLanguages = 'bash' | 'shell' | 'powershell';

type CodeSnippetProps = {
    headerText?: string;
    content: string;
    language?: SupportedLanguages;
    onDownload?: () => void;
};

const CodeSnippet: React.FC<CodeSnippetProps> = ({ headerText, content, language = 'shell', onDownload }) => {
    const { showToast } = useToast();
    const highlighted = hljs.highlight(content, { language }).value;

    const handleCopy = (): void => {
        if (copyToClipboard(content)) {
            showToast({ message: 'Copied to clipboard', type: ToastType.SUCCESS });
        } else {
            showToast({ message: 'Failed to copy', type: ToastType.ERROR });
        }
    };

    return (
        <div className="code-block">
            <div className="code-block-bar">
                <span className="code-block-dots">
                    <i style={{ background: '#ff5f56' }} />
                    <i style={{ background: '#ffbd2e' }} />
                    <i style={{ background: '#27c93f' }} />
                </span>
                <span className="code-block-title">{headerText ?? language}</span>
                <span className="code-block-actions">
                    <button className="code-block-action-btn" type="button" onClick={handleCopy}>
                        Copy
                    </button>
                    {onDownload && (
                        <button className="code-block-action-btn" type="button" onClick={onDownload}>
                            ⤓ Download
                        </button>
                    )}
                </span>
            </div>
            <pre>
                <code className={`language-${language} hljs`} dangerouslySetInnerHTML={{ __html: highlighted }} />
            </pre>
        </div>
    );
};

export default CodeSnippet;
