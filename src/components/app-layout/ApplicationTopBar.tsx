'use client';
import { usePage } from '@/contexts/PageContext';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import Appbar from '../elements/navigation/appbar/Appbar';

const ApplicationTopBar: React.FC = () => {
    const { pageTitle } = usePage();
    const { theme, toggleTheme } = useTheme();

    return <Appbar appTitle={'dev.tools'} pageTitle={pageTitle} theme={theme} onThemeToggle={toggleTheme} />;
};

export default ApplicationTopBar;
