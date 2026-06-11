import { getOptionsForPlatform, Platform, SelectedAiTool } from '@/common/ai-tools-data';
import Select, { SelectItem } from '@/controls/Select';
import ScrollableContentContainer from '@/layouts/ScrollableContentContainer';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface AiToolsTransferTableProps {
    items: SelectedAiTool[];
    platform: Platform;
    onCheckedChange: (checkedItems: SelectedAiTool[]) => void;
    onOverrideOption: (toolId: string, optionId: string) => void;
}

const AiToolsTransferTable: React.FC<AiToolsTransferTableProps> = ({
    items,
    platform,
    onCheckedChange,
    onOverrideOption,
}) => {
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
    const headerRef = useRef<HTMLInputElement>(null);

    const itemIds = useMemo(() => items.map((i) => i.tool.id).join(','), [items]);
    useEffect(() => {
        setCheckedIds(new Set());
        onCheckedChange([]);
    }, [itemIds]);

    const allChecked = useMemo(
        () => items.length > 0 && items.every((i) => checkedIds.has(i.tool.id)),
        [items, checkedIds],
    );
    const someChecked = useMemo(() => items.some((i) => checkedIds.has(i.tool.id)), [items, checkedIds]);

    useEffect(() => {
        if (headerRef.current) headerRef.current.indeterminate = !allChecked && someChecked;
    }, [allChecked, someChecked]);

    const toggleAll = useCallback(
        (checked: boolean) => {
            const newCheckedIds = checked ? new Set(items.map((i) => i.tool.id)) : new Set<string>();
            setCheckedIds(newCheckedIds);
            onCheckedChange(checked ? [...items] : []);
        },
        [items, onCheckedChange],
    );

    const toggleOne = useCallback(
        (toolId: string) => {
            const next = new Set(checkedIds);
            if (next.has(toolId)) next.delete(toolId);
            else next.add(toolId);
            setCheckedIds(next);
            onCheckedChange(items.filter((i) => next.has(i.tool.id)));
        },
        [checkedIds, items, onCheckedChange],
    );

    if (items.length === 0) return <p>No items found.</p>;

    return (
        <ScrollableContentContainer>
            <table className="transfer-table">
                <thead>
                    <tr>
                        <th className="transfer-th-td">
                            <input
                                ref={headerRef}
                                type="checkbox"
                                checked={allChecked}
                                onChange={(e) => toggleAll(e.target.checked)}
                            />
                        </th>
                        <th className="transfer-th-td">Tool</th>
                        <th className="transfer-th-td">Category</th>
                        <th className="transfer-th-td">Install via</th>
                        <th className="transfer-th-td">Links</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        const { tool } = item;
                        const options = getOptionsForPlatform(tool, platform);
                        const { website, github, homebrew, npm, docs } = tool.links;
                        return (
                            <tr key={tool.id}>
                                <td className="transfer-th-td">
                                    <input
                                        type="checkbox"
                                        checked={checkedIds.has(tool.id)}
                                        onChange={() => toggleOne(tool.id)}
                                    />
                                </td>
                                <td className="transfer-th-td">
                                    <strong>{tool.name}</strong>
                                    <br />
                                    <small>{tool.description}</small>
                                </td>
                                <td className="transfer-th-td">{tool.category}</td>
                                <td className="transfer-th-td">
                                    <Select
                                        items={options.map(
                                            (opt): SelectItem => ({ itemId: opt.id, displayText: opt.label }),
                                        )}
                                        selectedItem={item.selectedOptionId}
                                        onSelect={(si) => onOverrideOption(tool.id, si.itemId)}
                                        colorStyle="primary-color"
                                        size="small"
                                    />
                                </td>
                                <td className="transfer-th-td">
                                    <div className="tool-link-badges">
                                        {website && (
                                            <a
                                                href={website}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="tool-link-badge"
                                            >
                                                Web
                                            </a>
                                        )}
                                        {github && (
                                            <a
                                                href={github}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="tool-link-badge"
                                            >
                                                GH
                                            </a>
                                        )}
                                        {homebrew && (
                                            <a
                                                href={homebrew}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="tool-link-badge"
                                            >
                                                Brew
                                            </a>
                                        )}
                                        {npm && (
                                            <a href={npm} target="_blank" rel="noreferrer" className="tool-link-badge">
                                                npm
                                            </a>
                                        )}
                                        {docs && (
                                            <a href={docs} target="_blank" rel="noreferrer" className="tool-link-badge">
                                                Docs
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </ScrollableContentContainer>
    );
};

export default React.memo(AiToolsTransferTable);
