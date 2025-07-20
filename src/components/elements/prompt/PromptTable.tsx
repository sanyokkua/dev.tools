import { Prompt } from '@/common/prompts/prompts';
import Button from '@/controls/Button';
import ScrollableContentContainer from '@/layouts/ScrollableContentContainer';
import React from 'react';

interface Props {
    items: Prompt[];
    onCopyClicked: (prompt: Prompt) => void;
    onShowClicked: (prompt: Prompt) => void;
    onOpenClicked: (prompt: Prompt) => void;
}

const PromptTable: React.FC<Props> = ({ items, onCopyClicked, onShowClicked, onOpenClicked }) => {
    if (items.length === 0) {
        return <p>No items found.</p>;
    }

    return (
        <ScrollableContentContainer>
            <table className="transfer-table">
                <thead>
                    <tr>
                        <th className="transfer-th-td">Type</th>
                        <th className="transfer-th-td">Category</th>
                        <th className="transfer-th-td">Description</th>
                        <th className="transfer-th-td">Tags</th>
                        <th className="transfer-th-td">Copy Raw</th>
                        <th className="transfer-th-td">Show</th>
                        <th className="transfer-th-td">Open In New Tab</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((it) => (
                        <tr key={it.description}>
                            <td className="transfer-th-td">{it.type}</td>
                            <td className="transfer-th-td">{it.category}</td>
                            <td className="transfer-th-td">{it.description}</td>
                            <td className="transfer-th-td">{it.tags.join(', ')}</td>
                            <td className="transfer-th-td">
                                <Button
                                    text={'Copy'}
                                    onClick={() => {
                                        onCopyClicked(it);
                                    }}
                                    variant={'solid'}
                                    colorStyle={'primary-color'}
                                    size={'small'}
                                />
                            </td>
                            <td className="transfer-th-td">
                                <Button
                                    text={'Show'}
                                    onClick={() => {
                                        onShowClicked(it);
                                    }}
                                    variant={'dashed'}
                                    colorStyle={'primary-color'}
                                    size={'small'}
                                />
                            </td>
                            <td className="transfer-th-td">
                                <Button
                                    text={'Open'}
                                    onClick={() => {
                                        onOpenClicked(it);
                                    }}
                                    variant={'link'}
                                    colorStyle={'primary-color'}
                                    size={'small'}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </ScrollableContentContainer>
    );
};

export default React.memo(PromptTable);
