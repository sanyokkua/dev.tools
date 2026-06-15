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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });

    const toggleSidebarCollapsed = () => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem('sidebarCollapsed', String(next));
            return next;
        });
    };

    return (
        <AppMainContainer>
            <ApplicationTopBar onMenuOpen={() => setSidebarOpen(true)} sidebarCollapsed={sidebarCollapsed} />
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
