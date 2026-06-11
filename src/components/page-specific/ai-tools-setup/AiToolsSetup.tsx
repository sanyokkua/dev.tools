import CodeSnippet from '@/elements/CodeSnippet';
import RoundedContainer from '@/layouts/RoundedContainer';
import React from 'react';
import AiToolsControls from './AiToolsControls';
import AiToolsTransferColumns from './AiToolsTransferColumns';
import useAiToolsTransfer from './useAiToolsTransfer';

const AiToolsSetup: React.FC = () => {
    const { state, handlers } = useAiToolsTransfer();

    return (
        <RoundedContainer>
            <AiToolsControls
                platform={state.platform}
                methodFilter={state.methodFilter}
                categoryFilter={state.categoryFilter}
                searchTerm={state.searchTerm}
                canBuild={state.canBuild}
                onSetPlatform={handlers.setPlatform}
                onSetMethodFilter={handlers.setMethodFilter}
                onSetCategoryFilter={handlers.setCategoryFilter}
                onSetSearchTerm={handlers.setSearchTerm}
                onReset={handlers.reset}
                onBuild={handlers.build}
            />

            {state.commands.length === 0 ? (
                state.platform !== null ? (
                    <AiToolsTransferColumns
                        available={state.available}
                        selected={state.selected}
                        platform={state.platform}
                        onAdd={handlers.add}
                        onRemove={handlers.remove}
                        onOverrideOption={handlers.overrideOption}
                    />
                ) : (
                    <p>Select a platform above to get started.</p>
                )
            ) : (
                <>
                    <h3>All-in-One Command</h3>
                    <CodeSnippet
                        content={state.combined!.command}
                        headerText={state.combined!.description}
                        language="shell"
                    />
                    <h3>Individual Commands</h3>
                    {state.commands.map((cmd) => (
                        <CodeSnippet
                            key={cmd.description}
                            content={cmd.command}
                            headerText={cmd.description}
                            language="shell"
                        />
                    ))}
                </>
            )}
        </RoundedContainer>
    );
};

export default React.memo(AiToolsSetup);
