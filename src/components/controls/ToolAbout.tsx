import { usePage } from '@/contexts/PageContext';
import React, { ReactNode, useEffect, useRef } from 'react';

interface ToolAboutProps {
    routeKey: string;
    title?: string;
    children: ReactNode;
}

const ToolAbout: React.FC<ToolAboutProps> = ({ routeKey, children }) => {
    const { helpVisible, setHelpVisible, setHasToolAbout } = usePage();
    const didMount = useRef(false);

    // Register presence so the App Bar info button only shows when a panel is mounted.
    useEffect(() => {
        setHasToolAbout(true);
        return () => setHasToolAbout(false);
    }, [setHasToolAbout]);

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

    if (!helpVisible) return null;

    return (
        <div className="tool-about" data-testid="tool-about">
            <div className="tool-about__body">{children}</div>
        </div>
    );
};

export default ToolAbout;
