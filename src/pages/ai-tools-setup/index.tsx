import { usePage } from '@/contexts/PageContext';
import AiToolsSetup from '@/page-specific/ai-tools-setup/AiToolsSetup';
import React, { useEffect } from 'react';

const AiToolsSetupPage = (): React.JSX.Element => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('AI Tools Setup');
    }, [setPageTitle]);

    return (
        <div>
            <h1>AI Tools Setup</h1>
            <AiToolsSetup />
        </div>
    );
};

export default AiToolsSetupPage;
