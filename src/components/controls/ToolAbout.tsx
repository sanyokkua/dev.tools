import React, { ReactNode, useEffect, useState } from 'react';

interface ToolAboutProps {
    routeKey: string;
    title: string;
    children: ReactNode;
}

const ToolAbout: React.FC<ToolAboutProps> = ({ routeKey, title, children }) => {
    const [open, setOpen] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(`toolAbout:${routeKey}`);
            if (saved === 'false') {
                setOpen(false);
            }
        } catch {
            // localStorage unavailable (SSR or private mode)
        }
        setMounted(true);
    }, [routeKey]);

    const toggle = (): void => {
        const next = !open;
        setOpen(next);
        try {
            localStorage.setItem(`toolAbout:${routeKey}`, String(next));
        } catch {
            // localStorage unavailable
        }
    };

    return (
        <div className={`tool-about${open ? ' tool-about--open' : ''}`} data-testid="tool-about">
            <button
                className="tool-about__header"
                onClick={toggle}
                aria-expanded={open}
                aria-controls={`tool-about-body-${routeKey}`}
            >
                <span className="tool-about__arrow" aria-hidden="true">
                    {open ? '▾' : '▸'}
                </span>
                <span className="tool-about__title">{title}</span>
            </button>
            {(open || !mounted) && (
                <div className="tool-about__body" id={`tool-about-body-${routeKey}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default ToolAbout;
