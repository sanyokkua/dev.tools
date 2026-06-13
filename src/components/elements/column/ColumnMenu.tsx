'use client';
import React, { JSX } from 'react';

export type AvailableFunction = { name: string; onClick: () => void };

type FunctionActionButtonProps = { availableFunction: AvailableFunction };

const FunctionActionButton: React.FC<FunctionActionButtonProps> = ({ availableFunction }) => {
    const builtId = availableFunction.name.toLowerCase().replace(/\s/g, '-');
    return (
        <button className="func-btn" id={builtId} onClick={availableFunction.onClick}>
            {availableFunction.name}
        </button>
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
