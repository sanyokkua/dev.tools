import React, { ReactNode } from 'react';

export interface ContentContainerGridChildProps {
    children: ReactNode;
}

const ContentContainerGridChild: React.FC<ContentContainerGridChildProps> = ({ children }) => {
    return <div className="content-container-grid-child">{children}</div>;
};

export default ContentContainerGridChild;
