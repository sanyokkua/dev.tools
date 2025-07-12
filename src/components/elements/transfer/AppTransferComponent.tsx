import { Application, OSType } from '@/common/types';
import CodeSnippet from '@/elements/CodeSnippet';
import React from 'react';

import TransferColumns from '@/elements/transfer/TransferColumns';
import TransferControls from '@/elements/transfer/TransferControls';
import useTransfer from '@/elements/transfer/useTransfer';
import RoundedContainer from '@/layouts/RoundedContainer';

interface Props {
    items: Application[];
    osType: OSType;
}

const AppTransferComponent: React.FC<Props> = ({ items, osType }) => {
    const { availableItems, selectedItems, commands, combinedCommand, filters, handlers } = useTransfer(items, osType);

    return (
        <RoundedContainer>
            <TransferControls
                selectedCategory={filters.selectedCategory}
                searchTerm={filters.searchTerm}
                setCategory={handlers.setCategory}
                setSearch={handlers.setSearch}
                reset={handlers.reset}
                build={handlers.build}
            />

            {commands.length === 0 ? (
                <TransferColumns
                    available={availableItems}
                    selected={selectedItems}
                    onAdd={handlers.add}
                    onRemove={handlers.remove}
                />
            ) : (
                <>
                    <h3>All-in-One Command</h3>
                    <CodeSnippet
                        content={combinedCommand!.command}
                        headerText={combinedCommand!.description}
                        language="shell"
                    />

                    <h3>Individual Commands</h3>
                    {commands.map((cmd) => (
                        <CodeSnippet
                            key={cmd.description}
                            content={cmd.command}
                            headerText={`Install ${cmd.description}`}
                            language="shell"
                        />
                    ))}
                </>
            )}
        </RoundedContainer>
    );
};

export default React.memo(AppTransferComponent);
