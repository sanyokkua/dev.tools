import CodeEditorComponent from '@/components/customs/editor/CodeEditorComponent';
import { usePage } from '@/contexts/PageContext';
import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('Code Editor');
    }, [setPageTitle]);

    return (
        <Box>
            <CodeEditorComponent editorHeader={"Editor"} />
        </Box>
    );
};

export default IndexPage;
