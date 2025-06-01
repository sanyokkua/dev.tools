import React, { ReactNode } from 'react';

interface AppLayoutSideAndContentProps {
    children: ReactNode;
}

const AppLayoutSideAndContent: React.FC<AppLayoutSideAndContentProps> = ({ children }) => {
    return <div className="layoutContainerSideAndContent">{children}</div>;
};

export default AppLayoutSideAndContent;
