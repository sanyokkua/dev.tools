import {
    AI_TOOLS,
    AiTool,
    AiToolCategory,
    buildInstallCommand,
    filterTools,
    getDefaultOption,
    MethodFilter,
    Platform,
    SelectedAiTool,
} from '@/common/ai-tools-data';
import { useCallback, useMemo, useState } from 'react';

interface Command {
    description: string;
    command: string;
}

export interface AiToolsTransferState {
    platform: Platform | null;
    methodFilter: MethodFilter;
    categoryFilter: AiToolCategory | '';
    searchTerm: string;
    available: SelectedAiTool[];
    selected: SelectedAiTool[];
    commands: Command[];
    combined: Command | null;
    canBuild: boolean;
}

export interface AiToolsTransferHandlers {
    setPlatform: (p: Platform) => void;
    setMethodFilter: (f: MethodFilter) => void;
    setCategoryFilter: (c: AiToolCategory | '') => void;
    setSearchTerm: (s: string) => void;
    add: (tools: SelectedAiTool[]) => void;
    remove: (tools: SelectedAiTool[]) => void;
    overrideOption: (toolId: string, optionId: string) => void;
    build: () => void;
    reset: () => void;
}

export default function useAiToolsTransfer(): { state: AiToolsTransferState; handlers: AiToolsTransferHandlers } {
    const [platform, setPlatformState] = useState<Platform | null>(null);
    const [methodFilter, setMethodFilterState] = useState<MethodFilter>('both');
    const [categoryFilter, setCategoryFilterState] = useState<AiToolCategory | ''>('');
    const [searchTerm, setSearchTermState] = useState<string>('');
    const [selected, setSelected] = useState<SelectedAiTool[]>([]);
    const [commands, setCommands] = useState<Command[]>([]);
    const [combined, setCombined] = useState<Command | null>(null);
    const [optionOverrides, setOptionOverrides] = useState<Map<string, string>>(new Map());

    const available = useMemo<SelectedAiTool[]>(() => {
        if (platform === null) return [];

        const filtered = filterTools(AI_TOOLS, platform, methodFilter);
        const selectedIds = new Set(selected.map((s) => s.tool.id));

        return filtered
            .filter((tool: AiTool) => !selectedIds.has(tool.id))
            .filter((tool: AiTool) => categoryFilter === '' || tool.category === categoryFilter)
            .filter(
                (tool: AiTool) =>
                    searchTerm === '' ||
                    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    tool.description.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .map((tool: AiTool) => ({
                tool,
                selectedOptionId:
                    optionOverrides.get(tool.id) ?? getDefaultOption(tool, platform)?.id ?? tool.installOptions[0].id,
            }))
            .sort((a, b) => a.tool.name.localeCompare(b.tool.name));
    }, [platform, methodFilter, categoryFilter, searchTerm, selected, optionOverrides]);

    const canBuild = platform !== null && selected.length > 0;

    const setPlatform = useCallback((p: Platform) => {
        setPlatformState(p);
        setSelected([]);
        setCommands([]);
        setCombined(null);
        setOptionOverrides(new Map());
    }, []);

    const setMethodFilter = useCallback((f: MethodFilter) => {
        setMethodFilterState(f);
    }, []);

    const setCategoryFilter = useCallback((c: AiToolCategory | '') => {
        setCategoryFilterState(c);
    }, []);

    const setSearchTerm = useCallback((s: string) => {
        setSearchTermState(s);
    }, []);

    const add = useCallback((tools: SelectedAiTool[]) => {
        setSelected((prev) => [...prev, ...tools]);
    }, []);

    const remove = useCallback((tools: SelectedAiTool[]) => {
        const idsToRemove = new Set(tools.map((t) => t.tool.id));
        setSelected((prev) => prev.filter((s) => !idsToRemove.has(s.tool.id)));
    }, []);

    const overrideOption = useCallback((toolId: string, optionId: string) => {
        setOptionOverrides((prev) => {
            const next = new Map(prev);
            next.set(toolId, optionId);
            return next;
        });
        setSelected((prev) => prev.map((s) => (s.tool.id === toolId ? { ...s, selectedOptionId: optionId } : s)));
    }, []);

    const build = useCallback(() => {
        setSelected((currentSelected) => {
            const builtCommands = currentSelected.map(buildInstallCommand);
            setCommands(builtCommands);
            setCombined({
                description: 'Install All AI Tools',
                command: builtCommands.map((c) => c.command).join(' && '),
            });
            return currentSelected;
        });
    }, []);

    const reset = useCallback(() => {
        setCommands([]);
        setCombined(null);
    }, []);

    return {
        state: {
            platform,
            methodFilter,
            categoryFilter,
            searchTerm,
            available,
            selected,
            commands,
            combined,
            canBuild,
        },
        handlers: {
            setPlatform,
            setMethodFilter,
            setCategoryFilter,
            setSearchTerm,
            add,
            remove,
            overrideOption,
            build,
            reset,
        },
    };
}
