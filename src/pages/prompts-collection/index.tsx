import { Prompt } from '@/common/prompts/prompts';
import { promptsLibraryList } from '@/common/prompts/prompts-library';
import { usePage } from '@/contexts/PageContext';
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
        <div>
            <h1>Prompts Collection</h1>
            <p>
                Welcome to your Prompts Collection. Here you can find the prompt and copy it&#39;s template or open it
                on the new page with details and additional functionality
            </p>
            <PromptsCollectionView prompts={prompts} />
        </div>
    );
};

// Fetch all prompts at build time
export async function getStaticProps() {
    return { props: { prompts: promptsLibraryList } };
}

export default IndexPage;
