import { AvailableFunction } from '@/components/customs/column/ColumnMenu';
import ColumnView from '@/components/customs/column/ColumnView';
import { MenuBuilder } from '@/components/customs/PageMenuBar';
import { usePage } from '@/contexts/PageContext';
import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';

const IndexPage = () => {
    const { setPageTitle } = usePage();
    useEffect(() => {
        setPageTitle('String Utilities Page');
    }, [setPageTitle]);

    const availableFunctions: AvailableFunction[] = [
        {
            name: 'Format Camel',
            onClick: () => {
                console.log('Clicked Format Camel');
            },
        },
    ];
    const menuLeft = MenuBuilder.newBuilder()
        .addButton('Open File', 'open-file', () => {})
        .addButton('Paste', 'paste-from-clipboard', () => {})
        .addButton('Copy', 'copy-to-clipboard', () => {})
        .addButton('Clear', 'clear', () => {})
        .build();
    const menuRight = MenuBuilder.newBuilder()
        .addButton('Copy', 'copy-to-clipboard', () => {})
        .addButton('Clear', 'clear', () => {})
        .build();

    return (
        <Box>
            <ColumnView
                leftEditorMenu={menuLeft}
                leftEditor={{ minimap: false }}
                selectedItem={{ value: 'hello', label: 'Hello World' }}
                selectItems={[
                    { value: 'hello', label: 'Hello World' },
                    { value: 'hello2', label: 'Hello World 2' },
                ]}
                onSelectItem={(item) => {
                    console.log(item);
                }}
                rightEditorMenu={menuRight}
                rightEditor={{ minimap: false, isReadOnly: true }}
                functions={{ availableFunctions: availableFunctions }}
            />
        </Box>
    );
};

export default IndexPage;
