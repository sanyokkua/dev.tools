import { createStringUtilList } from '@/common/utils-factory';
import { usePage } from '@/contexts/PageContext';
import ToolAbout from '@/controls/ToolAbout';
import React, { useEffect, useMemo } from 'react';
import ToolView, { ToolViewFunctionGroups, ToolViewGroup } from '../../components/elements/column/ToolView';

const IndexPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('String Utils');
    }, [setPageTitle]);

    // Memoize the tool groups to prevent recreation on every render
    const toolsGroups = useMemo(() => {
        const groupsMap: ToolViewFunctionGroups = new Map();

        createStringUtilList().forEach((tool) => {
            const toolGroup: ToolViewGroup = {
                funcGroupId: tool.toolGroupId,
                funcGroupName: tool.displayName,
                functions: tool.utils.map((func) => ({
                    funcId: func.toolId,
                    funcName: func.textToDisplay,
                    funcDescription: func.description,
                    func: (text, onSuccess, onFailure): void => {
                        try {
                            const result = func.toolFunction(text);
                            onSuccess(result);
                        } catch (e: unknown) {
                            onFailure(e);
                        }
                    },
                })),
            };
            groupsMap.set(tool.toolGroupId, toolGroup);
        });

        return groupsMap;
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <ToolAbout routeKey="string-utils">
                Transform and clean text with 20+ operations — change case (camelCase, snake_case, PascalCase,
                kebab-case, CONSTANT_CASE, Title Case, sentence case), slugify, trim/normalize whitespace, and line
                operations (sort, deduplicate, reverse, shuffle, split/join by delimiter). Paste or open a file on the
                left, pick an operation from the searchable middle panel, and read the result on the right; use{' '}
                <strong>⇄ Use as input</strong> to chain transforms. Everything runs locally in your browser.
            </ToolAbout>
            <ToolView searchable showCharCount toolChoseHeader="Select Utils" toolViewFunctionGroups={toolsGroups} />
        </div>
    );
};

export default IndexPage;
