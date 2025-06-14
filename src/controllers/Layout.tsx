import AppMainContentContainer from '@/layout/AppMainContentContainer';
import AppSideBarAndContentContainer from '@/layout/AppSideBarAndContentContainer';
import React, { ReactNode } from 'react';
import AppMainContainer from '../custom-components/layout/AppMainContainer';
import ApplicationSidebar from './ApplicationSidebar';
import ApplicationTopBar from './ApplicationTopBar';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <AppMainContainer>
            {/* Top Menu Bar */}
            <ApplicationTopBar />

            {/* Main Area: Sidebar + Content */}
            <AppSideBarAndContentContainer>
                <ApplicationSidebar />
                <AppMainContentContainer colorStyle="surface-color">{children}</AppMainContentContainer>
            </AppSideBarAndContentContainer>
        </AppMainContainer>
    );
};

export default Layout;
