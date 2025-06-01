import CodeEditorComponent from '@/components/elements/editor/CodeEditorComponent';
import { usePage } from '@/contexts/PageContext';
import { useEffect } from 'react';

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Code Editor');
    }, [setPageTitle]);

    return <CodeEditorComponent />;
};

export default IndexPage;
