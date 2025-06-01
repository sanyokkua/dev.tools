import AppButton from '@/components/ui/AppButton';
import React, { JSX, MouseEventHandler } from 'react';

export type AvailableFunction = { name: string; onClick: () => void };

type FunctionActionButtonProps = { availableFunction: AvailableFunction };

const FunctionActionButton: React.FC<FunctionActionButtonProps> = ({ availableFunction }) => {
    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        console.log('FunctionActionButton click');
        availableFunction.onClick();
    };
    const builtId = availableFunction.name.toLowerCase().replace(/\s/g, '-');
    return <AppButton name={availableFunction.name} onClick={handleClick} key={builtId} className="columnBtn" />;
};

export type ColumnMenuProps = { availableFunctions: AvailableFunction[] };

const ColumnMenu: React.FC<ColumnMenuProps> = (props) => {
    const toolsButtons: JSX.Element[] = props.availableFunctions.map((tool) => {
        return <FunctionActionButton key={tool.name} availableFunction={tool} />;
    });
    return <>{toolsButtons}</>;
};

export default ColumnMenu;
