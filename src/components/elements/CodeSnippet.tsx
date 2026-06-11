import { copyToClipboard } from '@/common/clipboard-utils';
import { useToast } from '@/contexts/ToasterContext';
import Button from '@/controls/Button';
import { ToastType } from '@/controls/toaster/types';
import hljs from 'highlight.js';
import bash from 'highlight.js/lib/languages/bash';
import powershell from 'highlight.js/lib/languages/powershell';
import shell from 'highlight.js/lib/languages/shell';
import 'highlight.js/styles/base16/material-darker.css';

import React from 'react';
import PaperContainer from '../layouts/PaperContainer';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('powershell', powershell);

type SupportedLanguages = 'bash' | 'shell' | 'powershell';

type ReadOnlyCodeEditorProps = {
    headerText?: string;
    content: string;
    language?: SupportedLanguages;
    onDownload?: () => void;
};

const CodeSnippet: React.FC<ReadOnlyCodeEditorProps> = (props) => {
    const { showToast } = useToast();
    const { headerText, content, language = 'shell', onDownload } = props;

    const highlighted = hljs.highlight(content, { language }).value;

    function handleClick(): void {
        if (copyToClipboard(content)) {
            showToast({ message: 'Copied to clipboard', type: ToastType.SUCCESS });
        } else {
            showToast({ message: 'Failed to copy to clipboard', type: ToastType.ERROR });
        }
    }

    return (
        <PaperContainer elevation={3}>
            {headerText && <h3>{headerText}</h3>}
            <pre>
                <code className={`language-${language} hljs`} dangerouslySetInnerHTML={{ __html: highlighted }} />
            </pre>
            <Button text={'Copy'} onClick={handleClick} variant="dashed" colorStyle="primary-color" size={'small'} />
            {onDownload && (
                <Button
                    text={'Download'}
                    onClick={onDownload}
                    variant="dashed"
                    colorStyle="secondary-color"
                    size={'small'}
                />
            )}
        </PaperContainer>
    );
};

export default CodeSnippet;
