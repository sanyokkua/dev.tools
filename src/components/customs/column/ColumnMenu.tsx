import { Button, Flex } from '@chakra-ui/react';
import React, { JSX, MouseEventHandler } from 'react';

export type AvailableFunction = { name: string; onClick: () => void };

type FunctionActionButtonProps = { availableFunction: AvailableFunction };

const FunctionActionButton: React.FC<FunctionActionButtonProps> = ({ availableFunction }) => {
    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        availableFunction.onClick();
    };
    const builtId = availableFunction.name.toLowerCase().replace(/\s/g, '-');
    return (
        <Button w="90%" mb="2" variant="subtle" colorPalette={'green'} onClick={handleClick} key={builtId}>
            {availableFunction.name}
        </Button>
    );
};

export type ColumnMenuProps = { availableFunctions: AvailableFunction[] };

const ColumnMenu: React.FC<ColumnMenuProps> = (props) => {
    const toolsButtons: JSX.Element[] = props.availableFunctions.map((tool) => {
        return <FunctionActionButton key={tool.name} availableFunction={tool} />;
    });
    return (
        <Flex
            w='full'
            h="full"
            direction="column"
            pt="1"
            alignItems="center"
            colorPalette={'green'}
            bg={{ base: 'green.50' }}
            color="white"
        >
            {toolsButtons}
        </Flex>
    );
};

export default ColumnMenu;
