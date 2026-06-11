import { Platform, SelectedAiTool } from '@/common/ai-tools-data';
import HorizontalContainer from '@/layouts/HorizontalContainer';
import React from 'react';
import AiToolsTransferColumn from './AiToolsTransferColumn';

interface AiToolsTransferColumnsProps {
    available: SelectedAiTool[];
    selected: SelectedAiTool[];
    platform: Platform;
    onAdd: (tools: SelectedAiTool[]) => void;
    onRemove: (tools: SelectedAiTool[]) => void;
    onOverrideOption: (toolId: string, optionId: string) => void;
}

const AiToolsTransferColumns: React.FC<AiToolsTransferColumnsProps> = ({
    available,
    selected,
    platform,
    onAdd,
    onRemove,
    onOverrideOption,
}) => (
    <HorizontalContainer>
        <AiToolsTransferColumn
            label="Available Tools"
            items={available}
            platform={platform}
            primaryActionLabel="Add All"
            secondaryActionLabel="Add Selected"
            onPrimaryAction={onAdd}
            onSecondaryAction={onAdd}
            onOverrideOption={onOverrideOption}
        />
        <AiToolsTransferColumn
            label="Selected Tools"
            items={selected}
            platform={platform}
            primaryActionLabel="Remove All"
            secondaryActionLabel="Remove Selected"
            onPrimaryAction={onRemove}
            onSecondaryAction={onRemove}
            onOverrideOption={onOverrideOption}
        />
    </HorizontalContainer>
);

export default React.memo(AiToolsTransferColumns);
