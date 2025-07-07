'use client';
import React, { useEffect, useMemo } from 'react';

import { usePage } from '@/contexts/PageContext';

import { createHashingUtils } from '@/common/utils-factory';
import ToolView, { ToolViewFunctionGroups, ToolViewGroup } from '../../components/elements/column/ToolView';

const Home: React.FC = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('Hashing Utilities');
    }, [setPageTitle]);

    // Memoize the tool groups to prevent recreation on every render
    const toolsGroups = useMemo(() => {
        const groupsMap: ToolViewFunctionGroups = new Map();

        const iHashUtils = createHashingUtils();
        const toolGroup: ToolViewGroup = {
            funcGroupId: 'hashing-utils',
            funcGroupName: 'Hashing Utils',
            functions: iHashUtils.map((func) => ({
                funcId: func.toolId,
                funcName: func.textToDisplay,
                funcDescription: func.description,
                func: (text, onSuccess, onFailure) => {
                    const result = func.toolFunction(text);
                    result
                        .then((result) => {
                            onSuccess(result);
                        })
                        .catch((e: unknown) => {
                            onFailure(e);
                        });
                },
            })),
        };
        groupsMap.set('hashing-utils', toolGroup);

        return groupsMap;
    }, []);

    return <ToolView toolChoseHeader="Select Hashing Alg" toolViewFunctionGroups={toolsGroups} />;
};

export default Home;
