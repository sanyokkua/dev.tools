'use client';
import React, { ReactNode } from 'react';

export interface RoundedContainerProps {
    children: ReactNode;
}

const RoundedContainer: React.FC<RoundedContainerProps> = ({ children }) => {
    return <div className={'rounded-paper'}>{children}</div>;
};

export default RoundedContainer;
