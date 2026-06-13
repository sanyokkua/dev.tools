'use client';
import React, { ReactNode, useState } from 'react';
import AppMainContainer from '../layouts/AppMainContainer';
import AppMainContentContainer from '../layouts/AppMainContentContainer';
import AppSideBarAndContentContainer from '../layouts/AppSideBarAndContentContainer';
import ApplicationSidebar from './ApplicationSidebar';
import ApplicationTopBar from './ApplicationTopBar';

interface LayoutProps {
    children: ReactNode;
}

const ApplicationLayout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <AppMainContainer>
            <ApplicationTopBar onMenuOpen={() => setSidebarOpen(true)} />
            <AppSideBarAndContentContainer>
                <ApplicationSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <AppMainContentContainer colorStyle="surface-color">{children}</AppMainContentContainer>
            </AppSideBarAndContentContainer>
        </AppMainContainer>
    );
};

export default ApplicationLayout;
