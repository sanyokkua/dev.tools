'use client';
import { createJsonFormatter } from '@/common/utils-factory';
import { usePage } from '@/contexts/PageContext';
import ToolView, { ToolViewFunctionGroups, ToolViewGroup } from '@/modules/ui/elements/column/ToolView';
import React, { useEffect, useMemo } from 'react';

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('Code Formatter');
    }, [setPageTitle]);

    // Memoize the tool groups to prevent recreation on every render
    const toolsGroups = useMemo(() => {
        const groupsMap: ToolViewFunctionGroups = new Map();

        const formatterTools = createJsonFormatter();
        const toolGroup: ToolViewGroup = {
            funcGroupId: 'formatter-utils',
            funcGroupName: 'Code Formatters',
            functions: formatterTools.map((func) => ({
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
        groupsMap.set('hashing-utils', toolGroup);

        return groupsMap;
    }, []);

    return <ToolView toolChoseHeader="Code Formatters" toolViewFunctionGroups={toolsGroups} />;
};

export default IndexPage;
