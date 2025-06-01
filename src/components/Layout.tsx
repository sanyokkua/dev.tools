import AppContainer from '@/components/ui/layout/AppContainer';
import AppContentContainer from '@/components/ui/layout/AppContentContainer';
import AppLayoutSideAndContent from '@/components/ui/layout/AppLayoutSideAndContent';
import React, { ReactNode } from 'react';
import MenuBar from './MenuBar';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <AppContainer>
            {/* Top Menu Bar */}
            <MenuBar />

            {/* Main Area: Sidebar + Content */}
            <AppLayoutSideAndContent>
                <Sidebar />
                <AppContentContainer>{children}</AppContentContainer>
            </AppLayoutSideAndContent>
        </AppContainer>
    );
};

export default Layout;
