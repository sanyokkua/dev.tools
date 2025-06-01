import React, { ReactNode } from 'react';

interface ColumnContainerProps {
    children: ReactNode;
}

const ColumnContainer: React.FC<ColumnContainerProps> = ({ children }) => {
    return <div className="columnContainer">{children}</div>;
};

export default ColumnContainer;
