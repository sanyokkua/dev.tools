import { Platform, SelectedAiTool } from '@/common/ai-tools-data';
import Button from '@/controls/Button';
import React, { useState } from 'react';
import AiToolsTransferTable from './AiToolsTransferTable';

interface AiToolsTransferColumnProps {
    label: string;
    items: SelectedAiTool[];
    platform: Platform;
    primaryActionLabel: string;
    secondaryActionLabel: string;
    onPrimaryAction: (items: SelectedAiTool[]) => void;
    onSecondaryAction: (items: SelectedAiTool[]) => void;
    onOverrideOption: (toolId: string, optionId: string) => void;
}

const AiToolsTransferColumn: React.FC<AiToolsTransferColumnProps> = ({
    label,
    items,
    platform,
    primaryActionLabel,
    secondaryActionLabel,
    onPrimaryAction,
    onSecondaryAction,
    onOverrideOption,
}) => {
    const [checkedItems, setCheckedItems] = useState<SelectedAiTool[]>([]);

    return (
        <div>
            <h3>{label}</h3>
            <Button
                text={primaryActionLabel}
                onClick={() => onPrimaryAction(items)}
                variant="dashed"
                colorStyle="primary-color"
            />
            <Button
                text={secondaryActionLabel}
                onClick={() =>
                    onSecondaryAction(items.filter((i) => checkedItems.some((c) => c.tool.id === i.tool.id)))
                }
                variant="dashed"
                colorStyle="primary-color"
            />
            <AiToolsTransferTable
                items={items}
                platform={platform}
                onCheckedChange={setCheckedItems}
                onOverrideOption={onOverrideOption}
            />
        </div>
    );
};

export default React.memo(AiToolsTransferColumn);
