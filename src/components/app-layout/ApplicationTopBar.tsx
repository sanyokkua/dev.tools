'use client';
import { usePage } from '@/contexts/PageContext';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import Appbar from '../elements/navigation/appbar/Appbar';

interface TopBarProps {
    onMenuOpen: () => void;
}

const ApplicationTopBar: React.FC<TopBarProps> = ({ onMenuOpen }) => {
    const { pageTitle } = usePage();
    const { theme, toggleTheme } = useTheme();

    return (
        <Appbar
            appTitle={'dev.tools'}
            pageTitle={pageTitle}
            theme={theme}
            onThemeToggle={toggleTheme}
            onMenuOpen={onMenuOpen}
        />
    );
};

export default ApplicationTopBar;
