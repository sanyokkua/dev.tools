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
            <div className="prompts-page-about">
                <ToolAbout routeKey="prompts-collection">
                    Browse prompts organized by domain and category. Fill editable parameters — predefined picks or free
                    text — switch between chat and agent variants, copy filled prompts or raw templates, and share
                    stable deep links. Includes a browse-all catalog and a skills library with per-agent install guides
                    and file downloads.
                </ToolAbout>
            </div>
            <PromptsCollectionView />
        </div>
    );
};

export default IndexPage;
