import CodeEditorComponent from '@/components/customs/editor/CodeEditorComponent';
import { Box, Flex, Stack } from '@chakra-ui/react';

const ColumnView = () => {
    return (
        <Flex gap={4}>
            <Box flex="2"  p={4}>
                <CodeEditorComponent editorHeader={'Editor 1'} showInfo={false} showMenu={false} />
            </Box>
            <Box flex="1"  p={4}>
                Hello
            </Box>
            <Box flex="2" p={4}>
                <CodeEditorComponent editorHeader={'Editor 2'} showInfo={false} showMenu={false} />
            </Box>


        </Flex>
    );
};

export default ColumnView;
