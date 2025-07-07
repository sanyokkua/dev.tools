'use client';
import React, { ReactElement } from 'react';
import ContentContainerGridChild, { ContentContainerGridChildProps } from './ContentContainerGridChild';

interface ContentContainerGridProps {
    children:
        | ReactElement<ContentContainerGridChildProps, typeof ContentContainerGridChild>
        | ReactElement<ContentContainerGridChildProps, typeof ContentContainerGridChild>[];
}

const ContentContainerGrid: React.FC<ContentContainerGridProps> = ({ children }) => {
    return <div className="content-container-grid">{children}</div>;
};

export default ContentContainerGrid;
