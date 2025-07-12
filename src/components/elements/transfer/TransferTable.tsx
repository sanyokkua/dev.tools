import ScrollableContentContainer from '@/layouts/ScrollableContentContainer';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

export interface TableItem {
    id: string;
    name: string;
    category: string;
    description: string;
    checked: boolean;
}

interface Props {
    items: TableItem[];
    onChange: (items: TableItem[]) => void;
}

/**
 * A functional React component that renders a table with checkboxes for selecting multiple items.
 *
 * @param props - The properties to configure the TransferTable component.
 * @param props.items - An array of item objects, each containing an `id`, `name`, `category`, `description`, and `checked` property.
 * @param props.onChange - A callback function triggered when the checked state of any item changes. It receives the updated items as its argument.
 *
 * The component maintains a header checkbox that allows users to select or deselect all items in the list.
 * The indeterminate state is applied to the header checkbox if some, but not all, items are selected.
 */
const TransferTable: React.FC<Props> = ({ items, onChange }) => {
    const headerRef = useRef<HTMLInputElement>(null);
    const allChecked = useMemo(() => items.every((i) => i.checked), [items]);
    const someChecked = useMemo(() => items.some((i) => i.checked), [items]);

    useEffect(() => {
        if (headerRef.current) headerRef.current.indeterminate = !allChecked && someChecked;
    }, [allChecked, someChecked]);

    const toggleAll = useCallback(
        (checked: boolean) => onChange(items.map((i) => ({ ...i, checked }))),
        [items, onChange],
    );
    const toggleOne = useCallback(
        (id: string) => onChange(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))),
        [items, onChange],
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
                        <th className="transfer-th-td">ID</th>
                        <th className="transfer-th-td">Name</th>
                        <th className="transfer-th-td">Category</th>
                        <th className="transfer-th-td">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((it) => (
                        <tr key={it.id}>
                            <td className="transfer-th-td">
                                <input type="checkbox" checked={it.checked} onChange={() => toggleOne(it.id)} />
                            </td>
                            <td className="transfer-th-td">{it.id}</td>
                            <td className="transfer-th-td">{it.name}</td>
                            <td className="transfer-th-td">{it.category}</td>
                            <td className="transfer-th-td">{it.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </ScrollableContentContainer>
    );
};

export default React.memo(TransferTable);
