import Button from '@/controls/Button';
import React, { useEffect, useState } from 'react';
import TransferTable, { TableItem } from './TransferTable';

interface Props {
    header: string;
    primaryAction: string;
    secondaryAction: string;
    items: TableItem[];
    onAction: (items: TableItem[]) => void;
}

/**
 * TransferColumn component renders a column header along with two actions and a transfer table.
 *
 * This component is responsible for rendering a UI section that allows users to perform
 * primary and secondary actions on a set of items. It maintains its own internal state which
 * mirrors the provided `items` prop, ensuring consistency when external changes occur.
 *
 * The component uses the following props:
 * - header: Text displayed as a heading within the column.
 * - primaryAction: Label for the button that triggers an action using all local items.
 * - secondaryAction: Label for the button that triggers an action using only checked items from the local state.
 * - items: Initial list of table items passed in as props. The component subscribes to changes
 *   on this prop and updates its internal state accordingly.
 * - onAction: Callback function invoked with a subset of `items` when an action button is clicked.
 *
 * Behavior:
 * - The internal local state is synchronized with the incoming `items` prop via useEffect,
 *   ensuring that any external update to items triggers a re-render with updated data.
 * - On clicking the primary action button, the entire current list of items in the component's
 *   state is passed to the onAction callback.
 * - The secondary action button filters the local state for checked items (i.e., those where item.checked
 *   evaluates as truthy) before passing this filtered list to the onAction callback.
 *
 * Usage:
 * This component should be used in contexts where a transferable set of items needs to be manipulated,
 * with distinct actions applied either to all items or only to selected items.
 */
const TransferColumn: React.FC<Props> = ({ header, primaryAction, secondaryAction, items, onAction }) => {
    const [local, setLocal] = useState<TableItem[]>(items);

    useEffect(() => {
        setLocal(items);
    }, [items]);

    const handlePrimary = () => onAction(local);
    const handleSecondary = () => onAction(local.filter((i) => i.checked));

    return (
        <div>
            <h3>{header}</h3>
            <Button text={primaryAction} onClick={handlePrimary} variant="dashed" colorStyle="primary-color" />
            <Button text={secondaryAction} onClick={handleSecondary} variant="dashed" colorStyle="primary-color" />
            <TransferTable items={local} onChange={setLocal} />
        </div>
    );
};

export default React.memo(TransferColumn);
