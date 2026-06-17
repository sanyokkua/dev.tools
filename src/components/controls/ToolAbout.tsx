import { usePage } from '@/contexts/PageContext';
import React, { ReactNode, useEffect, useRef } from 'react';

interface ToolAboutProps {
    routeKey: string;
    title: string;
    children: ReactNode;
}

const ToolAbout: React.FC<ToolAboutProps> = ({ routeKey, title, children }) => {
    const { helpVisible, setHelpVisible } = usePage();
    const didMount = useRef(false);

    // On mount (or routeKey change): read persisted state; default to false (hidden).
    useEffect(() => {
        didMount.current = false;
        try {
            const saved = localStorage.getItem(`toolAbout:${routeKey}`);
            setHelpVisible(saved === 'true');
        } catch {
            // localStorage unavailable (SSR or private mode)
            setHelpVisible(false);
        }
    }, [routeKey, setHelpVisible]);

    // Persist state to localStorage whenever it changes, but skip the initial mount.
    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true;
            return;
        }
        try {
            localStorage.setItem(`toolAbout:${routeKey}`, String(helpVisible));
        } catch {
            // localStorage unavailable
        }
    }, [helpVisible, routeKey]);

    const toggle = (): void => {
        setHelpVisible(!helpVisible);
    };

    return (
        <div className={`tool-about${helpVisible ? ' tool-about--open' : ''}`} data-testid="tool-about">
            <button
                className="tool-about__header"
                onClick={toggle}
                aria-expanded={helpVisible}
                aria-controls={`tool-about-body-${routeKey}`}
            >
                <span className="tool-about__arrow" aria-hidden="true">
                    {helpVisible ? '▾' : '▸'}
                </span>
                <span className="tool-about__title">{title}</span>
            </button>
            {helpVisible && (
                <div className="tool-about__body" id={`tool-about-body-${routeKey}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default ToolAbout;
