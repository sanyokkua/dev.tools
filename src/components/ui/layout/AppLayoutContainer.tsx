import React, { ReactNode } from 'react';

interface AppLayoutContainerProps {
    children: ReactNode;
}

const AppLayoutContainer: React.FC<AppLayoutContainerProps> = ({ children }) => {
    return <div className="layoutAppContainer">{children}</div>;
};

export default AppLayoutContainer;
