'use client';
import React, { ReactNode } from 'react';

export interface HorizontalContainerProps {
    children: ReactNode;
}

const HorizontalContainer: React.FC<HorizontalContainerProps> = ({ children }) => {
    return <div className={'horizontal-container'}>{children}</div>;
};

export default HorizontalContainer;
