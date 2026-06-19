import { usePage } from '@/contexts/PageContext';
import ToolAbout from '@/controls/ToolAbout';
import PromptsCollectionView from '@/page-specific/prompts-collection/PromptsCollectionView';
import React, { useEffect } from 'react';

const IndexPage: React.FC = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Prompts Collection');
    }, [setPageTitle]);
    return (
        <div className="prompts-page">
            <ToolAbout routeKey="prompts-collection">
                Browse a curated library of reusable LLM prompts with variants, fill parameters, and copy. Includes a
                skills catalog with per-agent install instructions.
            </ToolAbout>
            <PromptsCollectionView />
        </div>
    );
};

export default IndexPage;
