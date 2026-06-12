'use client';
import React, { MouseEvent } from 'react';

export type AppBarProps = {
    appTitle: string;
    pageTitle: string;
    theme?: 'light' | 'dark';
    onAppTitleClick?: () => void;
    onPageTitleClick?: () => void;
    onThemeToggle?: () => void;
};

const Appbar: React.FC<AppBarProps> = (props) => {
    const onAppTitleClick = (event: MouseEvent): void => {
        if (props.onAppTitleClick) {
            event.preventDefault();
            props.onAppTitleClick();
        }
    };
    const onPageTitleClick = (event: MouseEvent): void => {
        if (props.onPageTitleClick) {
            event.preventDefault();
            props.onPageTitleClick();
        }
    };
    return (
        <nav className="app-bar">
            {/* Left Column: App Name */}
            <a href="#" className="app-bar-title-link" onClick={onAppTitleClick}>
                {props.appTitle}
            </a>

            {/* Center Column: Current Page Title */}
            <div className="app-bar-page-title" onClick={onPageTitleClick}>
                {props.pageTitle}
            </div>

            {/* Right Column: Theme toggle */}
            <div className="app-bar-actions">
                <button className="app-bar-theme-toggle" onClick={props.onThemeToggle} aria-label="Toggle theme">
                    {props.theme === 'dark' ? '☀' : '☾'}
                </button>
            </div>
        </nav>
    );
};

export default Appbar;
