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
            <ToolAbout routeKey="string-utils" title="String Utilities">
                A collection of string manipulation tools: case conversion, URL slugify, line and whitespace operations,
                and more.
            </ToolAbout>
            <ToolView searchable showCharCount toolChoseHeader="Select Utils" toolViewFunctionGroups={toolsGroups} />
        </div>
    );
};

export default IndexPage;
