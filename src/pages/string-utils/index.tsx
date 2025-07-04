'use client';
import { createStringUtilList } from '@/common/utils-factory';
import { usePage } from '@/contexts/PageContext';
import ToolView, { ToolViewFunctionGroups, ToolViewGroup } from '@/modules/ui/elements/column/ToolView';
import { useEffect, useMemo } from 'react';

const IndexPage = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('String Utilities Page');
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
                    func: (text, onSuccess, onFailure) => {
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

    return <ToolView toolChoseHeader="Select Utils" toolViewFunctionGroups={toolsGroups} />;
};

export default IndexPage;
