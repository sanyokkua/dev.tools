'use client';
import Link from 'next/link';
import React from 'react';

export type AppBarProps = {
    appTitle: string;
    pageTitle: string;
    theme?: 'light' | 'dark';
    onThemeToggle?: () => void;
    onMenuOpen?: () => void;
    sidebarCollapsed?: boolean;
};

const Appbar: React.FC<AppBarProps> = ({ appTitle, pageTitle, theme, onThemeToggle, onMenuOpen, sidebarCollapsed }) => {
    return (
        <header className="topbar">
            <button
                className={'icon-btn menu-btn' + (sidebarCollapsed ? ' menu-btn--visible' : '')}
                onClick={onMenuOpen}
                aria-label="Open navigation"
            >
                ☰
            </button>
            <Link href="/" className="topbar-brand">
                <div className="topbar-logo">⌘</div>
                {appTitle}
            </Link>
            {pageTitle && (
                <div className="topbar-crumb">
                    <span>/</span>
                    <b>{pageTitle}</b>
                </div>
            )}
            <div className="topbar-actions">
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
                    ↗
                </a>
            </div>
        </header>
    );
};

export default Appbar;
