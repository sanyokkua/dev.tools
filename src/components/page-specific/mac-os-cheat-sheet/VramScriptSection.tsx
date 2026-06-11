import { saveTextFile } from '@/common/file-utils';
import { VRAM_SCRIPT_CONTENT } from '@/common/macos-utils';
import CodeSnippet from '@/elements/CodeSnippet';
import RoundedContainer from '@/layouts/RoundedContainer';
import React from 'react';

const USAGE_EXAMPLES = `# Interactive mode (applies 26 GB default)
./set-vram.sh

# Apply a specific preset (4, 8, 16, 24, 26, or 28 GB)
./set-vram.sh 16

# Preview without making changes
./set-vram.sh --dry-run 28

# Show current configured limit
./set-vram.sh --current

# Reset to macOS automatic behavior
./set-vram.sh --reset`;

function handleDownload(): void {
    saveTextFile({
        fileName: 'set-vram',
        fileExtension: '.sh',
        fileMimeType: 'text/x-shellscript',
        fileContent: VRAM_SCRIPT_CONTENT,
    });
}

const VramScriptSection: React.FC = () => (
    <RoundedContainer>
        <h2>Apple Silicon VRAM Manager</h2>
        <p>
            A shell script for Apple Silicon Macs that sets the GPU wired memory limit via{' '}
            <code>iogpu.wired_limit_mb</code>. Supports presets from 4 GB to 28 GB, dry-run mode, and reset to macOS
            defaults. Requires <code>sudo</code>.
        </p>
        <CodeSnippet headerText="Usage" content={USAGE_EXAMPLES} language="bash" onDownload={handleDownload} />
    </RoundedContainer>
);

export default VramScriptSection;
