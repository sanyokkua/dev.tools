import { saveTextFile } from '@/common/file-utils';
import { MAC_OS_BREW_APPS } from '@/common/macos-utils';
import CodeSnippet from '@/elements/CodeSnippet';
import TransferColumns from '@/elements/transfer/TransferColumns';
import TransferControls from '@/elements/transfer/TransferControls';
import useTransfer from '@/elements/transfer/useTransfer';
import RoundedContainer from '@/layouts/RoundedContainer';
import useBrewMaintenance from '@/page-specific/mac-os-cheat-sheet/useBrewMaintenance';
import React from 'react';

const BrewInstallApplications: React.FC = () => {
    const { availableItems, selectedItems, commands, combinedCommand, filters, handlers } = useTransfer(
        MAC_OS_BREW_APPS,
        'macos',
    );
    const { updateScript, upgradeScript } = useBrewMaintenance(selectedItems);

    return (
        <div>
            <h2>5. Install Applications</h2>
            <p>
                Use &#34;brew install&#34; to add your favorite applications. Below you can chose apps from the table
                and generate installation scripts:
            </p>

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

                        {updateScript && (
                            <>
                                <h3>Brew Formula Update Script</h3>
                                <CodeSnippet
                                    content={updateScript}
                                    headerText="brew-update.sh"
                                    language="bash"
                                    onDownload={() =>
                                        saveTextFile({
                                            fileName: 'brew-update',
                                            fileExtension: '.sh',
                                            fileMimeType: 'text/x-shellscript',
                                            fileContent: updateScript,
                                        })
                                    }
                                />
                            </>
                        )}

                        {upgradeScript && (
                            <>
                                <h3>Brew Cask Upgrade Script</h3>
                                <CodeSnippet
                                    content={upgradeScript}
                                    headerText="brew-upgrade.sh"
                                    language="bash"
                                    onDownload={() =>
                                        saveTextFile({
                                            fileName: 'brew-upgrade',
                                            fileExtension: '.sh',
                                            fileMimeType: 'text/x-shellscript',
                                            fileContent: upgradeScript,
                                        })
                                    }
                                />
                            </>
                        )}
                    </>
                )}
            </RoundedContainer>
        </div>
    );
};

export default BrewInstallApplications;
