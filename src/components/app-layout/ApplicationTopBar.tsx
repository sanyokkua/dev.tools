'use client';
import { usePage } from '@/contexts/PageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/router';
import React from 'react';
import Appbar from '../elements/navigation/appbar/Appbar';

const ApplicationTopBar: React.FC = () => {
    const { pageTitle } = usePage();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();

    const onAppTitleClick = (): void => {
        router.push('/').catch((err: unknown) => {
            console.error(err);
        });
    };

    return (
        <Appbar
            appTitle={'Developer Utils'}
            pageTitle={pageTitle}
            theme={theme}
            onAppTitleClick={onAppTitleClick}
            onThemeToggle={toggleTheme}
        />
    );
};

export default ApplicationTopBar;
