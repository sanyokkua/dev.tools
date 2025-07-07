import { copyToClipboard } from '@/common/clipboard-utils';
import { useToast } from '@/contexts/ToasterContext';
import Button from '@/controls/Button';
import { ToastType } from '@/controls/toaster/types';
import hljs from 'highlight.js';
import bash from 'highlight.js/lib/languages/bash';
import powershell from 'highlight.js/lib/languages/powershell';
import shell from 'highlight.js/lib/languages/shell';
import 'highlight.js/styles/base16/material-darker.css';

import React, { useEffect, useRef } from 'react';
import PaperContainer from '../layouts/PaperContainer';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('powershell', powershell);

type SupportedLanguages = 'bash' | 'shell' | 'powershell';

type ReadOnlyCodeEditorProps = { headerText?: string; content: string; language?: SupportedLanguages };

/**
 * Functional component for displaying a read-only code editor with syntax highlighting and copy-to-clipboard
 * functionality.
 * @param props - Component properties including header text, content, and optional programming language.
 */
const CodeSnippet: React.FC<ReadOnlyCodeEditorProps> = (props) => {
    const { showToast } = useToast();
    const { headerText, content, language = 'shell' } = props;

    const codeRef = useRef(null);

    function highligh() {
        if (codeRef.current) {
            hljs.highlightElement(codeRef.current);
        }
    }

    useEffect(() => {
        highligh();
    }, [content, language]);

    function handleClick() {
        if (copyToClipboard(content)) {
            showToast({ message: 'Copied to clipboard', type: ToastType.SUCCESS });
        } else {
            showToast({ message: 'Failed to copy to clipboard', type: ToastType.ERROR });
        }
    }

    highligh();
    return (
        <PaperContainer elevation={3}>
            {headerText && <h3>{headerText}</h3>}
            <pre>
                <code ref={codeRef} className={`language-${language} hljs`}>
                    {content}
                </code>
            </pre>
            <Button text={'Copy'} onClick={handleClick} variant="dashed" colorStyle="primary-color" size={'small'} />
        </PaperContainer>
    );
};

export default CodeSnippet;
