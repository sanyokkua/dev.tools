'use client';
import { createJsonFormatter } from '@/common/utils-factory';
import { usePage } from '@/contexts/PageContext';
import React, { useEffect, useMemo } from 'react';
import ToolView, { ToolViewFunctionGroups, ToolViewGroup } from '../../components/elements/column/ToolView';

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

    return <ToolView toolChoseHeader="Json Formatter" toolViewFunctionGroups={toolsGroups} toolEditorsLangId="json" />;
};

export default IndexPage;
