'use client';
import React, { ReactNode } from 'react';

export interface ContentContainerGridChildProps {
    children: ReactNode;
}

const ScrollableContentContainer: React.FC<ContentContainerGridChildProps> = ({ children }) => {
    return <div className="scrollable-container">{children}</div>;
};

export default ScrollableContentContainer;
