import { Prompt } from '@/common/prompts/prompts';
import { promptsLibraryList } from '@/common/prompts/prompts-library';
import { usePage } from '@/contexts/PageContext';
import ToolAbout from '@/controls/ToolAbout';
import PromptsCollectionView from '@/page-specific/prompts-collection/PromptsCollectionView';
import React, { useEffect } from 'react';

interface Props {
    prompts: Prompt[];
}

const IndexPage: React.FC<Props> = ({ prompts }) => {
    const { setPageTitle } = usePage();

    useEffect(() => {
        setPageTitle('Prompts Collection');
    }, [setPageTitle]);

    return (
        <div className="prompts-page">
            <ToolAbout routeKey="prompts-collection" title="Prompts Collection">
                Browse and customize a library of AI prompts for coding, writing, and analysis.
            </ToolAbout>
            <PromptsCollectionView prompts={prompts} />
        </div>
    );
};

export async function getStaticProps(): Promise<{ props: { prompts: Prompt[] } }> {
    return { props: { prompts: promptsLibraryList } };
}

export default IndexPage;
