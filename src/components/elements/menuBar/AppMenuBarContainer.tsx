import React, { ReactNode } from 'react';

interface AppMenuBarContainerProps {
    children: ReactNode;
}

const AppMenuBarContainer: React.FC<AppMenuBarContainerProps> = ({ children }) => {
    return <ul className="menuBarContainer">{children}</ul>;
};

export default AppMenuBarContainer;
