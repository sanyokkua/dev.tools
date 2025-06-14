import { usePage } from '@/contexts/PageContext';
import { useEffect } from 'react';
import CodeEditorComponent from '../../controllers/elements/editor/CodeEditorComponent';

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Code Editor');
    }, [setPageTitle]);

    return <CodeEditorComponent />;
};

export default IndexPage;
