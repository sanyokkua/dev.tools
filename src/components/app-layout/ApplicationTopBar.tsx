'use client';
import { usePage } from '@/contexts/PageContext';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import Appbar from '../elements/navigation/appbar/Appbar';

interface TopBarProps {
    onMenuOpen: () => void;
    onLogoClick?: () => void;
    sidebarCollapsed?: boolean;
}

const ApplicationTopBar: React.FC<TopBarProps> = ({ onMenuOpen, onLogoClick, sidebarCollapsed }) => {
    const { pageTitle, helpVisible, setHelpVisible, hasToolAbout } = usePage();
    const { theme, toggleTheme } = useTheme();

    return (
        <Appbar
            appTitle={'dev.tools'}
            pageTitle={pageTitle}
            theme={theme}
            onThemeToggle={toggleTheme}
            onMenuOpen={onMenuOpen}
            onLogoClick={onLogoClick}
            sidebarCollapsed={sidebarCollapsed}
            helpVisible={helpVisible}
            onToggleHelp={pageTitle && hasToolAbout ? (): void => setHelpVisible(!helpVisible) : undefined}
        />
    );
};

export default ApplicationTopBar;
