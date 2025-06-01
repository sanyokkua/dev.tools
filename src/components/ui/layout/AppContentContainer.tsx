import React, { ReactNode } from 'react';

interface AppContentContainerProps {
    children: ReactNode;
}

const AppContentContainer: React.FC<AppContentContainerProps> = ({ children }) => {
    return <div className="layoutContentConfig layoutContentStyle">{children}</div>;
};

export default AppContentContainer;
