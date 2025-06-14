import React, { ReactNode } from 'react';

interface ContentContainerFlexProps {
    children: ReactNode;
}

const ContentContainerFlex: React.FC<ContentContainerFlexProps> = ({ children }) => {
    return <div className="content-container-flex">{children}</div>;
};

export default ContentContainerFlex;
