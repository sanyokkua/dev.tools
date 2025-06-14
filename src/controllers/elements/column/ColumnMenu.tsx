import React, { JSX } from 'react';
import Button from '../../../custom-components/controls/Button';

export type AvailableFunction = { name: string; onClick: () => void };

type FunctionActionButtonProps = { availableFunction: AvailableFunction };

const FunctionActionButton: React.FC<FunctionActionButtonProps> = ({ availableFunction }) => {
    const handleClick = () => {
        console.log('FunctionActionButton click');
        availableFunction.onClick();
    };
    const builtId = availableFunction.name.toLowerCase().replace(/\s/g, '-');
    return (
        <Button
            text={availableFunction.name}
            onClick={handleClick}
            key={builtId}
            variant={'solid'}
            block={true}
            size={'default'}
            colorStyle={'primary-color'}
        />
    );
};

export type ColumnMenuProps = { availableFunctions: AvailableFunction[] };

const ColumnMenu: React.FC<ColumnMenuProps> = (props) => {
    const toolsButtons: JSX.Element[] = props.availableFunctions.map((tool) => {
        return <FunctionActionButton key={tool.name} availableFunction={tool} />;
    });
    return <>{toolsButtons}</>;
};

export default ColumnMenu;
