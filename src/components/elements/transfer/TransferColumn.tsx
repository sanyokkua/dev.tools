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
