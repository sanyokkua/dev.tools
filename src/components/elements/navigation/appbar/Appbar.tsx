'use client';
import React, { MouseEvent } from 'react';

export type AppBarProps = {
    appTitle: string;
    pageTitle: string;
    onAppTitleClick?: () => void;
    onPageTitleClick?: () => void;
};

const Appbar: React.FC<AppBarProps> = (props) => {
    const onAppTitleClick = (event: MouseEvent) => {
        if (props.onAppTitleClick) {
            event.preventDefault();
            props.onAppTitleClick();
        }
    };
    const onPageTitleClick = (event: MouseEvent) => {
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

            {/* Right Column: Empty element for spacing */}
            <div className="app-bar-spacing-stub" />
        </nav>
    );
};

export default Appbar;
