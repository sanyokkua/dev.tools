import React, { ReactNode } from 'react';

interface AppMainContainerProps {
    children: ReactNode;
}

const AppMainContainer: React.FC<AppMainContainerProps> = ({ children }) => {
    return <div className="app-main-container">{children}</div>;
};

export default AppMainContainer;
