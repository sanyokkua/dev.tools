'use client';
import Link from 'next/link';
import React from 'react';

export type AppBarProps = {
    appTitle: string;
    pageTitle: string;
    theme?: 'light' | 'dark';
    onThemeToggle?: () => void;
    onMenuOpen?: () => void;
    onLogoClick?: () => void;
    sidebarCollapsed?: boolean;
    helpVisible?: boolean;
    onToggleHelp?: () => void;
};

const Appbar: React.FC<AppBarProps> = ({
    appTitle,
    pageTitle,
    theme,
    onThemeToggle,
    onMenuOpen,
    onLogoClick,
    sidebarCollapsed,
    helpVisible,
    onToggleHelp,
}) => {
    return (
        <header className="topbar">
            <button
                className={'icon-btn menu-btn' + (sidebarCollapsed ? ' menu-btn--visible' : '')}
                onClick={onMenuOpen}
                aria-label="Open navigation"
            >
                ☰
            </button>
            <button className="topbar-logo icon-btn" onClick={onLogoClick} aria-label="Toggle sidebar">
                ⌘
            </button>
            <Link href="/" className="topbar-brand">
                {appTitle}
            </Link>
            {pageTitle && (
                <div className="topbar-crumb">
                    <span>/</span>
                    <b>{pageTitle}</b>
                </div>
            )}
            <div className="topbar-actions">
                {onToggleHelp && (
                    <button
                        className={`icon-btn${helpVisible ? ' icon-btn--active' : ''}`}
                        onClick={onToggleHelp}
                        aria-label="Toggle tool info"
                        aria-pressed={helpVisible}
                    >
                        ℹ
                    </button>
                )}
                <button className="icon-btn" onClick={onThemeToggle} aria-label="Toggle theme">
                    {theme === 'dark' ? '☀' : '🌙'}
                </button>
                <a
                    className="icon-btn"
                    href="https://github.com/sanyokkua/dev.tools"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Source on GitHub"
                >
                    GitHub ↗
                </a>
            </div>
        </header>
    );
};

export default Appbar;
