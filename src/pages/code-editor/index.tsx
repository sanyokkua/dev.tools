import { usePage } from '@/contexts/PageContext';
import CodeEditorComponent from '@/modules/ui/elements/editor/CodeEditorComponent';
import { useEffect } from 'react';

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Code Editor');
    }, [setPageTitle]);

    return <CodeEditorComponent />;
};

export default IndexPage;
