import { Application, Command, OSType } from '@/common/types';
import { getCommandBuilder } from '@/common/utils-factory';
import { SelectItem } from '@/controls/Select';
import { DEFAULT_CATEGORY } from '@/elements/transfer/helpers';
import { TableItem } from '@/elements/transfer/TransferTable';
import { useCallback, useMemo, useState } from 'react';

interface Filters {
    selectedCategory: SelectItem;
    searchTerm: string;
}

interface Handlers {
    setCategory: (cat: SelectItem) => void;
    setSearch: (term: string) => void;
    reset: () => void;
    build: () => void;
    add: (items: TableItem[]) => void;
    remove: (items: TableItem[]) => void;
}

type UseTransferRetType = {
    availableItems: TableItem[];
    selectedItems: TableItem[];
    commands: Command[];
    combinedCommand: Command | null;
    filters: Filters;
    handlers: Handlers;
};

export default function useTransfer(source: Application[], osType: OSType): UseTransferRetType {
    const [selectedCategory, setCategory] = useState<SelectItem>(DEFAULT_CATEGORY);
    const [searchTerm, setSearch] = useState<string>('');
    const [selected, setSelected] = useState<Application[]>([]);
    const [commands, setCommands] = useState<Command[]>([]);
    const [combined, setCombined] = useState<Command | null>(null);

    const availableItems = useMemo(() => {
        const lower = searchTerm.toLowerCase();
        return source
            .sort((a, b) => a.id.localeCompare(b.id))
            .filter((app) => {
                const inCat =
                    selectedCategory.itemId === DEFAULT_CATEGORY.itemId ||
                    app.category === selectedCategory.displayText;
                const matches = app.name.toLowerCase().includes(lower);
                const notYet = !selected.some((s) => s.id === app.id);
                return inCat && matches && notYet;
            });
    }, [source, selectedCategory, searchTerm, selected]);

    const selectedItems = useMemo(
        () => selected.map((app) => ({ ...app, checked: false }) as TableItem).sort((a, b) => a.id.localeCompare(b.id)),
        [selected],
    );

    const add = useCallback(
        (items: TableItem[]) => {
            setSelected((prev) => [...prev, ...items.map((i) => source.find((s) => s.id === i.id)!)]);
        },
        [source],
    );

    const remove = useCallback((items: TableItem[]) => {
        setSelected((prev) => prev.filter((app) => !items.some((i) => i.id === app.id)));
    }, []);

    const reset = useCallback(() => {
        setCategory(DEFAULT_CATEGORY);
        setSearch('');
        setSelected([]);
        setCommands([]);
        setCombined(null);
    }, []);

    const build = useCallback(() => {
        const builder = getCommandBuilder(osType);
        const cmds = selected.map(builder);
        setCommands(cmds);
        setCombined({ name: 'Install All Brew Apps', command: cmds.map((c) => c.command).join(' && ') });
    }, [osType, selected]);

    return {
        availableItems: availableItems.map((app) => ({ ...app, checked: false }) as TableItem),
        selectedItems,
        commands,
        combinedCommand: combined,
        filters: { selectedCategory, searchTerm },
        handlers: { setCategory, setSearch, reset, build, add, remove },
    };
}
