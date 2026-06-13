import React, { ReactNode } from 'react';

interface PageShellProps {
    children: ReactNode;
}

const PageShell: React.FC<PageShellProps> = ({ children }) => {
    return <div className="page-shell">{children}</div>;
};

export default PageShell;
