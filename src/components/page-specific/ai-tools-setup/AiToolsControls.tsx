import { AiToolCategory, MethodFilter, Platform } from '@/common/ai-tools-data';
import Button from '@/controls/Button';
import Input from '@/controls/Input';
import Select, { SelectItem } from '@/controls/Select';
import React from 'react';

interface AiToolsControlsProps {
    platform: Platform | null;
    methodFilter: MethodFilter;
    categoryFilter: AiToolCategory | '';
    searchTerm: string;
    canBuild: boolean;
    onSetPlatform: (p: Platform) => void;
    onSetMethodFilter: (f: MethodFilter) => void;
    onSetCategoryFilter: (c: AiToolCategory | '') => void;
    onSetSearchTerm: (s: string) => void;
    onReset: () => void;
    onBuild: () => void;
}

const METHOD_FILTER_ITEMS: SelectItem[] = [
    { itemId: 'both', displayText: 'Both (default)' },
    { itemId: 'platform-specific', displayText: 'Platform-specific' },
    { itemId: 'platform-independent', displayText: 'Platform-independent' },
];

const CATEGORY_FILTER_ITEMS: SelectItem[] = [
    { itemId: '', displayText: 'All Categories' },
    ...Object.values(AiToolCategory).map((c) => ({ itemId: c, displayText: c })),
];

const AiToolsControls: React.FC<AiToolsControlsProps> = ({
    platform,
    methodFilter,
    categoryFilter,
    searchTerm,
    canBuild,
    onSetPlatform,
    onSetMethodFilter,
    onSetCategoryFilter,
    onSetSearchTerm,
    onReset,
    onBuild,
}) => (
    <div className="transfer-filters">
        <div className="filter-group">
            <span className="filter-label">Platform</span>
            <div className="platform-selector">
                <Button
                    text="macOS"
                    variant="outlined"
                    colorStyle={platform === 'macos' ? 'primary-color' : 'tertiary-color'}
                    onClick={() => onSetPlatform('macos')}
                />
                <Button
                    text="Linux"
                    variant="outlined"
                    colorStyle={platform === 'linux' ? 'primary-color' : 'tertiary-color'}
                    onClick={() => onSetPlatform('linux')}
                />
                <Button
                    text="Windows"
                    variant="outlined"
                    colorStyle={platform === 'windows' ? 'primary-color' : 'tertiary-color'}
                    onClick={() => onSetPlatform('windows')}
                />
            </div>
        </div>
        <div className="filter-group">
            <span className="filter-label">Install method</span>
            <Select
                items={METHOD_FILTER_ITEMS}
                selectedItem={methodFilter}
                onSelect={(item) => onSetMethodFilter(item.itemId as MethodFilter)}
                colorStyle="primary-color"
            />
        </div>
        <div className="filter-group">
            <span className="filter-label">Category</span>
            <Select
                items={CATEGORY_FILTER_ITEMS}
                selectedItem={categoryFilter}
                onSelect={(item) => onSetCategoryFilter(item.itemId as AiToolCategory | '')}
                colorStyle="primary-color"
            />
        </div>
        <div className="filter-group">
            <span className="filter-label">Search</span>
            <Input
                placeholder="Search tools…"
                value={searchTerm}
                onChange={onSetSearchTerm}
                variant="outlined"
                colorStyle="primary-color"
            />
        </div>
        <div className="filter-actions">
            <Button text="Reset" variant="outlined" colorStyle="error-color" onClick={onReset} />
            <Button
                text="Build Script"
                variant="solid"
                colorStyle="primary-color"
                onClick={onBuild}
                disabled={!canBuild}
            />
        </div>
    </div>
);

export default React.memo(AiToolsControls);
