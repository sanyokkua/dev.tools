'use client';
import React, { ReactNode, useEffect, useState } from 'react';
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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        setSidebarCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
    }, []);

    const persistCollapsed = (value: boolean) => {
        setSidebarCollapsed(value);
        localStorage.setItem('sidebarCollapsed', String(value));
    };

    const toggleSidebarCollapsed = () => {
        persistCollapsed(!sidebarCollapsed);
    };

    const handleMenuOpen = () => {
        if (sidebarCollapsed) {
            // On desktop: un-collapse the sidebar instead of opening a mobile drawer
            persistCollapsed(false);
            return;
        }
        setSidebarOpen(true);
    };

    return (
        <AppMainContainer>
            <ApplicationTopBar onMenuOpen={handleMenuOpen} sidebarCollapsed={sidebarCollapsed} />
            <AppSideBarAndContentContainer>
                <ApplicationSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={toggleSidebarCollapsed}
                />
                <AppMainContentContainer colorStyle="surface-color">{children}</AppMainContentContainer>
            </AppSideBarAndContentContainer>
        </AppMainContainer>
    );
};

export default ApplicationLayout;
