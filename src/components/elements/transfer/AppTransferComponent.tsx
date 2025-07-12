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

/**
 * A React functional component that manages the transfer of items between different categories.
 *
 * @param props - The properties passed to the component
 * @param props.items - The list of items available for transfer
 * @param props.osType - The operating system type affecting item availability and commands
 * @returns A container element with transfer controls, columns, or command outputs based on state
 *
 * This component renders a comprehensive interface for transferring items between categories,
 * supporting both basic transfer operations and generating installation commands.
 */
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
