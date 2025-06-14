import AppMainContainer from '@/layout/AppMainContainer';
import AppMainContentContainer from '@/layout/AppMainContentContainer';
import AppSideBarAndContentContainer from '@/layout/AppSideBarAndContentContainer';
import React, { ReactNode } from 'react';
import ApplicationSidebar from './ApplicationSidebar';
import ApplicationTopBar from './ApplicationTopBar';

interface LayoutProps {
    children: ReactNode;
}

const ApplicationLayout: React.FC<LayoutProps> = ({ children }) => {
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

export default ApplicationLayout;
