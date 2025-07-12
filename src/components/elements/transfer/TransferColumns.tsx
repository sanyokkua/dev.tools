import TransferColumn from '@/elements/transfer/TransferColumn';
import { TableItem } from '@/elements/transfer/TransferTable';
import HorizontalContainer from '@/layouts/HorizontalContainer';
import React from 'react';

interface Props {
    available: TableItem[];
    selected: TableItem[];
    onAdd: (items: TableItem[]) => void;
    onRemove: (items: TableItem[]) => void;
}

/**
 * Renders two columns for transferring applications: available apps and selected apps.
 * Each column allows adding and removing applications.
 * @param Props - The props for the TransferColumns component.
 * @param Props.available - An array of available applications.
 * @param Props.selected - An array of selected applications.
 * @param onAdd - A function to handle adding an application.
 * @param onRemove - A function to handle removing an application.
 */
const TransferColumns: React.FC<Props> = ({ available, selected, onAdd, onRemove }) => (
    <HorizontalContainer>
        <TransferColumn
            header="Available Apps"
            primaryAction="Add All"
            secondaryAction="Add Selected"
            items={available}
            onAction={onAdd}
        />
        <TransferColumn
            header="Selected Apps"
            primaryAction="Remove All"
            secondaryAction="Remove Selected"
            items={selected}
            onAction={onRemove}
        />
    </HorizontalContainer>
);

export default React.memo(TransferColumns);
