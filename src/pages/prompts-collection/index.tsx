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
            <ToolAbout routeKey="prompts-collection">
                Browse a curated library of reusable LLM prompts, filter by category/type/tag, and open one to fill its
                parameters and build the final text. System and parametrized user prompts are included; the template and
                parameter fields auto-grow as you type. Copy the raw or filled prompt.
            </ToolAbout>
            <PromptsCollectionView prompts={prompts} />
        </div>
    );
};

export async function getStaticProps(): Promise<{ props: { prompts: Prompt[] } }> {
    return { props: { prompts: promptsLibraryList } };
}

export default IndexPage;
