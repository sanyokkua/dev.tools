import React, { useEffect, useMemo } from 'react';

import { usePage } from '@/contexts/PageContext';

import { createEncodingDecodingUtilList } from '@/common/utils-factory';
import ToolAbout from '@/controls/ToolAbout';
import ToolView, { ToolViewFunctionGroups, ToolViewGroup } from '../../components/elements/column/ToolView';

const Home: React.FC = () => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('Encoding Tools');
    }, [setPageTitle]);

    // Memoize the tool groups to prevent recreation on every render
    const toolsGroups = useMemo(() => {
        const groupsMap: ToolViewFunctionGroups = new Map();

        createEncodingDecodingUtilList().forEach((tool) => {
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
            <ToolAbout routeKey="encoding-tools" title="Encoding Tools">
                Encode and decode text using Base64, URL encoding, and HTML entities.
            </ToolAbout>
            <ToolView searchable toolChoseHeader="Select Mode" toolViewFunctionGroups={toolsGroups} />
        </div>
    );
};

export default Home;
