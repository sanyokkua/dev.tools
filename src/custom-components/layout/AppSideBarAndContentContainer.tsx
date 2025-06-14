import React, { ReactNode } from 'react';

interface AppSideBarAndContentContainerProps {
    children: ReactNode;
}

const AppSideBarAndContentContainer: React.FC<AppSideBarAndContentContainerProps> = ({ children }) => {
    return <div className="app-sidebar-and-content-container">{children}</div>;
};

export default AppSideBarAndContentContainer;
